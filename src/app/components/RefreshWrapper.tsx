"use client";
import PullToRefresh from "react-simple-pull-to-refresh";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { shuffleArray } from "@/lib/utils";
import { getRelatedProducts } from "@/lib/api";
import { ITEMS_TO_APPEND } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  category?: string; // category id for related products
};

export default function RefreshWrapper({ children, category }: Props) {
  const queryClient = useQueryClient();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const hasTouchScreen =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsMobile(hasTouchScreen);
  }, []);

  const handleRefresh = async () => {
    if (!category) return;

    try {
      // Fetch a fresh first page — same as home page fetches fresh data
      const freshData = await getRelatedProducts(
        category,
        `limit=${ITEMS_TO_APPEND}&t=${Date.now()}`,
      );

      const newProducts = freshData?.products ?? [];
      if (newProducts.length === 0) return;

      const shuffled = shuffleArray([...newProducts]);

      // Set query cache to fresh shuffled first page
      // Keep nextCursor and hasMore from fresh response so infinite scroll continues
      queryClient.setQueryData(["relatedProducts", category], {
        ...freshData,
        products: shuffled,
        nextCursor: freshData?.nextCursor,
        hasMore: freshData?.hasMore,
      });
    } catch (error) {
      console.error("RefreshWrapper error:", error);
    }
  };

  // Desktop — no pull to refresh
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      {children as React.ReactElement}
    </PullToRefresh>
  );
}
