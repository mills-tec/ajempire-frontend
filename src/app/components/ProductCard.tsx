"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { useCartStore } from "@/lib/stores/cart-store";

export default function ProductCard({
  //  setShowCartPopup,
  product,
}: {
  // setShowCartPopup: React.Dispatch<React.SetStateAction<boolean>>;
  product: Product;
}) {
  // const [rating, setRating] = React.useState(3);
  const setSelectedItem = useCartStore((state) => state.setSelectedItem);

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
    <section className="space-y-2 group text-left hover:shadow-sm hover:rounded-md hover:bg-white p-2 lg:w-[13rem] border border-transparent hover:border-black/10 w-[11rem]">
      <Link href={"product/" + product._id}>
        <div className="relative lg:w-full lg:h-[14rem] w-full h-[10rem] rounded-sm overflow-clip">
          <Image
            src={product.cover_image}
            alt="product image"
            fill
            className="transition-transform duration-300 ease-in-out group-hover:scale-110"
          />
        </div>
      </Link>
      <div className="space-y-1">
        <Link href={"product/2"}>
          <h2 className="text-sm truncate w-full h-min">{product.name}</h2>
        </Link>
        <p className="text-[0.65rem] p-[0.1rem] px-2 bg-brand_purple text-white w-max rounded-sm">
          Seller Tag
        </p>
        <p className="text-[0.65rem] text-brand_purple">
          Only {product.stock} left
        </p>
        <div className="flex items-center gap-2">
          {
            <div className="flex text-brand_gray_dark">
              {[...Array(5)].map((_, i) =>
                i < (product.averageRating ? +product.averageRating : 0) ? (
                  <span key={i}>{filledStar}</span>
                ) : (
                  <span key={i}>{unfilledStar}</span>
                )
              )}
            </div>
          }
          <p className="text-xs lg:text-base text-black/60">
            {product.numReviews}
          </p>
        </div>
        <div className="flex w-full text-[7px] lg:text-[10px] rounded-sm border border-brand_pink">
          <p className="px-2 py-1 bg-brand_pink text-white">
            Save $15,000 extra
          </p>
          <p className="px-2 py-1 text-brand_pink">03:05:36</p>
        </div>
        <div className="flex items-center gap-2 pt-1 justify-between">
          <div className="flex  items-center gap-2">
            <h3 className="text-[14px] lg:text-lg font-medium text-brand_pink">
              N{product.price}
            </h3>
            <p className="text-[10px] lg:text-xs text-black/60">1k+sold</p>
          </div>
          <div className="flex lg:gap-2 gap-1 items-center">
            <svg
              width="23"
              height="22"
              viewBox="0 0 23 22"
              className="cursor-pointer size-4"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.14662 10.8687C2.68703 10.3804 2.32291 9.79925 2.07546 9.159C1.82801 8.51875 1.70218 7.83223 1.70531 7.13945C1.70531 5.73829 2.22577 4.39452 3.15219 3.40376C4.07861 2.41299 5.33511 1.85638 6.64527 1.85638C8.48177 1.85638 10.0858 2.92542 10.9343 4.51656H12.2361C12.6675 3.70739 13.2917 3.03492 14.0451 2.56764C14.7985 2.10035 15.6542 1.85493 16.5252 1.85638C17.8353 1.85638 19.0918 2.41299 20.0183 3.40376C20.9447 4.39452 21.4651 5.73829 21.4651 7.13945C21.4651 8.59385 20.884 9.93637 20.0238 10.8687L11.5852 19.881L3.14662 10.8687ZM20.8375 11.7513C21.9417 10.5579 22.6275 8.94191 22.6275 7.13945C22.6275 5.40861 21.9846 3.74866 20.8402 2.52477C19.6958 1.30088 18.1436 0.613304 16.5252 0.613304C14.4911 0.613304 12.6894 1.66992 11.5852 3.31078C11.0216 2.47356 10.2795 1.79213 9.42033 1.32301C8.56122 0.853887 7.60989 0.610591 6.64527 0.613304C5.02684 0.613304 3.47469 1.30088 2.33029 2.52477C1.18589 3.74866 0.542969 5.40861 0.542969 7.13945C0.542969 8.94191 1.22875 10.5579 2.33298 11.7513L11.5852 21.6461L20.8375 11.7513Z"
                fill="black"
              />
            </svg>
            <svg
              width="44"
              height="30"
              viewBox="0 0 44 30"
              fill="none"
              onClick={() => {
                // addItem({ ...product, quantity: 1 });
                setSelectedItem(product);
              }}
              className="cursor-pointer h-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="1.16975"
                y="0.720532"
                width="42.4258"
                height="28.5585"
                rx="14.2793"
                stroke="black"
                strokeWidth="0.808251"
              />
              <path
                d="M18.5755 21.8832C18.5758 21.6047 18.8038 21.3791 19.0842 21.3791C19.3645 21.3793 19.5913 21.6048 19.5916 21.8832C19.5916 22.1317 19.6911 22.3706 19.8678 22.5464C20.0448 22.7221 20.2851 22.8208 20.5353 22.8209C20.7855 22.8209 21.0258 22.7222 21.2027 22.5464C21.3795 22.3706 21.479 22.1317 21.479 21.8832C21.4793 21.6048 21.7062 21.3793 21.9864 21.3791C22.2668 21.3791 22.4948 21.6047 22.495 21.8832C22.495 22.3995 22.288 22.8957 21.9205 23.2608C21.5531 23.6257 21.0548 23.8303 20.5353 23.8303C20.0158 23.8303 19.5175 23.6257 19.15 23.2608C18.7826 22.8957 18.5755 22.3995 18.5755 21.8832ZM24.3812 21.8832C24.3815 21.6047 24.6095 21.3791 24.8899 21.3791C25.1702 21.3792 25.397 21.6047 25.3972 21.8832C25.3972 22.1316 25.4968 22.3706 25.6735 22.5464C25.8504 22.7221 26.0909 22.8208 26.341 22.8209C26.5912 22.8209 26.8315 22.7222 27.0084 22.5464C27.1853 22.3706 27.2847 22.1318 27.2847 21.8832C27.285 21.6047 27.513 21.3791 27.7934 21.3791C28.0735 21.3794 28.3004 21.6049 28.3007 21.8832C28.3007 22.3996 28.0937 22.8957 27.7262 23.2608C27.3588 23.6256 26.8604 23.8303 26.341 23.8303C25.8215 23.8303 25.3231 23.6257 24.9557 23.2608C24.5882 22.8957 24.3812 22.3995 24.3812 21.8832ZM13.3741 6.01746C13.6428 5.93744 13.926 6.08913 14.0066 6.3561L14.6238 8.39944H32.6308C32.7914 8.39944 32.9429 8.47538 33.0387 8.60339C33.1345 8.73138 33.1636 8.89701 33.1175 9.04977L30.214 18.6636C30.1496 18.8769 29.9527 19.0238 29.7286 19.0241H17.149C16.9246 19.0241 16.7267 18.8771 16.6623 18.6636L13.0332 6.64599C12.9527 6.37902 13.1054 6.09755 13.3741 6.01746ZM17.5272 18.0146H29.3503L31.9478 9.40893H14.9284L17.5272 18.0146ZM22.4382 15.6339V14.2165H21.0117C20.7311 14.2165 20.503 13.9899 20.503 13.7111C20.5033 13.4326 20.7313 13.207 21.0117 13.207H22.4382V11.7883C22.4385 11.5098 22.6665 11.2842 22.9469 11.2842C23.2272 11.2843 23.454 11.5099 23.4543 11.7883V13.207H24.8821C25.1625 13.2071 25.3892 13.4326 25.3895 13.7111C25.3895 13.9898 25.1627 14.2164 24.8821 14.2165H23.4543V15.6339C23.4543 15.9126 23.2274 16.1392 22.9469 16.1393C22.6663 16.1393 22.4382 15.9126 22.4382 15.6339Z"
                fill="black"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
