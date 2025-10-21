"use client";
import { CartItem } from "@/lib/stores/cart-store";
import React, { useState } from "react";

export default function CartPopupProductDescription({
  item,
}: {
  item: CartItem;
}) {
  // const [rating, setRating] = React.useState(4);

  const [quantity, setQuantity] = useState(1);

  let size_variant =
    item.variants.length > 0 &&
    item.variants.filter((item) => item.name == "size" && item.stock > 0);
  let color_variant =
    item.variants.length > 0 &&
    item.variants.filter((item) => item.name == "color" && item.stock > 0);

  const filledStar = (
    <svg
      width="16"
      height="16"
      className="size-4"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.16382 0.828125L9.99671 6.46919H15.9281L11.1295 9.95557L12.9624 15.5966L8.16382 12.1103L3.36525 15.5966L5.19814 9.95557L0.399566 6.46919H6.33092L8.16382 0.828125Z"
        fill="#403C39"
      />
    </svg>
  );
  const unfilledStar = (
    <svg
      width="16"
      height="16"
      className="size-4"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.40625 6.55859L9.4707 6.75781H14.7236L10.6436 9.72168L10.4736 9.8457L10.5381 10.0449L12.0967 14.8408L8.0166 11.877L7.84766 11.7539L7.67773 11.877L3.59668 14.8408L5.15625 10.0449L5.2207 9.8457L5.05176 9.72168L0.97168 6.75781H6.22461L6.28906 6.55859L7.84766 1.76074L9.40625 6.55859Z"
        stroke="#403C39"
        strokeWidth="0.57732"
      />
    </svg>
  );
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="font-medium text-sm lg:text-base">{item.name}</h1>

        <div className="space-y-3">
          <div className="flex justify-between">
            <p className="text-sm text-black/60">{item.itemsSold}+ sold</p>
            <div className="flex items-center gap-2">
              {
                <div className="flex text-brand_gray_dark">
                  {[...Array(5)].map((_, i) =>
                    i < (item.averageRating || 0) ? (
                      <span key={i}>{filledStar}</span>
                    ) : (
                      <span key={i}>{unfilledStar}</span>
                    )
                  )}
                </div>
              }
              <p className="text-black/60 text-xs">{item.reviews.length}</p>
            </div>
          </div>
          <div className="flex items-center">
            <h3 className="text-base lg:text-2xl text-brand_pink font-medium">
              ₦{item.price}
            </h3>
            <h4 className="text-[10px] lg:text-xs ml-2">₦33,500</h4>

            <div className="text-[11.11px] lg:text-xs text-brand_pink border border-brand_pink ml-4 p-1 rounded-sm">
              <p>93% OFF Limited time</p>
            </div>
          </div>

          <div className=" text-[11.11px] lg:text-xs flex items-center gap-4 text-brand_pink">
            <p className="font-medium">
              Only $18,5111 with extra ₦2,019 off | Ends in
            </p>
            <p className="border border-brand_pink p-[0.1rem] px-1 rounded-sm">
              03:05:36
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <div className="flex gap-6">
          <div className="space-y-2">
            <p className="text-xs text-brand_gray_dark">
              Select Property (Color):
            </p>
            <div>
              <div className="flex gap-2">
                {color_variant && color_variant.length > 0 ? (
                  color_variant.map((variant) => (
                    <div
                      className={`size-[2rem] relative rounded border border-[#BFBFBF] bg-[${variant.value}]`}
                    >
                      <div className="w-full h-1 rounded-full absolute -bottom-2 bg-[#A600FF]"></div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-xs">
                    This data is currently unavailable
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2 lg:mt-0">
            <p className="text-xs text-brand_gray_dark">
              Select Property (Size):
            </p>
            <div className="pt-1">
              <div className="flex flex-wrap gap-2">
                {size_variant && size_variant.length > 0 ? (
                  size_variant.map((variant) => (
                    <div className="h-[1.5rem] w-[2.5rem] relative rounded-full text-[0.6rem] flex items-center justify-center border bg-[#E6E6E6]">
                      {variant.value.toUpperCase()}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-xs">
                    This data is currently unavailable
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        <h3 className="text-lg">Qty</h3>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
            className="size-[1.5rem] rounded-md border border-black/40 flex items-center justify-center"
          >
            -
          </button>
          <p className="text-sm">{quantity}</p>
          <button
            onClick={() =>
              setQuantity((prev) => Math.min(prev + 1, item.stock))
            }
            className="size-[1.5rem] rounded-md border border-black/40 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      <div className="w-full flex items-center pt-4 pb-4 gap-8">
        <div className="flex gap-2 items-center">
          <button className="h-[2rem] text-xs bg-brand_pink text-white rounded-full w-max  px-8">
            Add to Cart
          </button>
          <button className="">
            <svg
              width="42"
              height="42"
              className="size-[2rem]"
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
        <button className="h-[2rem] text-xs bg-brand_pink text-white rounded-full w-full">
          Check Out
        </button>
      </div>
    </div>
  );
}
