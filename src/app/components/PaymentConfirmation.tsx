"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import Spinner from "../components/Spinner";
import { getBearerToken } from "@/lib/api";

export default function PaymentConfirmation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  const trxref = searchParams.get("trxref");
  const [isLoading, setIsLoading] = useState(true);
  const [responseData, setResponseData] = useState<string>("");
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      setIsLoading(true);
      const token = getBearerToken();
      const paymentMethod = localStorage.getItem("paymentMethod");
      if (!token) {
        toast("User not authenticated");
        router.push("/login");
        return;
      }

      console.log("Verifying payment with reference:", reference);
      try {
        const response = await axios.post(
          `https://ajempire-backend.vercel.app/api/checkout/verify/${reference}`,
          {
            paymentMethod: paymentMethod,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Payment verification response:", response.data);
        if (response?.data?.message) {
          toast.success("Payment verified successfully!");
          setResponseData(response.data.message);
        } else {
          toast.error("Payment verification failed.");
          router.push("/checkout");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast.error("An error occurred during payment verification.");
      } finally {
        setIsLoading(false);
      }
    };
    verifyPayment();
  }, [reference]);
  console.log(responseData);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex lg:items-center items-start lg:justify-center z-50">
        <Spinner />
      </div>
    );
  }
  return (
    <>
      {!isLoading && responseData && showModal && (
        <div className="fixed inset-0  bg-black/40 flex lg:items-center items-start   lg:justify-center  z-50">
          <div className="p-6  lg:h-[400px] h-screen bg-white rounded shadow text-center items-center flex flex-col ">
            <div
              className="w-full flex justify-end items-center mb-6 cursor-pointer"
              onClick={() => setShowModal(false)}
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
                  stroke-linecap="round"
                  stroke-linejoin="round"
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
                <p className="mb-4 font-poppins">{responseData}</p>
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
      )}
    </>
  );
}
