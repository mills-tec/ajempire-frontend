"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ProductItem from "./ProductItem";
import Skeleton from "./Skeleton";
import EndlessScrollLoading from "./EndlessScrollLoading";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { getRelatedProducts } from "@/lib/api";
import { ITEMS_TO_APPEND, shuffleArray } from "@/lib/utils";

// const ITEMS_TO_APPEND = 10;

export default function RelatedProducts({ category }: { category: string }) {
  const queryClient = useQueryClient();

  const [cursor, setCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(true);

  const lastItemRef = useRef<HTMLDivElement>(null);

  const [isDuplicating, setIsDuplicating] = useState(false);

  // 👇 SAME PATTERN AS GALLERY
  const originalProductsRef = useRef<any[]>([]);

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
      },
    },
  );

  const products = useMemo(() => {
    return data?.products ?? [];
  }, [data]);

  /*
   * STORE ORIGINAL DATASET ONCE
   */
  useEffect(() => {
    if (data?.products && originalProductsRef.current.length === 0) {
      originalProductsRef.current = data.products;
    }
  }, [data]);

  /*
   * APPEND HELPER
   */
  const appendProducts = (newProducts: any[]) => {
    queryClient.setQueryData(["relatedProducts", category], (oldData: any) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        products: [...(oldData.products ?? []), ...newProducts],
      };
    });
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
   * OBSERVE LAST ITEM
   */
  useEffect(() => {
    if (hasNextPage) return; // only duplicate when API finished
    if (!lastItemRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isDuplicating) {
          setIsDuplicating(true);
        }
      },
      {
        root: null,
        threshold: 0.1,
      },
    );

    observer.observe(lastItemRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isDuplicating]);

  /*
   * DUPLICATION LOGIC (same as gallery)
   */
  useEffect(() => {
    if (!isDuplicating) return;
    if (!originalProductsRef.current.length) return;

    const timer = setTimeout(() => {
      appendProducts(shuffleArray(originalProductsRef.current));
      setIsDuplicating(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [isDuplicating]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-2 lg:gap-6">
      {products.map((product: any, index: number) => (
        <div
          key={index}
          ref={
            !hasNextPage && index === products.length - 1 ? lastItemRef : null
          }
        >
          <ProductItem product={product} index={index} />
        </div>
      ))}

      {/* Skeleton while duplicating */}
      {isDuplicating &&
        [...Array(ITEMS_TO_APPEND)].map((_, i) => (
          <Skeleton key={`dup-skeleton-${i}`} />
        ))}

      {/* API loading */}
      <EndlessScrollLoading
        infiniteRef={infiniteRef}
        hasNextPage={hasNextPage}
      />
    </div>
  );
}
