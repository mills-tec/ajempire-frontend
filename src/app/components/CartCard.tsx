import { Checkbox } from "@/components/ui/checkbox";
import { CartItem, useCartStore } from "@/lib/stores/cart-store";
import { calcDiscountPrice } from "@/lib/utils";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import CartPopup from "./CartPopup";

function CartCard({ item }: { item: CartItem }) {
  const {
    removeItem,
    getItem,
    decreaseQuantity,
    increaseQuantity,
    toggleItemSelect,
    setSelectedItem,
    selectedItem,
    resetSelectedItem,
  } = useCartStore();
  const cartItem = getItem(item._id);

  useEffect(() => resetSelectedItem(), []);

  return (
    <section>
      {selectedItem && <CartPopup />}
      <div className="flex items-start relative w-full px-4 lg:px-0">
        <Checkbox
          checked={cartItem?.selected}
          onCheckedChange={() => {
            toggleItemSelect(item._id);
          }}
          className="mr-2 !rounded-full"
        />
        <div className="flex gap-x-2 w-full border-b border-b-black/30 lg:border-none pb-4">
          <div className="relative bg-gray-400 h-[6rem] lg:!h-[8.5rem] min-w-[6rem] lg:min-w-[8.5rem] w-[6rem] lg:w-[8.5rem] rounded-xl overflow-clip">
            <Image
              src={item.cover_image}
              alt="product image"
              fill
              className="transition-transform duration-300 ease-in-out group-hover:scale-110"
            />
          </div>
          <div className="flex w-full flex-col justify-between overflow-clip">
            <div className="space-y-1">
              <h1 className="text-sm text-black font-medium">{item.name}</h1>
              <div className="">
                <p className="text-xs" onClick={() => setSelectedItem(item)}>
                  Select Properties
                </p>
                <p className="text-xs text-[#737373]">Color: </p>
                <div className="flex gap-1">
                  <div className="size-[1.4rem] bg-gray-300 rounded-sm" />
                  <div className="size-[1.4rem] bg-gray-300 rounded-sm" />
                  <div className="size-[1.4rem] bg-gray-300 rounded-sm" />
                </div>
              </div>
              <div className="px-[0.2rem] bg-brand_purple w-max text-white py-[0.12rem] rounded-sm text-[0.6rem]">
                Seller Tag
              </div>
              <div className="flex text-[0.6rem] w-max items-center gap-3 justify-between">
                <p className="text-brand_pink font-semibold">
                  Extra ₦2,019 off applied
                </p>
                <p className=" border border-brand_pink text-brand_pink rounded-sm px-1">
                  03:05:36
                </p>
              </div>
            </div>
            <div className="space-x-2 flex items-baseline justify-between w-full mt-6">
              <div className="flex items-center gap-1">
                <p className="text-black/60 text-xs line-through">
                  ₦{item.price}
                </p>
                <p className="text-brand_pink">
                  ₦{calcDiscountPrice(item.price, item.discountedPrice)}
                </p>
              </div>

              <div className="flex gap-2 items-center text-sm">
                <div
                  onClick={() => decreaseQuantity(item._id)}
                  className="border size-[1.2rem] lg:size-[1.5rem] flex justify-center items-center text-xs rounded-md border-black/40"
                >
                  -
                </div>
                <div>{cartItem?.quantity}</div>
                <div
                  onClick={() => increaseQuantity(item._id)}
                  className="border size-[1.2rem] lg:size-[1.5rem] flex justify-center items-center text-xs rounded-md border-black/40"
                >
                  +
                </div>
              </div>
            </div>

            <hr className="mt-4 hidden lg:block" />
          </div>
        </div>
        <svg
          width="17"
          height="17"
          viewBox="0 0 17 17"
          className="absolute right-4"
          fill="none"
          onClick={() => removeItem(item._id)}
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_1644_12855)">
            <path
              d="M16.6537 8.32687C16.6537 6.67997 16.1654 5.07006 15.2504 3.70071C14.3354 2.33137 13.035 1.26409 11.5134 0.633849C9.99189 0.00360792 8.31764 -0.161292 6.70238 0.160002C5.08713 0.481296 3.60342 1.27435 2.43889 2.43889C1.27435 3.60342 0.481296 5.08713 0.160002 6.70238C-0.161292 8.31764 0.00360792 9.99189 0.633849 11.5134C1.26409 13.035 2.33137 14.3354 3.70071 15.2504C5.07006 16.1654 6.67997 16.6537 8.32687 16.6537C10.5353 16.6537 12.6533 15.7765 14.2149 14.2149C15.7765 12.6533 16.6537 10.5353 16.6537 8.32687ZM11.5952 10.6029C11.7244 10.7329 11.797 10.9088 11.797 11.0921C11.797 11.2754 11.7244 11.4513 11.5952 11.5813C11.5307 11.6463 11.4539 11.698 11.3694 11.7332C11.2848 11.7684 11.1941 11.7865 11.1025 11.7865C11.0109 11.7865 10.9202 11.7684 10.8356 11.7332C10.7511 11.698 10.6743 11.6463 10.6098 11.5813L8.45178 9.42325C8.41856 9.39301 8.37526 9.37626 8.33034 9.37626C8.28543 9.37626 8.24213 9.39301 8.20891 9.42325L6.05086 11.5813C5.91812 11.695 5.74736 11.7544 5.57272 11.7476C5.39809 11.7409 5.23242 11.6685 5.10884 11.5449C4.98526 11.4213 4.91286 11.2557 4.90612 11.081C4.89937 10.9064 4.95878 10.7356 5.07246 10.6029L7.2305 8.44484C7.26073 8.41162 7.27749 8.36832 7.27749 8.3234C7.27749 8.27849 7.26073 8.23519 7.2305 8.20197L5.07246 6.04392C5.00742 5.97942 4.95579 5.90267 4.92057 5.81811C4.88534 5.73355 4.8672 5.64285 4.8672 5.55125C4.8672 5.45965 4.88534 5.36895 4.92057 5.28439C4.95579 5.19983 5.00742 5.12308 5.07246 5.05858C5.20247 4.92934 5.37834 4.85679 5.56166 4.85679C5.74498 4.85679 5.92085 4.92934 6.05086 5.05858L8.20891 7.21662C8.22448 7.23322 8.2433 7.24645 8.26418 7.25549C8.28507 7.26453 8.30758 7.26919 8.33034 7.26919C8.3531 7.26919 8.37562 7.26453 8.39651 7.25549C8.41739 7.24645 8.4362 7.23322 8.45178 7.21662L10.6098 5.05858C10.6745 4.99388 10.7513 4.94256 10.8359 4.90754C10.9204 4.87253 11.011 4.85451 11.1025 4.85451C11.194 4.85451 11.2846 4.87253 11.3691 4.90754C11.4537 4.94256 11.5305 4.99388 11.5952 5.05858C11.6599 5.12328 11.7112 5.20008 11.7462 5.28462C11.7812 5.36915 11.7992 5.45975 11.7992 5.55125C11.7992 5.64275 11.7812 5.73335 11.7462 5.81788C11.7112 5.90242 11.6599 5.97923 11.5952 6.04392L9.43712 8.20197C9.42053 8.21755 9.4073 8.23636 9.39826 8.25724C9.38922 8.27813 9.38455 8.30065 9.38455 8.3234C9.38455 8.34616 9.38922 8.36868 9.39826 8.38957C9.4073 8.41045 9.42053 8.42926 9.43712 8.44484L11.5952 10.6029Z"
              fill="black"
              fill-opacity="0.5"
            />
          </g>
          <defs>
            <clipPath id="clip0_1644_12855">
              <rect width="16.6537" height="16.6537" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
    </section>
  );
}

export default CartCard;
