"use client";

import { useCartStore } from "@/lib/stores/cart-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PaymentConfirmation() {
  const router = useRouter();
  const { clearCart } = useCartStore()
  useEffect(() => {
    clearCart();
  }, [])

  return (
    <>
      <div className="fixed inset-0  bg-black/40 flex lg:items-center items-start   lg:justify-center  z-50">
        <div className="p-6  lg:h-[400px] h-screen bg-white rounded shadow text-center items-center flex flex-col ">
          <div
            className="w-full flex justify-end items-center mb-6 cursor-pointer"
            onClick={() => {
              // sessionStorage.removeItem("paymentVerified");
              // sessionStorage.removeItem("paymentMessage");
              // setShowModal(false);
              router.push("/");
            }}
          >
            <p className="lg:hidden w-full text-[16px]">
              Payment Confirmation
            </p>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.75 13.8575L7.30375 7.30375L13.8575 13.8575M13.8575 0.75L7.3025 7.30375L0.75 0.75"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="w-full flex flex-col items-center justify-center lg:py-0 py-20 px-3 gap-20">
            <div className="flex flex-col items-center">
              <div className="mb-4">
                <svg
                  width="100"
                  height="100"
                  viewBox="0 0 162 162"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M81 0C36.45 0 0 36.45 0 81C0 125.55 36.45 162 81 162C125.55 162 162 125.55 162 81C162 36.45 125.55 0 81 0ZM64.8 121.5L24.3 81L35.721 69.579L64.8 98.577L126.279 37.098L137.7 48.6L64.8 121.5Z"
                    fill="#FF008C"
                  />
                </svg>
              </div>
              <p className="mb-4 font-poppins">We've received your payment request and are currently awaiting confirmation. You'll receive a notification as soon as it has been confirmed.</p>
            </div>
            <button
              onClick={() =>
                router.push("/pages/ordersandaccount/orders/all")
              }
              className="w-[300px] h-[35px] bg-primaryhover text-white rounded-full hover:bg-[#990054] transition-all duration-300 text-center text-[14px]"
            >
              View Order
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
