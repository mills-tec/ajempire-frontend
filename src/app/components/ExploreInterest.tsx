"use client";
import EndlessScrollLoading from "@/components/EndlessScrollLoading";
import ProductItem from "@/components/ProductItem";
import Skeleton from "@/components/Skeleton";
import { getExploreInterest } from "@/lib/api";
import { ITEMS_TO_APPEND, shuffleArray } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import BannerPlaceholder from "./BannerPlaceholder";

const MAX_ACCUMULATED = 300;

export default function ExploreInterest() {
  const queryClient = useQueryClient();

  const [cursor, setCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(true);
  const originalProductsRef = useRef<unknown[]>([]);
  const prevProductCountRef = useRef<number>(0);
  const recycleObserverActive = useRef(false);
  const blockLoadRef = useRef(false);

  const [isAppending, setIsAppending] = useState(false);

  /*
   * INITIAL FETCH
   */
  const { data, isLoading } = useQuery({
    queryKey: ["exploreInterest"],
    queryFn: () => getExploreInterest(ITEMS_TO_APPEND, ""),
  });

  const products = useMemo(() => {
    return data?.products ?? [];
  }, [data]);

  /*
   * Initialize / reset on data change
   */
  useEffect(() => {
    if (!data?.products) return;
    const currentCount = data.products.length;
    const prevCount = prevProductCountRef.current;

    if (prevCount === 0) {
      setCursor(data.nextCursor || "");
      setHasNextPage(data.hasMore ?? false);
      originalProductsRef.current = data.products;
    } else if (prevCount > ITEMS_TO_APPEND && currentCount <= ITEMS_TO_APPEND) {
      setCursor(data.nextCursor ?? "");
      setHasNextPage(data.hasMore ?? true);
      originalProductsRef.current = data.products;
    }

    prevProductCountRef.current = currentCount;
  }, [data?.products?.length]);

  /*
   * Block infinite scroll during scroll-to-top
   */
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

  /*
   * Append helper
   */
  const appendProducts = useCallback((newProducts: unknown[]) => {
    queryClient.setQueryData(["exploreInterest"], (oldData: any) => {
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
    });
  }, [queryClient]);

  /*
   * API infinite scroll
   */
  const [infiniteRef] = useInfiniteScroll({
    loading: isLoading,
    hasNextPage,
    disabled: Boolean(isLoading),
    onLoadMore: async () => {
      if (blockLoadRef.current) return;
      try {
        const newData = await getExploreInterest(ITEMS_TO_APPEND, cursor);
        appendProducts(newData?.products || []);
        setCursor(newData?.nextCursor || "");
        setHasNextPage(newData?.hasMore ?? false);
      } catch (err) {
        console.error("Error loading explore interest:", err);
      }
    },
  });

  /*
   * Recycle-append when API is exhausted — callback ref pattern
   */
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

      return () => {
        observer.unobserve(node);
        recycleObserverActive.current = false;
      };
    },
    [hasNextPage, appendProducts],
  );

  return (
    <section className="px-6">
      <div className="font-poppins py-10 space-y-5">
        <h1 className="text-2xl font-poppins">Explore Interest</h1>
      </div>

      <div className="mb-6">
        <BannerPlaceholder />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-2 lg:gap-6">
        {products.map((product, index: number) => (
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

        {hasNextPage && (
          <EndlessScrollLoading
            infiniteRef={infiniteRef}
            hasNextPage={hasNextPage}
          />
        )}
      </div>

      {!isLoading && !hasNextPage && products.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-10">
          No products available.
        </p>
      )}
    </section>
  );
}