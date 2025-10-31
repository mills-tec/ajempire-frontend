"use client";
import CartCard from "@/app/components/CartCard";
import { Checkbox } from "@/components/ui/checkbox";
import { useCartStore } from "@/lib/stores/cart-store";
import { calcDiscountPrice } from "@/lib/utils";
import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";

export default function CartPage() {
  const { items, deselectAllCartItems, selectAllCartItems, orderSummary } =
    useCartStore();
  console.log("items: ", items);
  const [expand, setExpand] = useState(false);
  return (
    <div className="relative w-screen lg:flex lg:px-10 lg:gap-8 lg:mt-9">
      <div className="w-full lg:px-0 space-y-6">
        <div className="flex items-center w-full justify-between py-4 lg:py-0 border-b border-b-black/30 lg:border-none">
          <div className="gap-1 flex items-center px-4 lg:px-0">
            <Checkbox
              checked={items.length > 0 && items.every((item) => item.selected)}
              onClick={() =>
                items.length > 0 && items.every((item) => item.selected)
                  ? deselectAllCartItems()
                  : selectAllCartItems()
              }
              className="!rounded-full !size-4"
            />

            <p className="text-sm">All</p>
          </div>
          <p className="font-medium lg:hidden">
            Cart({items.length} {items.length > 1 ? "items" : "item"})
          </p>
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            className="h-5 mr-3"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M5 18C5.39782 18 5.77936 18.158 6.06066 18.4393C6.34196 18.7206 6.5 19.1022 6.5 19.5C6.5 19.8978 6.34196 20.2794 6.06066 20.5607C5.77936 20.842 5.39782 21 5 21C4.60218 21 4.22064 20.842 3.93934 20.5607C3.65804 20.2794 3.5 19.8978 3.5 19.5C3.5 19.1022 3.65804 18.7206 3.93934 18.4393C4.22064 18.158 4.60218 18 5 18ZM22.999 18.5C23.552 18.5 24 18.944 24 19.5C24 20.0525 23.555 20.5 22.999 20.5H9.001C8.86952 20.5004 8.73926 20.4748 8.6177 20.4247C8.49614 20.3746 8.38567 20.301 8.29266 20.208C8.19964 20.1151 8.1259 20.0047 8.07568 19.8832C8.02545 19.7617 7.99974 19.6315 8 19.5C8 18.9475 8.445 18.5 9.001 18.5H22.999ZM5 13C5.39782 13 5.77936 13.158 6.06066 13.4393C6.34196 13.7206 6.5 14.1022 6.5 14.5C6.5 14.8978 6.34196 15.2794 6.06066 15.5607C5.77936 15.842 5.39782 16 5 16C4.60218 16 4.22064 15.842 3.93934 15.5607C3.65804 15.2794 3.5 14.8978 3.5 14.5C3.5 14.1022 3.65804 13.7206 3.93934 13.4393C4.22064 13.158 4.60218 13 5 13ZM22.999 13.5C23.552 13.5 24 13.944 24 14.5C24 15.0525 23.555 15.5 22.999 15.5H9.001C8.86952 15.5004 8.73926 15.4748 8.6177 15.4247C8.49614 15.3746 8.38567 15.301 8.29266 15.208C8.19964 15.1151 8.1259 15.0047 8.07568 14.8832C8.02545 14.7617 7.99974 14.6315 8 14.5C8 13.9475 8.445 13.5 9.001 13.5H22.999ZM5 8C5.39782 8 5.77936 8.15804 6.06066 8.43934C6.34196 8.72064 6.5 9.10218 6.5 9.5C6.5 9.89782 6.34196 10.2794 6.06066 10.5607C5.77936 10.842 5.39782 11 5 11C4.60218 11 4.22064 10.842 3.93934 10.5607C3.65804 10.2794 3.5 9.89782 3.5 9.5C3.5 9.10218 3.65804 8.72064 3.93934 8.43934C4.22064 8.15804 4.60218 8 5 8ZM22.999 8.5C23.552 8.5 24 8.944 24 9.5C24 10.0525 23.555 10.5 22.999 10.5H9.001C8.86952 10.5004 8.73926 10.4748 8.6177 10.4247C8.49614 10.3746 8.38567 10.301 8.29266 10.208C8.19964 10.1151 8.1259 10.0047 8.07568 9.88323C8.02545 9.76172 7.99974 9.63148 8 9.5C8 8.9475 8.445 8.5 9.001 8.5H22.999Z"
              fill="black"
            />
          </svg>
        </div>
        {items.map((item) => (
          <CartCard item={item} />
        ))}
      </div>
      <div className="lg:h-{calc(100vh-8rem)}">
        <div
          className={clsx(
            "fixed lg:sticky bottom-[5rem] lg:bottom-0 w-screen p-4 lg:top-[8rem] bg-white rounded-t-2xl border-t border-black/25 lg:border-none lg:p-0 lg:bg-transparent lg:rounded-none lg:w-min",
            expand ? "block" : "hidden lg:block"
          )}
        >
          <svg
            width="24"
            height="12"
            viewBox="0 0 24 12"
            fill="none"
            className={clsx(
              "flex justify-self-end mb-1 lg:hidden",
              expand ? "rotate-180" : "-rotate-180"
            )}
            onClick={() => setExpand(!expand)}
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_1335_19956)">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12.7106 1.84306L18.3676 7.50006L16.9536 8.91406L12.0036 3.96406L7.05365 8.91406L5.63965 7.50006L11.2966 1.84306C11.4842 1.65559 11.7385 1.55028 12.0036 1.55028C12.2688 1.55028 12.5231 1.65559 12.7106 1.84306Z"
                fill="black"
              />
            </g>
            <defs>
              <clipPath id="clip0_1335_19956">
                <rect
                  width="12"
                  height="24"
                  fill="white"
                  transform="matrix(0 -1 1 0 0 12)"
                />
              </clipPath>
            </defs>
          </svg>
          <p className="text-sm text-center pb-4">
            <span className="font-medium text-base">Order Summary</span>(4
            items) selected
          </p>
          <div className="flex gap-2">
            {items
              .filter((item) => item.selected == true)
              .map((item) => (
                <div>
                  <div className="size-[4rem] rounded-md overflow-clip object-cover relative bg-gray-400">
                    <Image
                      src={item.cover_image}
                      alt="product image"
                      fill
                      className="transition-transform duration-300 ease-in-out group-hover:scale-110"
                    />
                  </div>
                  <p className="text-xs text-black/75 mt-1">
                    ₦{calcDiscountPrice(item.price, item.discountedPrice)}{" "}
                    <span className="text-brand_pink">x{item.quantity}</span>
                  </p>
                </div>
              ))}
          </div>
          <hr className="mt-4" />
          <div className="text-sm space-y-1 py-1">
            <div className="flex justify-between items-center">
              <p>Item(s) total:</p>
              <p className="font-medium">₦{orderSummary().total}</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Item(s) discount:</p>
              <p className="text-brand_pink">- ₦{orderSummary().discount}</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Coupon applied</p>
              <p className="text-brand_pink">-₦{orderSummary().coupon}</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Delivery fee:</p>
              <p className="font-medium">₦{orderSummary().deliveryFee}</p>
            </div>
          </div>
          <hr />
          <div className="mt-2">
            <div className="text-xs flex justify-between text-black/60">
              <div></div>
              <p>Total payable</p>
            </div>
            <div className="flex justify-between text-sm items-center">
              <p>Total:</p>
              <p className="font-semibold">₦{orderSummary().finalTotal}</p>
            </div>
          </div>
          <button className="flex gap-1 items-center w-[20rem] justify-center mx-auto mt-4 lg:mb-24 py-2 rounded-full bg-brand_pink text-white">
            Checkout
          </button>
        </div>
        <div
          className={clsx(
            "fixed bottom-[5rem] w-screen p-4 z-50 h-min border-t border-black/25 lg:border-none bg-white rounded-t-2xl",
            !expand ? "block lg:hidden" : "hidden lg:hidden"
          )}
        >
          <svg
            width="24"
            height="12"
            viewBox="0 0 24 12"
            fill="none"
            className="flex justify-self-end mb-1"
            onClick={() => setExpand(!expand)}
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_1335_19956)">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12.7106 1.84306L18.3676 7.50006L16.9536 8.91406L12.0036 3.96406L7.05365 8.91406L5.63965 7.50006L11.2966 1.84306C11.4842 1.65559 11.7385 1.55028 12.0036 1.55028C12.2688 1.55028 12.5231 1.65559 12.7106 1.84306Z"
                fill="black"
              />
            </g>
            <defs>
              <clipPath id="clip0_1335_19956">
                <rect
                  width="12"
                  height="24"
                  fill="white"
                  transform="matrix(0 -1 1 0 0 12)"
                />
              </clipPath>
            </defs>
          </svg>

          <div>
            <p className="font-medium text-sm">(4 items) selected</p>
            <div className="flex justify-between items-end">
              <div>
                <h3 className="font-medium">₦{orderSummary().total}</h3>
                <p className="text-xs text-brand_pink">
                  ₦{orderSummary().discount} discount applied
                </p>
              </div>
              <button className="flex gap-1 items-center w-[10rem] justify-center py-2 rounded-full bg-brand_pink text-white">
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
