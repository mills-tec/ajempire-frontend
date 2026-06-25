"use client";

import EndlessScrollLoading from "@/components/EndlessScrollLoading";
import { InfiniteFeed } from "@/components/InfinteScrollList";
import ProductItem from "@/components/ProductItem";
import Skeleton from "@/components/Skeleton";
import { getExploreInterest } from "@/lib/api";
import { Product } from "@/lib/types";
import { ITEMS_TO_APPEND, shuffleArray } from "@/lib/utils";
import { useEffect, useRef } from "react";
import BannerPlaceholder from "./BannerPlaceholder";

export default function ExploreInterest() {
  const blockLoadRef = useRef(false);

  // ── Block infinite scroll during scroll-to-top ───────────────────────────
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
  const exploreQueryFn = async (cursor: string) => {
    const res = await getExploreInterest(ITEMS_TO_APPEND, cursor);
    return {
      items: res?.products ?? [],
      nextCursor: res?.nextCursor,
      hasMore: res?.hasMore ?? !!res?.nextCursor,
    };
  };

  return (
    <section className="px-6">
      <div className="font-poppins py-10 space-y-5">
        <h1 className="text-2xl font-poppins">Explore Interest</h1>
      </div>

      <div className="mb-6">
        <BannerPlaceholder />
      </div>

      <InfiniteFeed<Product>
        queryKey={["explore-interest"]}
        queryFn={exploreQueryFn}
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
        scrollRestorationKey="explore-interest-scroll-y"
        gridClassName="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-2 lg:gap-6"
        blockLoadMoreRef={blockLoadRef}
      />
    </section>
  );
}