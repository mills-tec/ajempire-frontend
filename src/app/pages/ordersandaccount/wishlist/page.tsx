"use client";

import { useEffect, useState } from "react";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { useModalStore } from "@/lib/stores/modal-store";
import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import CountdownTimer from "@/components/CountDownTimer";
import WishlistSkeleton from "../components/WishlistSkeleton";
import { calcDiscountPrice } from "@/lib/utils";

function formatPrice(value: number) {
  return Number(value).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
  });
}

export default function WishlistProductsPage() {
  const { items, initWishlist, removeItem } = useWishlistStore();
  const { getItem, setSelectedItem } = useCartStore();
  const openModal = useModalStore((state) => state.openModal);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initWishlist();

    const timer = setTimeout(() => setLoading(false), 500);

    return () => clearTimeout(timer);
  }, [initWishlist]);

  if (loading) return <WishlistSkeleton />;
  if (!items) return <p>Loading wishlist...</p>;

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

  function handleOpenCart(product: Product) {
    setSelectedItem(product);
    openModal("cart");
  }

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="text-center text-gray-500">Your wishlist is empty.</p>
      ) : (
        <AnimatePresence>
          {items.map((product) => {
            const cartItem = getItem(product._id);
            const finalPrice = calcDiscountPrice(
              product.price,
              product.flashSales?.discountValue ?? 0,
              product.flashSales?.discountType ?? "percent",
            );
            const savings = product.price - finalPrice;

            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 200 }}
                transition={{ duration: 0.3 }}
                className="w-full rounded border bg-white p-2 lg:p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/product/${product._id}`}
                    className="min-w-0 flex-1"
                  >
                    <div className="flex gap-4">
                      <div className="relative h-[110px] w-[100px] flex-shrink-0 overflow-hidden rounded bg-[#f9f8f8] lg:w-[110px]">
                        <Image
                          src={product.cover_image || "/placeholder.png"}
                          alt={product.name || "product image"}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="truncate text-sm font-medium">
                          {product.name || "No name"}
                        </p>

                        <p className="w-max rounded-sm bg-brand_purple px-2 py-[2px] text-[0.65rem] text-white">
                          {product.category?.name || "Seller Tag"}
                        </p>

                        <div className="flex items-center gap-2">
                          <div className="flex text-brand_gray_dark">
                            {[...Array(5)].map((_, index) =>
                              index <
                              (product.averageRating
                                ? Number(product.averageRating)
                                : 0) ? (
                                <span key={index}>{filledStar}</span>
                              ) : (
                                <span key={index}>{unfilledStar}</span>
                              ),
                            )}
                          </div>

                          <p className="text-xs text-black/60">
                            {product.numReviews || 0}
                          </p>
                        </div>

                        <p className="text-[0.65rem] text-brand_purple">
                          Only {product.stock ?? 0} left
                        </p>

                        {product.flashSales && savings > 0 && (
                          <div className="flex w-fit items-center gap-2 rounded-sm border border-brand_pink pr-2 text-[7px] lg:text-[10px]">
                            <p className="bg-brand_pink px-2 py-1 text-white">
                              Save {formatPrice(savings)} extra
                            </p>

                            <span className="font-bold text-brand_pink">
                              <CountdownTimer endTime={product.flashSales.endDate} />
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-[14px] font-medium text-brand_pink lg:text-lg">
                            {formatPrice(finalPrice)}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="flex flex-shrink-0 flex-col items-end justify-between gap-3">
                    <button
                      type="button"
                      className="cursor-pointer"
                      aria-label="Remove from wishlist"
                      onClick={() => removeItem(product._id)}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14 7C14 5.61553 13.5895 4.26216 12.8203 3.11101C12.0511 1.95987 10.9579 1.06266 9.67879 0.532846C8.3997 0.003033 6.99224 -0.13559 5.63437 0.134506C4.2765 0.404603 3.02922 1.07129 2.05026 2.05026C1.07129 3.02922 0.404603 4.2765 0.134506 5.63437C-0.13559 6.99224 0.003033 8.3997 0.532846 9.67879C1.06266 10.9579 1.95987 12.0511 3.11101 12.8203C4.26216 13.5895 5.61553 14 7 14C8.85652 14 10.637 13.2625 11.9498 11.9498C13.2625 10.637 14 8.85652 14 7ZM9.7475 8.91334C9.85615 9.02263 9.91713 9.17048 9.91713 9.32459C9.91713 9.4787 9.85615 9.62654 9.7475 9.73584C9.69328 9.79051 9.62876 9.83391 9.55767 9.86352C9.48659 9.89314 9.41034 9.90839 9.33334 9.90839C9.25633 9.90839 9.18009 9.89314 9.109 9.86352C9.03792 9.83391 8.9734 9.79051 8.91917 9.73584L7.105 7.92167C7.07708 7.89626 7.04068 7.88217 7.00292 7.88217C6.96516 7.88217 6.92876 7.89626 6.90084 7.92167L5.08667 9.73584C4.97508 9.8314 4.83153 9.88134 4.68472 9.87567C4.53791 9.87 4.39865 9.80914 4.29476 9.70525C4.19087 9.60136 4.13001 9.4621 4.12434 9.31528C4.11867 9.16847 4.1686 9.02493 4.26417 8.91334L6.07834 7.09917C6.10375 7.07125 6.11784 7.03485 6.11784 6.99709C6.11784 6.95933 6.10375 6.92293 6.07834 6.895L4.26417 5.08084C4.2095 5.02661 4.1661 4.96209 4.13648 4.89101C4.10687 4.81992 4.09162 4.74368 4.09162 4.66667C4.09162 4.58966 4.10687 4.51342 4.13648 4.44233C4.1661 4.37125 4.2095 4.30673 4.26417 4.2525C4.37346 4.14386 4.52131 4.08287 4.67542 4.08287C4.82953 4.08287 4.97738 4.14386 5.08667 4.2525L6.90084 6.06667C6.91393 6.08062 6.92974 6.09174 6.9473 6.09934C6.96486 6.10694 6.98379 6.11086 7.00292 6.11086C7.02205 6.11086 7.04098 6.10694 7.05854 6.09934C7.0761 6.09174 7.09191 6.08062 7.105 6.06667L8.91917 4.2525C8.97356 4.19811 9.03813 4.15497 9.10919 4.12554C9.18025 4.0961 9.25642 4.08095 9.33334 4.08095C9.41026 4.08095 9.48642 4.0961 9.55748 4.12554C9.62854 4.15497 9.69311 4.19811 9.7475 4.2525C9.80189 4.30689 9.84504 4.37146 9.87447 4.44252C9.90391 4.51359 9.91906 4.58975 9.91906 4.66667C9.91906 4.74359 9.90391 4.81975 9.87447 4.89082C9.84504 4.96188 9.80189 5.02645 9.7475 5.08084L7.93334 6.895C7.91939 6.9081 7.90827 6.92391 7.90067 6.94147C7.89307 6.95903 7.88914 6.97795 7.88914 6.99709C7.88914 7.01622 7.89307 7.03515 7.90067 7.05271C7.90827 7.07026 7.91939 7.08608 7.93334 7.09917L9.7475 8.91334Z"
                          fill="black"
                          fillOpacity="0.5"
                        />
                      </svg>
                    </button>

                    <button
                      type="button"
                      className="relative cursor-pointer"
                      aria-label="Open cart options"
                      onClick={() => handleOpenCart(product)}
                    >
                      {cartItem && (
                        <div className="absolute bottom-3 left-5 z-10 flex size-4 items-center justify-center rounded-full bg-brand_pink text-xs font-semibold text-white">
                          <p>{cartItem.quantity}</p>
                        </div>
                      )}

                      <svg
                        width="44"
                        height="30"
                        viewBox="0 0 44 30"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5"
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
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
}
