import React from "react";
import OrderCard from "./OrderCard";
import Link from "next/link";

export default function OrdersContent({ title }: { title: string }) {
  return (
    <div className="py-4 ml-8 p-7 rounded-xl mt-8 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold">{title}</h1>
        <p className="text-black/60 text-sm">Sep 3, 2025</p>
      </div>
      <div className="pt-6 space-y-3">
        <OrderCard />
        <OrderCard />
      </div>
      <div className="flex justify-between">
        <div />
        <div className="space-y-3">
          <p className="text-sm w-full text-right">
            Total for 2 items: <span className="font-medium">₦100,000</span>
          </p>
          <div className="flex gap-4">
            {title.trim().toLocaleLowerCase() == "delivered" && (
              <button className="rounded-full text-s py-1 px-6 w-max border-2 border-black">
                Leave a review
              </button>
            )}
            <button className="rounded-full text-sm text-brand_pink py-1 px-6 w-max border-2 border-brand_pink">
              Buy Again
            </button>
            <Link
              className="rounded-full text-sm py-1 px-6 w-max text-white bg-brand_pink"
              href={"/pages/ordersandaccount/status"}
            >
              View Status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
