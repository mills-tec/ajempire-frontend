"use client";
import BannerPlaceholder from "@/app/components/BannerPlaceholder";
import { getRelatedProducts } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ITEMS_TO_APPEND, shuffleArray } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, useTransition } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import EndlessScrollLoading from "./EndlessScrollLoading";
import ProductItem from "./ProductItem";
import Skeleton from "./Skeleton";

const MAX_ACCUMULATED = 300;

export default function RelatedProducts({ category }: { category: string }) {
  const queryClient = useQueryClient();

  const [cursor, setCursor] = useState("");
  const [hasNextPage, setHasNextPage] = useState(true);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const originalProductsRef = useRef<Product[]>([]);
  const prevProductCountRef = useRef<number>(0);

  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isPending, startDuplicateTransition] = useTransition();
  const blockLoadRef = useRef(false);

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

  // v5 object syntax
  const { data, isLoading } = useQuery({
    queryKey: ["relatedProducts", category],
    queryFn: () => getRelatedProducts(category, `limit=${ITEMS_TO_APPEND}`),
    enabled: !!category,
  });

  // onSuccess replacement — runs when data first arrives
  useEffect(() => {
    if (!data?.products) return;
    const currentCount = data.products.length;
    const prevCount = prevProductCountRef.current;

    if (prevCount === 0) {
      // First load — initialise everything
      setCursor(data.nextCursor || "");
      setHasNextPage(data.hasMore ?? false);
      originalProductsRef.current = data.products;
    } else if (prevCount > ITEMS_TO_APPEND && currentCount <= ITEMS_TO_APPEND) {
      // Cache was replaced by a refresh — reset scroll state
      setCursor(data.nextCursor ?? "");
      setHasNextPage(data.hasMore ?? true);
      originalProductsRef.current = data.products;
    }

    prevProductCountRef.current = currentCount;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.products?.length]);

  const appendProducts = (newProducts: Product[]) => {
    queryClient.setQueryData(
      ["relatedProducts", category],
      (
        oldData:
          | { products?: Product[]; nextCursor?: string; hasMore?: boolean }
          | undefined,
      ) => {
        if (!oldData) return oldData;
        const combined = [...(oldData.products ?? []), ...newProducts];
        // Hard cap — trim from the front so memory stays bounded
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
  };

  // API infinite scroll
  const [infiniteRef] = useInfiniteScroll({
    loading: false,
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

  // Observe last item — trigger duplication only when API is exhausted
  useEffect(() => {
    if (hasNextPage) return;
    if (!lastItemRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isDuplicating && !blockLoadRef.current) {
          setIsDuplicating(true);
        }
      },
      { root: null, rootMargin: "300px", threshold: 0 },
    );

    observer.observe(lastItemRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isDuplicating]);

  // Duplication — shuffles a SLICE of the original set, not the full array
  // This is the key fix: we only append ITEMS_TO_APPEND items at a time,
  // and appendProducts() caps the total at MAX_ACCUMULATED anyway.
  useEffect(() => {
    if (!isDuplicating) return;
    if (!originalProductsRef.current.length) return;

    const nextBatch = shuffleArray([...originalProductsRef.current]).slice(
      0,
      ITEMS_TO_APPEND,
    );

    startDuplicateTransition(() => {
      appendProducts(nextBatch);
    });
    setIsDuplicating(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDuplicating]);

  const products: Product[] = data?.products ?? [];


  return (
    <div className="space-y-6">
      <BannerPlaceholder />

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
        {isPending &&
          [...Array(ITEMS_TO_APPEND)].map((_, i) => (
            <Skeleton key={`dup-skeleton-${i}`} />
          ))}

        <EndlessScrollLoading
          infiniteRef={infiniteRef}
          hasNextPage={hasNextPage}
        />
      </div>
        <EndlessScrollLoading
          infiniteRef={infiniteRef}
          hasNextPage={hasNextPage}
        />
      </div>
    </div>
  );
}
