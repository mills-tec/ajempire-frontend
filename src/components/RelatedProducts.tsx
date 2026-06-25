"use client";

import BannerPlaceholder from "@/app/components/BannerPlaceholder";
import { getRelatedProducts } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ITEMS_TO_APPEND, shuffleArray } from "@/lib/utils";
import { useEffect, useRef } from "react";
import EndlessScrollLoading from "./EndlessScrollLoading";
import { InfiniteFeed } from "./InfinteScrollList";
import ProductItem from "./ProductItem";
import Skeleton from "./Skeleton";

export default function RelatedProducts({ category }: { category: string }) {
  const blockLoadRef = useRef(false);

  // Keep the scroll-to-top blocker so InfiniteFeed respects it
  useEffect(() => {
    const onScrollToTop = () => {
      blockLoadRef.current = true;
      setTimeout(() => (blockLoadRef.current = false), 800);
    };
    window.addEventListener("scroll-to-top-start", onScrollToTop);
    return () =>
      window.removeEventListener("scroll-to-top-start", onScrollToTop);
  }, []);

  // Wrap the API to return the shape InfiniteFeed expects: { items, nextCursor, hasMore }
  const relatedQueryFn = async (cursor: string) => {
    const res = await getRelatedProducts(
      category,
      `limit=${ITEMS_TO_APPEND}&cursor=${cursor}`
    );
    return {
      items: res?.products ?? [],
      nextCursor: res?.nextCursor,
      hasMore: res?.hasMore ?? !!res?.nextCursor,
    };
  };

  return (
    <div className="space-y-6">
      <BannerPlaceholder />

      <InfiniteFeed<Product>
        queryKey={["related-products", category]}
        queryFn={relatedQueryFn}
        getItemId={(p) => String(p._id)}
        renderItem={(product, index) => (
          <ProductItem product={product} index={index} />
        )}
        skeletonComponent={<Skeleton />}
        endlessLoaderComponent={(ref) => (
          <EndlessScrollLoading infiniteRef={ref} hasNextPage={true} />
        )}
        shuffle={shuffleArray}
        staleTime={Infinity}
        scrollRestorationKey="related-scroll-y"
        gridClassName="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-2 lg:gap-6"
        blockLoadMoreRef={blockLoadRef}
      />
    </div>
  );
}