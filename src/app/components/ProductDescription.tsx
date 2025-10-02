"use client";
import React from "react";

export default function ProductDescription() {
  const [rating, setRating] = React.useState(4);

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
      <h1 className="font-medium">
        AJ Empire Luxury Nail Care Kit – Magenta Edition
      </h1>
      <p className="text-brand_gray_dark">
        Transform your nails with AJ Empire’s all-in-one luxury kit. Designed
        for beginners and professionals, it brings salon-quality results
        straight to your fingertips.
      </p>

      <div className="space-y-3">
        <div className="flex justify-between">
          <p className="text-sm text-black/60">2,8k+ sold</p>
          <div className="flex items-center gap-2">
            {
              <div className="flex text-brand_gray_dark">
                {[...Array(5)].map((_, i) =>
                  i < rating ? (
                    <span key={i}>{filledStar}</span>
                  ) : (
                    <span key={i}>{unfilledStar}</span>
                  )
                )}
              </div>
            }
            <p className="text-black/60 text-xs">1,000</p>
          </div>
        </div>

        <div className="flex items-center">
          <h3 className="text-2xl text-brand_pink font-medium">₦3,500</h3>
          <h4 className="text-xs ml-2">₦33,500</h4>

          <div className="text-xs text-brand_pink border border-brand_pink ml-4 p-1 rounded-sm">
            <p>93% OFF Limited time</p>
          </div>
        </div>

        <div className="text-xs flex items-center gap-4 text-brand_pink">
          <p className="font-medium">
            Only $18,5111 with extra ₦2,019 off | Ends in
          </p>
          <p className="border border-brand_pink p-[0.1rem] px-1 rounded-sm">
            03:05:36
          </p>
        </div>
      </div>

      <div className="flex gap-5">
        <h3 className="text-lg">Qty</h3>
        <div className="flex gap-2 items-center">
          <button className="size-[1.5rem] rounded-md border border-black/40 flex items-center justify-center">
            -
          </button>
          <p className="text-sm">1</p>
          <button className="size-[1.5rem] rounded-md border border-black/40 flex items-center justify-center">
            +
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs text-brand_gray_dark">Color: </h4>
        <div className="flex gap-2">
          <div className="size-[4rem] bg-gray-400 rounded-xl"></div>
          <div className="size-[4rem] bg-gray-400 rounded-xl"></div>
          <div className="size-[4rem] bg-gray-400 rounded-xl"></div>
          <div className="size-[4rem] bg-gray-400 rounded-xl"></div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="space-y-2">
          <p className="text-xs text-brand_gray_dark">
            Select Property (Color): White
          </p>
          <div>
            <div className="flex gap-2">
              <div className="size-[2rem] relative rounded border border-[#BFBFBF] bg-[#FFFFFF]">
                <div className="w-full h-1 rounded-full absolute -bottom-2 bg-[#A600FF]"></div>
              </div>
              <div className="size-[2rem] rounded border border-[#BFBFBF] bg-[#000000]"></div>
              <div className="size-[2rem] rounded border border-[#BFBFBF] bg-[#FF8D28]"></div>
              <div className="size-[2rem] rounded border border-[#BFBFBF] bg-[#34C759]"></div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-brand_gray_dark">
            Select Property (Size):
          </p>
          <div className="pt-1">
            <div className="flex gap-2">
              <div className="h-[1.5rem] w-[2.5rem] relative rounded-full text-[0.6rem] flex items-center justify-center border bg-[#E6E6E6]">
                S
              </div>
              <div className="h-[1.5rem] w-[2.5rem] rounded-full text-[0.6rem] flex items-center justify-center border bg-[#E6E6E6]">
                M
              </div>
              <div className="h-[1.5rem] w-[2.5rem] rounded-full text-[0.6rem] flex items-center justify-center border bg-[#E6E6E6]">
                L
              </div>
              <div className="h-[1.5rem] w-[2.5rem] rounded-full text-[0.6rem] flex items-center justify-center border bg-[#E6E6E6]">
                XL
              </div>
              <div className="h-[1.5rem] w-[2.5rem] rounded-full text-[0.6rem] flex items-center justify-center border bg-[#E6E6E6]">
                XXL
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border rounded-lg space-y-2">
        <h4 className="">What’s Inside</h4>
        <ul className="text-sm list-disc pl-5 text-brand_gray_dark">
          <li className="list-disc">Nail buffer & file set</li>
          <li className="list-disc">Cuticle care tool</li>
          <li className="list-disc">
            Premium polish in Magenta Pink (#FF008C)
          </li>
          <li className="list-disc">Quick-dry top coat</li>
          <li className="list-disc">Compact storage pouch</li>
        </ul>
      </div>

      <div className="p-6 border rounded-lg space-y-2">
        <div className="flex gap-3 text-brand_purple">
          <svg
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.41602 18.4167C5.41602 18.9913 5.64429 19.5424 6.05062 19.9487C6.45695 20.3551 7.00805 20.5833 7.58268 20.5833C8.15732 20.5833 8.70842 20.3551 9.11475 19.9487C9.52108 19.5424 9.74935 18.9913 9.74935 18.4167C9.74935 17.842 9.52108 17.2909 9.11475 16.8846C8.70842 16.4783 8.15732 16.25 7.58268 16.25C7.00805 16.25 6.45695 16.4783 6.05062 16.8846C5.64429 17.2909 5.41602 17.842 5.41602 18.4167ZM16.2493 18.4167C16.2493 18.9913 16.4776 19.5424 16.884 19.9487C17.2903 20.3551 17.8414 20.5833 18.416 20.5833C18.9907 20.5833 19.5418 20.3551 19.9481 19.9487C20.3544 19.5424 20.5827 18.9913 20.5827 18.4167C20.5827 17.842 20.3544 17.2909 19.9481 16.8846C19.5418 16.4783 18.9907 16.25 18.416 16.25C17.8414 16.25 17.2903 16.4783 16.884 16.8846C16.4776 17.2909 16.2493 17.842 16.2493 18.4167Z"
              stroke="#8500CC"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M5.41602 18.418H3.24935V14.0846M2.16602 5.41797H14.0827V18.418M9.74935 18.418H16.2493M20.5827 18.418H22.7493V11.918M22.7493 11.918H14.0827M22.7493 11.918L19.4993 6.5013H14.0827M3.24935 9.7513H7.58268"
              stroke="#8500CC"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          <p className="font-medium">Shipping & Returns</p>
        </div>
        <div className="text-sm">
          <p className="">
            <span className="text-brand_purple font-medium">
              Delivery fee:{" "}
            </span>
            $20.00
          </p>
          <p className="">
            <span className="text-brand_purple font-medium">
              Delivery Time:{" "}
            </span>
            1–3 business days across Nigeria
          </p>
          <p className="">
            <span className="text-brand_purple font-medium">
              Delivery Duration:{" "}
            </span>
            Aug 28-sep 10
          </p>
        </div>
      </div>

      <div className="w-[80%] space-y-4 pt-8">
        <div className="flex gap-4 items-center">
          <button className="h-[2.5rem] bg-brand_pink text-white rounded-full w-[calc(100%-2.5rem)]">
            Add to Cart
          </button>
          <button className="">
            <svg
              width="42"
              height="42"
              className="size-[2.5rem]"
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
        <button className="h-[2.5rem] bg-brand_pink text-white rounded-full w-full">
          Check Out
        </button>
      </div>
    </div>
  );
}
