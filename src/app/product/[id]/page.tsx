"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import ProductReview from "@/app/components/ProductReview";
import CommentCard from "@/app/components/CommentCard";
import ProductDescription from "@/app/components/ProductDescription";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getProduct } from "@/lib/api";
import Spinner from "@/app/components/Spinner";
import { useCartStore } from "@/lib/stores/cart-store";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // ✅ All hooks must be at the top and unconditional
  const {
    items,
    decreaseQuantity,
    increaseQuantity,
    toggleItemSelect,
    deselectAllCartItems,
    selectAllCartItems,
    addItem,
    getItem,
    removeItem,
    setQuantity: setCartItemQty,
  } = useCartStore();

  const { data, isLoading } = useQuery(
    ["product", id],
    () => (id ? getProduct(id) : null),
    { enabled: !!id }
  );

  // 🌀 Base variables
  const item = data?.message?.product ?? null;
  const cartItem = item ? getItem(item._id) : null;

  const [quantity, setQuantity] = useState(
    cartItem?.quantity && cartItem.quantity > 0 ? cartItem.quantity : 1
  );

  // 🧩 Update quantity safely
  useEffect(() => {
    if (!item) return; // don’t run until item exists

    if (quantity === 0) {
      removeItem(item._id);
    } else {
      setCartItemQty(item._id, quantity);
    }
  }, [quantity, item]);

  // 🌀 Handle states
  if (isLoading) return <Spinner />;

  if (!data || !item)
    return (
      <p className="text-gray-400 text-xs">
        This data is currently unavailable
      </p>
    );

  return (
    <section className="">
      <div className="flex lg:hidden justify-between items-center py-3 px-4 z-50 border-b sticky bg-white top-0">
        <Link href={"/"}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.5307 18.9698C15.6004 19.0395 15.6557 19.1222 15.6934 19.2132C15.7311 19.3043 15.7505 19.4019 15.7505 19.5004C15.7505 19.599 15.7311 19.6965 15.6934 19.7876C15.6557 19.8786 15.6004 19.9614 15.5307 20.031C15.461 20.1007 15.3783 20.156 15.2873 20.1937C15.1962 20.2314 15.0986 20.2508 15.0001 20.2508C14.9016 20.2508 14.804 20.2314 14.7129 20.1937C14.6219 20.156 14.5392 20.1007 14.4695 20.031L6.96948 12.531C6.89974 12.4614 6.84443 12.3787 6.80668 12.2876C6.76894 12.1966 6.74951 12.099 6.74951 12.0004C6.74951 11.9019 6.76894 11.8043 6.80668 11.7132C6.84443 11.6222 6.89974 11.5394 6.96948 11.4698L14.4695 3.96979C14.6102 3.82906 14.8011 3.75 15.0001 3.75C15.1991 3.75 15.39 3.82906 15.5307 3.96979C15.6715 4.11052 15.7505 4.30139 15.7505 4.50042C15.7505 4.69944 15.6715 4.89031 15.5307 5.03104L8.56041 12.0004L15.5307 18.9698Z"
              fill="black"
            />
          </svg>
        </Link>

        <div className="flex gap-2 items-center"></div>
      </div>
      <div className="lg:flex px-4 lg:pl-[3.5rem] pt-4 lg:pt-8 lg:space-x-20">
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
            {data?.message &&
              data.message.product.reviews.map((review) => (
                <CommentCard key={review._id} review={review} />
              ))}
          </div>

          <div>
            <div className="hidden lg:block">
              {data?.message && (
                <ProductReview product={data?.message.product} />
              )}
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
                <p>Select all ({items.length})</p>
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
      </div>
      <div className="w-full flex items-center sticky left-0 bottom-20 pt-4 pb-4 lg:py-4 bg-white border-t border-t-black/40 gap-8 lg:hidden px-4">
        <div className="flex gap-2 items-center">
          {!cartItem ? (
            <button
              onClick={() =>
                addItem({
                  ...item,
                  quantity,
                  selected: false,
                  selectedVariants: [],
                })
              }
              className="h-[2rem] lg:h-[3rem] text-xs bg-brand_pink text-white rounded-full w-max  px-8"
            >
              Add to Cart
            </button>
          ) : (
            <div
              // onClick={() => addItem({ ...item, quantity })}
              className="h-[2rem] lg:h-[3rem] flex font-bold justify-between text-xs lg:text-base border-2 items-center border-brand_pink text-brand_gray_dark rounded-full w-[8rem] lg:w-[10rem] overflow-clip"
            >
              <button
                onClick={() => {
                  setQuantity((prev) => Math.max(prev - 1, 0));
                  if (quantity == 0) {
                    removeItem(item._id);
                  }
                }}
                className="size-[2rem] lg:size-[3rem]  rounded-full border flex items-center text-brand_pink font-semibold justify-center border-brand_pink"
              >
                -
              </button>
              {quantity}
              <button
                onClick={() =>
                  setQuantity((prev) => Math.min(prev + 1, item.stock))
                }
                className="size-[2rem] lg:size-[3rem]  rounded-full border flex items-center text-brand_pink font-semibold justify-center border-brand_pink"
              >
                +
              </button>
            </div>
          )}

          <button className="">
            <svg
              width="42"
              height="42"
              className="size-[2rem] lg:size-[3rem]"
              viewBox="0 0 42 42"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="21" cy="21" r="20.5" stroke="#999999" />
              <path
                d="M14.0677 20.6154C13.7027 20.2528 13.4135 19.8213 13.217 19.3458C13.0205 18.8704 12.9206 18.3606 12.9231 17.8462C12.9231 16.8057 13.3364 15.8079 14.0721 15.0721C14.8078 14.3364 15.8057 13.9231 16.8462 13.9231C18.3046 13.9231 19.5785 14.7169 20.2523 15.8985H21.2862C21.6287 15.2976 22.1244 14.7983 22.7227 14.4513C23.3211 14.1043 24.0006 13.922 24.6923 13.9231C25.7328 13.9231 26.7306 14.3364 27.4663 15.0721C28.2021 15.8079 28.6154 16.8057 28.6154 17.8462C28.6154 18.9262 28.1538 19.9231 27.4708 20.6154L20.7692 27.3077L14.0677 20.6154ZM28.1169 21.2708C28.9938 20.3846 29.5385 19.1846 29.5385 17.8462C29.5385 16.5609 29.0279 15.3283 28.1191 14.4194C27.2102 13.5106 25.9776 13 24.6923 13C23.0769 13 21.6462 13.7846 20.7692 15.0031C20.3216 14.3814 19.7323 13.8754 19.05 13.527C18.3677 13.1787 17.6122 12.998 16.8462 13C15.5609 13 14.3282 13.5106 13.4194 14.4194C12.5106 15.3283 12 16.5609 12 17.8462C12 19.1846 12.5446 20.3846 13.4215 21.2708L20.7692 28.6185L28.1169 21.2708Z"
                fill="black"
              />
            </svg>
          </button>
        </div>
        <button className="h-[2rem] lg:h-[3rem] text-xs bg-brand_pink text-white rounded-full w-full">
          Check Out
        </button>
      </div>
    </section>
  );
}
