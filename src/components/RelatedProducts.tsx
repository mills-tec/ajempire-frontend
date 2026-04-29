"use client";
import React, { useEffect, useRef, useState, useTransition } from "react";
import ProductItem from "./ProductItem";
import Skeleton from "./Skeleton";
import EndlessScrollLoading from "./EndlessScrollLoading";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { getRelatedProducts } from "@/lib/api";
import { ITEMS_TO_APPEND, shuffleArray } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function RelatedProducts({ category }: { category: string }) {
  const queryClient = useQueryClient();

  const [cursor, setCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(true);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const originalProductsRef = useRef<Product[]>([]);
  const prevProductCountRef = useRef<number>(0);

  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isPending, startDuplicateTransition] = useTransition();

  /*
   * INITIAL FETCH
   */
  const { data, isLoading } = useQuery(
    ["relatedProducts", category],
    () => getRelatedProducts(category, `limit=${ITEMS_TO_APPEND}`),
    {
      enabled: !!category,
      onSuccess: (res) => {
        setCursor(res?.nextCursor || "");
        setHasNextPage(res?.hasMore ?? false);
        originalProductsRef.current = res?.products ?? [];
        prevProductCountRef.current = res?.products?.length ?? 0;
      },
    },
  );

  // Detect when cache gets REPLACED by refresh (product count drops back to first page size)
  // This is the key fix — when RefreshWrapper sets fresh data, reset scroll state
  useEffect(() => {
    if (!data?.products) return;

    const currentCount = data.products.length;
    const prevCount = prevProductCountRef.current;

    // If count dropped or stayed same as first page — cache was replaced by refresh
    if (prevCount > ITEMS_TO_APPEND && currentCount <= ITEMS_TO_APPEND) {
      setCursor(data.nextCursor ?? "");
      setHasNextPage(data.hasMore ?? true);
      originalProductsRef.current = data.products;
    }

    prevProductCountRef.current = currentCount;
  }, [data?.products?.length]);

  /*
   * APPEND HELPER
   */
  const appendProducts = (newProducts: Product[]) => {
    queryClient.setQueryData(
      ["relatedProducts", category],
      (
        oldData:
          | { products?: Product[]; nextCursor?: string; hasMore?: boolean }
          | undefined,
      ) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          products: [...(oldData.products ?? []), ...newProducts],
        };
      },
    );
  };

  /*
   * API INFINITE SCROLL
   */
  const [infiniteRef] = useInfiniteScroll({
    loading: false,
    hasNextPage,
    disabled: Boolean(isLoading),
    onLoadMore: async () => {
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

  /*
   * OBSERVE LAST ITEM — trigger duplication when API is exhausted
   */
  useEffect(() => {
    if (hasNextPage) return;
    if (!lastItemRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isDuplicating) {
          setIsDuplicating(true);
        }
      },
      { root: null, rootMargin: "300px", threshold: 0 },
    );

    observer.observe(lastItemRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isDuplicating]);

  /*
   * DUPLICATION — shuffles original set and appends
   */
  useEffect(() => {
    if (!isDuplicating) return;
    if (!originalProductsRef.current.length) return;

    startDuplicateTransition(() => {
      appendProducts(shuffleArray([...originalProductsRef.current]));
    });
    setIsDuplicating(false);
  }, [isDuplicating]);

  const products: Product[] = data?.products ?? [];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-2 lg:gap-6">
      {products.map((product, index) => (
        <div
          key={`${product._id}-${index}`}
          ref={
            !hasNextPage && index === products.length - 1 ? lastItemRef : null
          }
        >
          <ProductItem product={product} index={index} />
        </div>
      ))}

      {isPending &&
        [...Array(ITEMS_TO_APPEND)].map((_, i) => (
          <Skeleton key={`dup-skeleton-${i}`} />
        ))}

      <EndlessScrollLoading
        infiniteRef={infiniteRef}
        hasNextPage={hasNextPage}
      />
    </div>
  );
}
