"use client";
import BannerPlaceholder from "@/app/components/BannerPlaceholder";
import { getRelatedProducts } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ITEMS_TO_APPEND, shuffleArray } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import EndlessScrollLoading from "./EndlessScrollLoading";
import ProductItem from "./ProductItem";
import Skeleton from "./Skeleton";

interface RelatedProductsResponse {
  products: Product[];
  nextCursor?: string;
  hasMore: boolean;
}

const EMPTY_PRODUCTS: Product[] = [];
const EMPTY_RESPONSE: RelatedProductsResponse = {
  products: [],
  nextCursor: undefined,
  hasMore: false,
};

export default function RelatedProducts({ category }: { category: string }) {
  const blockLoadRef = useRef(false);
  const recycleObserverActive = useRef(false);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const scrollRestored = useRef(false);

  const [recycledProducts, setRecycledProducts] = useState<Product[]>([]);
  const [isAppending, setIsAppending] = useState(false);

  // ── Infinite query (same pattern as Home) ────────────────────────────────────
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useInfiniteQuery<RelatedProductsResponse, Error>({
    queryKey: ["relatedProducts", category],
    queryFn: ({ pageParam = "" }: { pageParam?: string }) =>
      getRelatedProducts(
        category,
        `limit=${ITEMS_TO_APPEND}&cursor=${pageParam}`
      ).then((res) => res ?? EMPTY_RESPONSE),
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    enabled: !!category,
    staleTime: Infinity,
  });

  const products = useMemo(
    () =>
      data?.pages.flatMap((page) => page.products ?? []) ?? EMPTY_PRODUCTS,
    [data?.pages]
  );

  const isRefetching = isFetching && !isFetchingNextPage;

  // ── Scroll restoration ───────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      sessionStorage.setItem("related-scroll-y", String(window.scrollY));
    };
  }, []);

  useEffect(() => {
    if (isLoading || scrollRestored.current) return;
    const savedY = sessionStorage.getItem("related-scroll-y");
    if (!savedY) return;
    scrollRestored.current = true;
    sessionStorage.removeItem("related-scroll-y");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(savedY, 10));
      });
    });
  }, [isLoading]);

  // ── Block infinite scroll during scroll-to-top ───────────────────────────────
  useEffect(() => {
    const onScrollToTop = () => {
      blockLoadRef.current = true;
      setTimeout(() => (blockLoadRef.current = false), 800);
    };
    window.addEventListener("scroll-to-top-start", onScrollToTop);
    return () =>
      window.removeEventListener("scroll-to-top-start", onScrollToTop);
  }, []);

  // ── Seed recycle list once API is exhausted ──────────────────────────────────
  useEffect(() => {
    if (!hasNextPage && products.length > 0 && recycledProducts.length === 0) {
      setRecycledProducts(products);
    }
  }, [hasNextPage, products, recycledProducts.length]);

  // ── Recycle-append IntersectionObserver ──────────────────────────────────────
  useEffect(() => {
    const shouldObserve = !hasNextPage && recycledProducts.length > 0;
    if (!shouldObserve || recycleObserverActive.current) return;

    const ref = lastItemRef.current;
    if (!ref) return;

    recycleObserverActive.current = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        recycleObserverActive.current = false;

        if (blockLoadRef.current) return;

        const next = shuffleArray([...recycledProducts]);
        if (next.length === 0) return;

        setIsAppending(true);
        setRecycledProducts((prev) => [...prev, ...next]);
        setTimeout(() => setIsAppending(false), 0);
      },
      { rootMargin: "300px", threshold: 0 }
    );
    observer.observe(ref);

    return () => {
      observer.unobserve(ref);
      recycleObserverActive.current = false;
    };
  }, [hasNextPage, recycledProducts]);

  // ── useInfiniteScroll hook — real API pagination ─────────────────────────────
  const [infiniteRef] = useInfiniteScroll({
    loading: isFetchingNextPage,
    hasNextPage: !!hasNextPage,
    onLoadMore: () => {
      if (blockLoadRef.current || isRefetching) return;
      fetchNextPage();
    },
    disabled: !hasNextPage || isRefetching,
    rootMargin: "100px 0px",
  });

  // ── What to render ───────────────────────────────────────────────────────────
  const visibleProducts = hasNextPage ? products : recycledProducts;

  return (
    <div className="space-y-6">
      <BannerPlaceholder />

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-2 lg:gap-6">
          {[...Array(ITEMS_TO_APPEND)].map((_, i) => (
            <Skeleton key={`skeleton-${i}`} />
          ))}
        </div>
      ) : (
        <>
          {visibleProducts.length === 0 && (
            <p className="text-center text-sm text-gray-500 mt-10">
              No related products available.
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-2 lg:gap-6">
            {visibleProducts.map((product, index) => (
              <div
                key={`${product._id}-${index}`}
                ref={
                  index === visibleProducts.length - 1
                    ? hasNextPage
                      ? infiniteRef
                      : lastItemRef
                    : null
                }
              >
                <ProductItem product={product} index={index} />
              </div>
            ))}

            {isFetchingNextPage &&
              [...Array(ITEMS_TO_APPEND)].map((_, i) => (
                <Skeleton key={`fetch-skeleton-${i}`} />
              ))}

            {isAppending &&
              [...Array(ITEMS_TO_APPEND)].map((_, i) => (
                <Skeleton key={`append-skeleton-${i}`} />
              ))}
          </div>

          {hasNextPage && (
            <EndlessScrollLoading
              infiniteRef={infiniteRef}
              hasNextPage={!!hasNextPage}
            />
          )}
        </>
      )}
    </div>
  );
}