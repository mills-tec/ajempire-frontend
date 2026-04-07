"use client";

import ListOfLogistics from "./ui/ListOfLogistics";
import { useCartStore } from "@/lib/stores/cart-store";

interface SelectLogisticsProps {
  onContinue: () => void;
  onBack: () => void;
  setIsadress?: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
}

export default function SelectLogistics({
  setIsadress,
  onContinue,
  onBack,
  onClose,
}: SelectLogisticsProps) {
  const { selectedLogistic } = useCartStore();

  return (
    <div className="fixed inset-0 bg-[#FFFFFF] flex lg:items-center lg:justify-center z-50">
      <div className="w-full relative shadow-lg font-poppins text-[14px] lg:w-[50%] lg:h-[500px] lg:px-10 px-5 py-8">
        <p className="text-center font-semibold opacity-75 lg:mb-10 mb-6">
          {" "}
          Select Delivery Option
        </p>
        {/* resonsive design */}
        <div className="lg:hidden flex items-center gap-4 lg:mb-5 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide ">
          <div className="flex items-center gap-1">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0ZM9.6 18L3.6 12L5.292 10.308L9.6 14.604L18.708 5.496L20.4 7.2L9.6 18Z"
                fill="#0085FF"
              />
            </svg>
            <p>Shipping</p>
          </div>
          <div>
            <svg
              width="22"
              height="1"
              viewBox="0 0 22 1"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0.5 0.5H21.5" stroke="#CFCFCF" strokeLinecap="square" />
            </svg>
          </div>

          <div className="flex items-center gap-1">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0ZM9.6 18L3.6 12L5.292 10.308L9.6 14.604L18.708 5.496L20.4 7.2L9.6 18Z"
                fill="#A600FF"
              />
            </svg>

            <p className="text-[#A3A3A3]">Payment</p>
          </div>
          <div>
            <svg
              width="22"
              height="1"
              viewBox="0 0 22 1"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0.5 0.5H21.5" stroke="#CFCFCF" strokeLinecap="square" />
            </svg>
          </div>
          <div className="flex items-center gap-1">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0ZM9.6 18L3.6 12L5.292 10.308L9.6 14.604L18.708 5.496L20.4 7.2L9.6 18Z"
                fill="#FFCC00"
              />
            </svg>
            <p className="text-[#A3A3A3]">Logistics</p>
          </div>

          <div>
            <svg
              width="22"
              height="1"
              viewBox="0 0 22 1"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0.5 0.5H21.5" stroke="#CFCFCF" strokeLinecap="square" />
            </svg>
          </div>
          <div className="flex items-center gap-1">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="24" height="24" rx="12" fill="#AEAEAE" />
              <path
                d="M11 7V13.6667L14 17"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-[#A3A3A3]">Review</p>
          </div>
        </div>
        <div className="mt-10">
          <ListOfLogistics />
        </div>

        <div className=" bg-blue-200 mt-20">
          <button
            disabled={!selectedLogistic}
            onClick={onContinue}
            className={` w-full h-[35px] rounded-md text-white  ${
              selectedLogistic
                ? "bg-primaryhover hover:bg-primaryhover/80"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>

        {/* Back */}
        <div className="absolute top-6 left-6 cursor-pointer" onClick={onBack}>
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
        </div>

        {/* Close */}
        <div
          className="absolute top-6 right-6 cursor-pointer"
          onClick={onClose}
        >
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
      </div>
    </div>
  );
}
