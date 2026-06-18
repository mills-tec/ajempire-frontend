"use client";
import BannerPlaceholder from "@/app/components/BannerPlaceholder";
import { getRelatedProducts } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ITEMS_TO_APPEND, shuffleArray } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import EndlessScrollLoading from "./EndlessScrollLoading";
import ProductItem from "./ProductItem";
import Skeleton from "./Skeleton";

const MAX_ACCUMULATED = 300;

export default function RelatedProducts({ category }: { category: string }) {
  const queryClient = useQueryClient();

  const [cursor, setCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(true);
  const originalProductsRef = useRef<Product[]>([]);
  const prevProductCountRef = useRef<number>(0);
  const recycleObserverActive = useRef(false);
  const blockLoadRef = useRef(false);

  const [isAppending, setIsAppending] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["relatedProducts", category],
    queryFn: () => getRelatedProducts(category, `limit=${ITEMS_TO_APPEND}`),
    enabled: !!category,
  });

  const products: Product[] = data?.products ?? [];

  // ── Scroll restoration ───────────────────────────────────────────────────────
  const scrollRestored = useRef(false);
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
      setTimeout(() => {
        blockLoadRef.current = false;
      }, 800);
    };
    window.addEventListener("scroll-to-top-start", onScrollToTop);
    return () =>
      window.removeEventListener("scroll-to-top-start", onScrollToTop);
  }, []);

  // ── Initialize / reset on data change ────────────────────────────────────────
  useEffect(() => {
    if (!data?.products) return;
    const currentCount = data.products.length;
    const prevCount = prevProductCountRef.current;

    if (prevCount === 0) {
      // First load
      setCursor(data.nextCursor || "");
      setHasNextPage(data.hasMore ?? false);
      originalProductsRef.current = data.products;
    } else if (prevCount > ITEMS_TO_APPEND && currentCount <= ITEMS_TO_APPEND) {
      // Cache was replaced by a refresh — reset scroll state
      setCursor(data.nextCursor ?? "");
      setHasNextPage(data.hasMore ?? true);
      originalProductsRef.current = data.products;
      scrollRestored.current = false;
    }

    prevProductCountRef.current = currentCount;
  }, [data?.products?.length]);

  const appendProducts = useCallback((newProducts: Product[]) => {
    queryClient.setQueryData(
      ["relatedProducts", category],
      (
        oldData:
          | { products?: Product[]; nextCursor?: string; hasMore?: boolean }
          | undefined,
      ) => {
        if (!oldData) return oldData;
        const combined = [...(oldData.products ?? []), ...newProducts];
        const trimmed =
          combined.length > MAX_ACCUMULATED
            ? combined.slice(combined.length - MAX_ACCUMULATED)
            : combined;
        return {
          ...oldData,
          products: trimmed,
        };
      },
    );
  }, [queryClient, category]);

  // ── Real API pagination ──────────────────────────────────────────────────────
  const [infiniteRef] = useInfiniteScroll({
    loading: isLoading,
    hasNextPage,
    disabled: Boolean(isLoading),
    onLoadMore: async () => {
      if (blockLoadRef.current) return;
      try {
        const newData = await getRelatedProducts(
          category,
          `limit=${ITEMS_TO_APPEND}&cursor=${cursor}`,
        );
        appendProducts(newData?.products || []);
        setCursor(newData?.nextCursor || "");
        setHasNextPage(newData?.hasMore ?? false);
      } catch (err) {
        console.error("Error loading related products:", err);
      }
    },
  });

  // ── Recycle-append when API is exhausted ─────────────────────────────────────
  // Use a callback ref so we always observe the CURRENT last element
  const setLastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (hasNextPage || !node || recycleObserverActive.current) return;

      recycleObserverActive.current = true;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          recycleObserverActive.current = false;

          if (blockLoadRef.current) return;
          if (!originalProductsRef.current.length) return;

          const nextBatch = shuffleArray([
            ...originalProductsRef.current,
          ]).slice(0, ITEMS_TO_APPEND);
          if (nextBatch.length === 0) return;

          setIsAppending(true);
          appendProducts(nextBatch);
          setTimeout(() => setIsAppending(false), 0);
        },
        { rootMargin: "300px", threshold: 0 },
      );
      observer.observe(node);

      // Cleanup previous observer on this node when ref changes
      return () => {
        observer.unobserve(node);
        recycleObserverActive.current = false;
      };
    },
    [hasNextPage, appendProducts],
  );

  return (
    <div className="space-y-6">
      <BannerPlaceholder />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-2 lg:gap-6">
        {products.map((product, index) => (
          <div
            key={`${product._id}-${index}`}
            ref={
              !hasNextPage && index === products.length - 1
                ? setLastItemRef
                : null
            }
          >
            <ProductItem product={product} index={index} />
          </div>
        ))}

        {isAppending &&
          [...Array(ITEMS_TO_APPEND)].map((_, i) => (
            <Skeleton key={`append-skeleton-${i}`} />
          ))}

        {/* Only show EndlessScrollLoading during real API pagination */}
        {hasNextPage && (
          <EndlessScrollLoading
            infiniteRef={infiniteRef}
            hasNextPage={hasNextPage}
          />
        )}
      </div>

      {/* Empty state when truly exhausted and nothing to show */}
      {!isLoading && !hasNextPage && products.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-10">
          No related products available.
        </p>
      )}
    </div>
  );
}