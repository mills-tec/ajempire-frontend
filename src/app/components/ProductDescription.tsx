"use client";
import { useCartStore } from "@/lib/stores/cart-store";
import { ProductResponse } from "@/lib/types";
import { calcDiscount, calcDiscountPrice } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import CheckoutRequirement from "./CheckoutRequirement";
import { toast } from "sonner";
import { getBearerToken, getUsersWishlist } from "@/lib/api";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import CountdownTimer from "@/components/CountDownTimer";
import { useModalStore } from "@/lib/stores/modal-store";
import { useProductVariants } from "@/lib/useProductVariants";
import { useRef } from "react";

export default function ProductDescription({
  product_data,
  handleSelectCover,
}: {
  product_data: ProductResponse;
  handleSelectCover: (src: string, type: string) => void;
}) {
  let { product } = product_data.message;
  console.log("product: ", product.variants);
  const {
    getItem,
    addItem,
    removeItem,
    decreaseQuantity,
    increaseQuantity,
    setSelectedVariants: setCartSelectedVariants,
    setQuantity: setCartItemQty,
  } = useCartStore();
  const {
    items: wishlistItems,
    addItem: addWishlistItem,
    removeItem: removeWishlistItem,
    isInWishlist,
  } = useWishlistStore();
  const {
    selectedOptions,
    selectOption,
    isValidOption,
    selectedCombination,
    currentStock,
    hasVariants,
  } = useProductVariants(product);
  const openModal = useModalStore((s) => s.openModal);

  useEffect(() => {
    const fetchWishlist = async () => {
      const wishlist = await getUsersWishlist();
      // You might want to do something with wishlist here
      // console.log("wishlist: ", wishlist);
    };
    fetchWishlist();
  }, []);
  const checkoutHandler = () => {
    const token = getBearerToken();
    if (!token) {
      toast.error("Please log in to checkout");
      openModal("authwrapper");
      return;
    }

    if (hasVariants) {
      const missing = product.variants!.filter((v) => !selectedOptions[v.name]);

      if (missing.length > 0) {
        triggerVariantError(missing[0].name);
        toast.error(`Please select ${missing[0].name}`);
        return;
      }
    }

    const selectedVariantsArray = Object.entries(selectedOptions).map(
      ([name, value]) => ({ name, value }),
    );

    const { getItem, addItem, selectAllCartItems, getSelectedItems } =
      useCartStore.getState();

    // const existingItem = getItem(product._id);
    const existingItem = useCartStore
      .getState()
      .items.find(
        (i) =>
          i._id === product._id &&
          JSON.stringify(i.selectedVariants) ===
            JSON.stringify(selectedVariantsArray),
      );

    if (!existingItem) {
      addItem({
        ...product,
        quantity,
        selectedVariants: selectedVariantsArray, // ✅ FIXED
        selected: true,
      });
    }

    selectAllCartItems();

    setTimeout(() => {
      const selectedItems = getSelectedItems();
      console.log("Selected items:", selectedItems);
      openModal("checkout");
    }, 0);
  };
  const item = getItem(product._id);
  const [quantity, setQuantity] = useState(() =>
    item ? (item.quantity === 0 ? 1 : item.quantity) : 1,
  );

  useEffect(() => {
    // If the item no longer exists, do nothing
    if (!item) return;

    // Remove item if quantity is 0
    if (quantity === 0) {
      removeItem(item._id);
      return;
    }

    // Update cart store with the new quantity
    setCartItemQty(item._id, quantity);
  }, [quantity, item?._id]);

  useEffect(() => {
    // If the item no longer exists, do nothing
    if (!item) return;

    // If the quantity in cart store diverges from this state, update local state
    if (item.quantity !== quantity) {
      setQuantity(item.quantity === 0 ? 1 : item.quantity);
    }
  }, [item?.quantity]);

  const variant_set = new Set<string>();

  for (const variant of product?.variants || []) {
    variant_set.add(variant.name);
  }

  const basePrice =
    hasVariants && selectedCombination
      ? product.price + selectedCombination.additionalPrice
      : product.price;

  const finalPrice = product.flashSales
    ? calcDiscountPrice(
        basePrice,
        product.flashSales.discountValue,
        product.flashSales.discountType,
      )
    : basePrice;

  const filledStar = (
    <svg
      width="16"
      height="16  "
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

  console.log("currentStock: ", currentStock);

  const missingVariants = product.variants!.filter(
    (v) => !selectedOptions[v.name],
  );
  const variantRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const triggerVariantError = (variantName: string) => {
    const el = variantRefs.current[variantName];
    if (!el) return;

    // scroll into view
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // add shake animation
    el.classList.add("shake");

    setTimeout(() => {
      el.classList.remove("shake");
    }, 500);
  };

  // ✅ DEBUG: log what user selects
  useEffect(() => {
    console.log("Selected Options:", selectedOptions);
    console.log("Selected Combination:", selectedCombination);
  }, [selectedOptions, selectedCombination]);

  return (
    <div className="space-y-4">
      <h1 className="font-medium text-sm lg:text-base">{product.name}</h1>
      <p className="text-brand_gray_dark text-sm lg:text-base">
        {product.description}
      </p>

      <div className="space-y-3">
        <div className="flex justify-between">
          {product.itemsSold! > 0 && (
            <p className="text-sm text-black/60">
              {product.itemsSold! > 1000
                ? (product.itemsSold! / 1000).toFixed(1) + "k"
                : product.itemsSold!}{" "}
              Sold
            </p>
          )}
          <div className="flex items-center gap-2">
            {
              <div className="flex text-brand_gray_dark">
                {[...Array(5)].map((_, i) =>
                  i < (product.averageRating || 0) ? (
                    <span key={i}>{filledStar}</span>
                  ) : (
                    <span key={i}>{unfilledStar}</span>
                  ),
                )}
              </div>
            }
            <p className="text-black/60 text-xs">{product?.reviews!.length}</p>
          </div>
        </div>

        <div className="flex items-center">
         {product.flashSales && (
  <>
    <h3 className="text-base lg:text-2xl text-brand_pink font-medium">
      {Number(
        calcDiscountPrice(
          product.price,
          product.flashSales.discountValue,
          product.flashSales.discountType,
        ),
      ).toLocaleString("en-NG", {
        style: "currency",
        currency: "NGN",
      })}
    </h3>

    <h4 className="text-[10px] lg:text-xs ml-2 line-through">
      {Number(basePrice).toLocaleString("en-NG", {
        style: "currency",
        currency: "NGN",
      })}
    </h4>

    <div className="text-[11px] text-brand_pink border border-brand_pink ml-4 p-1 rounded-sm">
      <p>
        {product.flashSales.discountValue}
        {product.flashSales.discountType === "percent" ? "%" : ""} OFF Limited time
      </p>
    </div>
  </>
)}
        <div>
          {currentStock < 10 ? (
            <p className="text-sm font-semibold text-red-500">
              {currentStock} left in stock
            </p>
          ) : (
            <p className="text-[0.65rem] font-semibold text-brand_purple">
              {currentStock} left in stock
            </p>
          )}
        </div>

        {product.flashSales && (
          <div className=" text-[11.11px] lg:text-xs flex items-center gap-4 text-brand_pink">
            <p className="font-medium">
              Only{" "}
              {Number(
                calcDiscountPrice(
                  product.price,
                  product.flashSales.discountValue!,
                  product.flashSales.discountType!,
                ),
              ).toLocaleString("en-NG", {
                style: "currency",
                currency: "NGN",
              })}{" "}
              with extra{" "}
              {Number(
                calcDiscount(
                  product.price,
                  product.flashSales.discountValue!,
                  product.flashSales.discountType!,
                ),
              ).toLocaleString("en-NG", {
                style: "currency",
                currency: "NGN",
              })}{" "}
              off | Ends in
            </p>
            <p className="border border-brand_pink p-[0.1rem] px-1 rounded-sm">
              <CountdownTimer endTime={product.flashSales!.endDate} />
            </p>
          </div>
        )}
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
              setQuantity((prev) => Math.min(prev + 1, currentStock!))
            }
            className="size-[1.5rem] rounded-md border border-black/40 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      <div className="lg:flex gap-6">
        {/* ✅ ONLY show if product has variants */}
        {hasVariants && (
          <div className="lg:flex gap-6">
            {product.variants!.map((variant, key) => (
              <div
                key={key}
                ref={(el) => (variantRefs.current[variant.name] = el)}
                className="space-y-2 mt-4 lg:mt-0"
              >
                <p className="text-xs text-brand_gray_dark capitalize">
                  Select Property ({variant.name}):
                </p>

                <div className="flex gap-2">
                  {variant.values.map((value, idx) => {
                    const isValid = isValidOption(variant.name, value);
                    const isSelected = selectedOptions[variant.name] === value;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (!isValid) return;
                          selectOption(variant.name, value);
                        }}
                        className={`relative size-[2rem] flex items-center justify-center text-xs cursor-pointer transition-all duration-200 border border-[#BFBFBF]
                                  ${
                                    isSelected
                                      ? "after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-[3px] after:bg-purple-600"
                                      : ""
                                  } ${!isValid ? "opacity-30 cursor-not-allowed" : ""}`}
                        style={{
                          backgroundColor:
                            variant.name.toLowerCase() === "color"
                              ? value
                              : undefined,
                        }}
                      >
                        {variant.name.toLowerCase() === "size"
                          ? value.toUpperCase()
                          : ""}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 border rounded-lg space-y-2">
        <h4 className=" text-sm lg:text-base">What’s Inside</h4>
        <ul className="text-[11.11px] lg:text-sm list-disc pl-5 text-brand_gray_dark">
          {product.whatsInside!.length > 0 ? (
            product.whatsInside!.map((item, key) => (
              <li key={key} className="list-disc">
                {item}
              </li>
            ))
          ) : (
            <p className="text-gray-400">This data is currently unavailable</p>
          )}
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
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.41602 18.418H3.24935V14.0846M2.16602 5.41797H14.0827V18.418M9.74935 18.418H16.2493M20.5827 18.418H22.7493V11.918M22.7493 11.918H14.0827M22.7493 11.918L19.4993 6.5013H14.0827M3.24935 9.7513H7.58268"
              stroke="#8500CC"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p className="font-medium text-sm lg:text-base">Shipping & Returns</p>
        </div>
        <div className="text-[11.11px] lg:text-sm">
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

      <div className="hidden lg:block w-[80%] space-y-4 pt-8">
        <div className="flex gap-4 items-center">
          {!item ? (
            <button
              onClick={() => {
                if (hasVariants) {
                  const missing = product.variants?.filter(
                    (v) => !selectedOptions[v.name],
                  );

                  if (missing?.length! > 0) {
                    triggerVariantError(missing![0].name);
                    toast.error(`Please select ${missing![0].name}`);
                    return;
                  }
                }

                addItem({
                  ...product,
                  quantity,
                  selected: false,
                  selectedVariants: Object.entries(selectedOptions).map(
                    ([name, value]) => ({ name, value }),
                  ),
                });
              }}
              className="h-[2.5rem] bg-brand_pink text-white rounded-full w-[calc(100%-2.5rem)]"
            >
              Add to Cart
            </button>
          ) : (
            <div
              // onClick={() => addItem({ ...item, quantity })}
              className="h-[2rem] lg:h-[2.5rem] flex font-bold justify-between text-xs border-2 items-center border-brand_pink text-brand_gray_dark rounded-full w-[8rem] overflow-clip"
            >
              <button
                onClick={() => decreaseQuantity(item._id)}
                className="size-[2.5rem] rounded-full border flex items-center text-brand_pink font-semibold justify-center border-brand_pink"
              >
                -
              </button>
              {item?.quantity}
              <button
                onClick={() => increaseQuantity(item._id)}
                className="size-[2.5rem] rounded-full border flex items-center text-brand_pink font-semibold justify-center border-brand_pink"
              >
                +
              </button>
            </div>
          )}

          <button
            onClick={() => {
              if (isInWishlist(product._id)) removeWishlistItem(product._id);
              else addWishlistItem(product);
            }}
          >
            {isInWishlist(product._id) ? (
              <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                <circle cx="21" cy="21" r="20.5" stroke="#FF008C" />
                <path
                  d="M14.0677 20.6154C13.7027 20.2528 13.4135 19.8213 13.217 19.3458C13.0205 18.8704 12.9206 18.3606 12.9231 17.8462C12.9231 16.8057 13.3364 15.8079 14.0721 15.0721C14.8078 14.3364 15.8057 13.9231 16.8462 13.9231C18.3046 13.9231 19.5785 14.7169 20.2523 15.8985H21.2862C21.6287 15.2976 22.1244 14.7983 22.7227 14.4513C23.3211 14.1043 24.0006 13.922 24.6923 13.9231C25.7328 13.9231 26.7306 14.3364 27.4663 15.0721C28.2021 15.8079 28.6154 16.8057 28.6154 17.8462C28.6154 18.9262 28.1538 19.9231 27.4708 20.6154L20.7692 27.3077L14.0677 20.6154Z"
                  fill="#FF008C"
                />
              </svg>
            ) : (
              <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                <circle cx="21" cy="21" r="20.5" stroke="#999999" />
                <path
                  d="M14.0677 20.6154C13.7027 20.2528 13.4135 19.8213 13.217 19.3458C13.0205 18.8704 12.9206 18.3606 12.9231 17.8462C12.9231 16.8057 13.3364 15.8079 14.0721 15.0721C14.8078 14.3364 15.8057 13.9231 16.8462 13.9231C18.3046 13.9231 19.5785 14.7169 20.2523 15.8985H21.2862C21.6287 15.2976 22.1244 14.7983 22.7227 14.4513C23.3211 14.1043 24.0006 13.922 24.6923 13.9231C25.7328 13.9231 26.7306 14.3364 27.4663 15.0721C28.2021 15.8079 28.6154 16.8057 28.6154 17.8462C28.6154 18.9262 28.1538 19.9231 27.4708 20.6154L20.7692 27.3077L14.0677 20.6154Z"
                  fill="black"
                />
              </svg>
            )}
          </button>
        </div>
        <button
          className="h-[2.5rem] bg-brand_pink text-white rounded-full w-full"
          onClick={checkoutHandler}
        >
          Check Out
        </button>
      </div>
    </div>
  );
}
