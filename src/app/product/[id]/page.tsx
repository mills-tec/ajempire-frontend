"use client";
import Image from "next/image";
import React from "react";
import ProductReview from "@/app/components/ProductReview";
import CommentCard from "@/app/components/CommentCard";
import ProductDescription from "@/app/components/ProductDescription";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getProduct } from "@/lib/api";
import Spinner from "@/app/components/Spinner";
import { useCartStore } from "@/lib/stores/cart-store";
import { Checkbox } from "@/components/ui/checkbox";

export default function ProductDetailPage() {
  const params = useParams();
  const {
    items,
    decreaseQuantity,
    increaseQuantity,
    toggleItemSelect,
    deselectAllCartItems,
    selectAllCartItems,
  } = useCartStore();
  const id = params.id;

  console.log("id; ", id);

  const { data, isLoading } = useQuery(
    ["product", id],
    () => (id ? getProduct(id as string) : null),
    { enabled: !!id }
  );

  console.log(data);

  if (isLoading) <Spinner />;

  return (
    <section className="lg:flex px-4 lg:pl-[3.5rem] pt-4 lg:pt-8 space-x-20">
      <div className="lg:w-1/2 h-full space-y-8">
        <div className="space-y-4">
          <div className="relative w-full h-[20rem] lg:h-[38rem] rounded-sm overflow-clip">
            <Image
              src={data?.message.product.cover_image || ""}
              alt="product image"
              fill
              className="absolute object-cover"
            />
          </div>
          <div className="flex gap-2 lg:gap-5">
            {data?.message.product.images.map((image) => (
              <div className="size-[3rem] lg:size-[6rem] overflow-clip relative bg-gray-400 rounded-xl">
                <Image
                  src={image}
                  alt="product image"
                  fill
                  className="absolute object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:hidden">
          {data?.message && <ProductDescription product_data={data} />}
        </div>

        <div className="lg:hidden">
          {data?.message && <ProductReview product={data?.message.product} />}
        </div>

        <div>
          <div className="hidden lg:block">
            {data?.message && <ProductReview product={data?.message.product} />}
          </div>
          {data?.message &&
            data.message.product.reviews.map((review) => (
              <CommentCard key={review._id} review={review} />
            ))}
        </div>
      </div>
      <div className="w-1/2 h-full hidden lg:block">
        {data?.message && <ProductDescription product_data={data} />}
      </div>
      {items.length > 0 && (
        <div className="w-[14rem] px-4 space-y-6 border-l sticky top-[6.6rem] flex-col items-center h-[calc(100vh-6.6rem)] overflow-y-auto hidden lg:flex">
          <div className="sticky top-0 space-y-2">
            <button className="h-[2.5rem] bg-brand_pink text-white rounded-full w-full">
              Check Out
            </button>
            <button className="h-[2.5rem] border border-black text-black rounded-full w-full">
              Go to cart
            </button>
          </div>
          <div className="space-y-3 w-full">
            <div className="flex items-center gap-1">
              <Checkbox
                checked={
                  items.length > 0 && items.every((item) => item.selected)
                }
                onClick={() =>
                  items.length > 0 && items.every((item) => item.selected)
                    ? deselectAllCartItems()
                    : selectAllCartItems()
                }
                className="z-30 bg-white !rounded-full left-2 top-2"
              />
              <p>Select all (3)</p>
            </div>
            {items.map((item) => (
              <div className="w-[8rem] mx-auto flex flex-col relative items-center">
                <Checkbox
                  checked={item?.selected}
                  onCheckedChange={() => {
                    toggleItemSelect(item._id);
                  }}
                  className="absolute z-30 bg-white border !border-brand_pink !rounded-full left-2 top-2"
                />
                <div className="h-[8rem] w-[8rem] overflow-clip relative rounded-lg bg-gray-300">
                  <Image
                    src={item.cover_image}
                    alt="product image"
                    fill
                    className="transition-transform duration-300 ease-in-out group-hover:scale-110"
                  />
                </div>
                <div className="space-y-1">
                  <h1 className="text-sm text-black font-medium w-[8rem] truncate">
                    {item.name}
                  </h1>
                  <div className="flex gap-2 items-center justify-end">
                    <div
                      onClick={() => decreaseQuantity(item._id)}
                      className="border size-[1.5rem] flex justify-center items-center text-xs rounded-md border-black/40"
                    >
                      -
                    </div>
                    <div>{item?.quantity}</div>
                    <div
                      onClick={() => increaseQuantity(item._id)}
                      className="border size-[1.5rem] flex justify-center items-center text-xs rounded-md border-black/40"
                    >
                      +
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
