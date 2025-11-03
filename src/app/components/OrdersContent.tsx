"use client";
import React from "react";
import OrderCard from "./OrderCard";
import Link from "next/link";
import { useOrders } from "@/api/customHooks";
import { ImSpinner8 } from "react-icons/im";

export default function OrdersContent({
  title,
  items,
  dateCreated,
  order_id,
}: {
  title: string;
  items: {
    product: string;
    name: string;
    variant: { name: string; value: string; _id: string };
    price: number;
    qty: number;
    image: string;
    discountedPrice: number;
  }[];
  dateCreated: string;
  order_id: string;
}) {
  const date = new Date(dateCreated);
  const { postLoading, addOrderToCart } = useOrders();
  const handleBuyAgain = async () => {
    if (!postLoading) {
      try {
        const data = items.map((item) => ({
          productId: item.product,
          qty: item.qty,
          variant: item.variant?._id ?? undefined,
        }));
        await addOrderToCart(data);
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div className="border-8  border-[#F9F9F9] md:border-none" >
      <div className="md:p-6 md:ml-8  rounded-xl my-8  bg-white p-4 ">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold capitalize">{title}</h1>
        <p className="text-black/60 text-sm">
          {date.toLocaleString("en-us", { dateStyle: "long" })}
        </p>
      </div>
      <div className="pt-6 space-y-3">
        {items.map((item, index) => (
          <OrderCard
            image={item.image}
            title={item.name}
            variant={
              item?.variant ? `${item.variant.name}: ${item.variant.value}` : ""
            }
            price={item.price}
            discount={item.discountedPrice}
            qty={item.qty}
            key={index}
          />
        ))}
      </div>
      <div className="flex justify-between my-5">
        <div />
        <div className="space-y-3">
          <p className="text-sm w-full text-right">
            Total for {`${items.length} ${items.length > 1 ? "Items" : "item"}`}
            :{" "}
            <span className="font-medium">
              ₦
              {items
                .reduce(
                  (prev, item: { price: number; discountedPrice: number }) =>
                    item.discountedPrice
                      ? item?.discountedPrice + prev
                      : item?.price + prev,
                  0
                )
                .toFixed(2)}
            </span>
          </p>
          <div className="flex gap-4">
          
            <button
              onClick={handleBuyAgain}
              className="rounded-full text-sm text-brand_pink py-1 px-3  md:px-6 w-max border-2 border-brand_pink flex items-center justify-center h-8"
            >
              {postLoading ? (
                <ImSpinner8 className="animate-spin" />
              ) : (
                "Buy Again"
              )}
            </button>
            <Link
              className="flex items-center justify-center rounded-full text-sm py-1 px-3   md:px-6 w-max text-white bg-brand_pink"
              href={`/pages/ordersandaccount/status/${order_id}`}
            >
              View Status
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
