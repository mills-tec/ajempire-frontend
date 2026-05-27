import React from "react";
import Skeleton from "@/components/ui/Skeleton";

export default function OrderCardSkeleton() {
  return (
    <div className="flex gap-5 border-b pb-3 md:border-b-0">
      <Skeleton width="8.5rem" height="6rem" borderRadius="0.5rem" />
      <div className="space-y-2 mt-2 flex-1">
        <Skeleton height={16} borderRadius={4} className="w-3/5" />
        <Skeleton height={12} borderRadius={4} className="w-2/5" />
        <div className="flex gap-4 w-[200px]">
          <Skeleton height={12} borderRadius={4} className="w-24" />
          <Skeleton height={12} borderRadius={4} className="w-12" />
          <Skeleton height={12} borderRadius={4} className="w-8 ml-auto" />
        </div>
      </div>
    </div>
  );
}
