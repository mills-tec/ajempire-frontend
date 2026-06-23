"use client";
import EndlessScrollLoading from "@/components/EndlessScrollLoading";
import ProductItem from "@/components/ProductItem";
import Skeleton from "@/components/Skeleton";
import { getExploreInterest } from "@/lib/api";
import { Product } from "@/lib/types";
import { ITEMS_TO_APPEND, shuffleArray } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import BannerPlaceholder from "./BannerPlaceholder";

interface ExploreInterestResponse {
  products: Product[];
  nextCursor?: string;
  hasMore: boolean;
}

const EMPTY_PRODUCTS: Product[] = [];
const EMPTY_RESPONSE: ExploreInterestResponse = {
  products: [],
  nextCursor: undefined,
  hasMore: false,
};

export default function ExploreInterest() {
  const blockLoadRef = useRef(false);
  const recycleObserverActive = useRef(false);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  const [recycledProducts, setRecycledProducts] = useState<Product[]>([]);
  const [isAppending, setIsAppending] = useState(false);

  // ── Infinite query ───────────────────────────────────────────────────────────
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useInfiniteQuery<ExploreInterestResponse, Error>({
    queryKey: ["exploreInterest"],
    queryFn: ({ pageParam = "" }: { pageParam?: string }) =>
      getExploreInterest(ITEMS_TO_APPEND, pageParam as string).then(
        (res) => res ?? EMPTY_RESPONSE
      ),
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    staleTime: Infinity,
  });

  const products = useMemo(
    () =>
      data?.pages.flatMap((page) => page.products ?? []) ?? EMPTY_PRODUCTS,
    [data?.pages]
  );

  const isRefetching = isFetching && !isFetchingNextPage;

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

  // ── Recycle-append IntersectionObserver ─────────────────────────────────────
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

  // ── useInfiniteScroll hook ───────────────────────────────────────────────────
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
    <section className="px-6">
      <div className="font-poppins py-10 space-y-5">
        <h1 className="text-2xl font-poppins">Explore Interest</h1>
      </div>

      <div className="mb-6">
        <BannerPlaceholder />
      </div>

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
              No products available.
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
    </section>
  );
}