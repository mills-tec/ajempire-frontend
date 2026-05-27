import React from "react";
import Skeleton from "@/components/ui/Skeleton";
import OrderCardSkeleton from "./OrderCardSkeleton";

export default function OrdersContentSkeleton({ itemCount = 2 }: { itemCount?: number }) {
  return (
    <div className="border-8 border-[#F9F9F9] md:border-none">
      <div className="md:p-6 rounded-xl my-8 bg-white p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton height={20} borderRadius={4} className="w-28" />
          <Skeleton height={16} borderRadius={4} className="w-36" />
        </div>

        {/* Order items */}
        <div className="pt-6 space-y-3">
          {Array.from({ length: itemCount }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between my-5 items-end">
          <div className="w-4 h-4" />
          <div className="space-y-3">
            <Skeleton height={16} borderRadius={4} className="w-48 ml-auto" />
            <div className="flex md:gap-4 gap-2">
              <Skeleton height={40} borderRadius={9999} className="w-28" />
              <Skeleton height={40} borderRadius={9999} className="w-24" />
              <Skeleton height={40} borderRadius={9999} className="w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
