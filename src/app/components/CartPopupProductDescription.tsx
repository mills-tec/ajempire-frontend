"use client";
import { getBearerToken } from "@/lib/api";
import {
  CartItem,
  useCartStore,
  areVariantsEqual,
} from "@/lib/stores/cart-store";
import { calcDiscountPrice } from "@/lib/utils";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { animateToCart } from "@/lib/animateToCart";
import CountdownTimer from "@/components/CountDownTimer";
import { useModalStore } from "@/lib/stores/modal-store";
import { useProductVariants } from "@/lib/useProductVariants";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

interface Props {
  item: CartItem;
  cartRef: React.RefObject<HTMLAnchorElement | null>;
}

export default function CartPopupProductDescription({ item, cartRef }: Props) {
  // const [rating, setRating] = React.useState(4);

  const cartItems = useCartStore((state) => state.items);
  const selectAllCartItems = useCartStore((state) => state.selectAllCartItems);
  const clearSelectedItem = useCartStore((state) => state.clearSelectedItem);
  const openModal = useModalStore((s) => s.openModal);
  const {
    addItem,
    removeItem,
    setSelectedVariants: setCartSelectedVariants,
    setQuantity: setCartItemQty,
  } = useCartStore();

  const {
    selectedOptions,
    selectOption,
    isValidOption,
    selectedVariantsArray,
    missingVariantName,
    selectedCombination,
    currentStock,
    hasVariants,
  } = useProductVariants(item);
  const cartItem = useMemo(() => {
    if (!hasVariants) {
      return cartItems.find((cartItem) => cartItem._id === item._id);
    }

    if (selectedVariantsArray.length !== (item.variants?.length ?? 0)) {
      return undefined;
    }

    return cartItems.find(
      (cartItem) =>
        cartItem._id === item._id &&
        areVariantsEqual(cartItem.selectedVariants, selectedVariantsArray),
    );
  }, [cartItems, hasVariants, item._id, item.variants, selectedVariantsArray]);
  const [quantity, setQuantity] = useState(cartItem?.quantity || 1);
  const {
    addItem: addWishlistItem,
    removeItem: removeWishlistItem,
    isInWishlist,
  } = useWishlistStore();

  const checkoutHandler = () => {
    if (!ensureVariantSelection()) {
      return;
    }

    const token = getBearerToken();
    if (!token) {
      toast.error("Please log in to checkout", { position: "top-right" });
      openModal("authwrapper");
      return;
    }

    clearSelectedItem(); // close cart
    openModal("checkout");

    if (!cartItem) {
      addItem({
        ...item,
        price: basePrice,
        stock: currentStock,
        quantity,
        selectedVariants: selectedVariantsArray,
      });
    }

    selectAllCartItems();
  };

  useEffect(() => {
    if (!cartItem) return; // 🚨 ONLY update if item exists in cart

    setCartSelectedVariants(item._id, selectedVariantsArray);
  }, [selectedVariantsArray, cartItem, item._id, setCartSelectedVariants]);

  // Sync local quantity FROM cart only on initial mount or when a new cartItem appears
  useEffect(() => {
    if (cartItem) {
      setQuantity((prev) =>
        prev !== cartItem.quantity ? (cartItem.quantity > 0 ? cartItem.quantity : 1) : prev
      );
    } else {
      setQuantity(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItem?._id, cartItem?.selectedVariants]); // only re-run when the identity of cartItem changes, NOT its quantity

  // Sync local quantity TO cart
  useEffect(() => {
    if (!cartItem) return;

    if (quantity <= 0) {
      removeItem(cartItem._id);
    } else if (cartItem.quantity !== quantity) {
      setCartItemQty(cartItem._id, quantity);
    }
  }, [quantity]); // intentionally omit cartItem — we only want this to fire when the user changes quantity

  // useEffect(() => {
  //   if (cartItem) {
  //     setQuantity(cartItem.quantity > 0 ? cartItem.quantity : 1);
  //   } else {
  //     setQuantity(1); // reset if item removed
  //   }
  // }, [cartItem]);


  // useEffect(() => {
  //   if (!cartItem) return;

  //   if (quantity <= 0) {
  //     removeItem(cartItem._id);
  //   } else if (cartItem.quantity !== quantity) {
  //     setCartItemQty(cartItem._id, quantity);
  //   }
  // }, [cartItem, quantity]);

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
  const basePrice =
    hasVariants && selectedCombination
      ? item.price + selectedCombination.additionalPrice
      : item.price;

  const finalPrice = item.flashSales
    ? calcDiscountPrice(
      basePrice,
      item.flashSales.discountValue!,
      item.flashSales.discountType!,
    )
    : basePrice;
  const variantRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const triggerVariantError = (variantName: string) => {
    const el = variantRefs.current[variantName];
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("shake");

    setTimeout(() => {
      el.classList.remove("shake");
    }, 500);
  };

  const ensureVariantSelection = () => {
    if (!hasVariants || !missingVariantName) return true;

    triggerVariantError(missingVariantName);
    toast.error(`Please select ${missingVariantName}`);
    return false;
  };
  return (
    <div className="space-y-4 lg:space-y-8">
      <div className="space-y-1 px-4">
        <h1 className="font-medium text-sm lg:text-lg">{item.name}</h1>

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
                    ),
                  )}
                </div>
              }
              <p className="text-black/60 text-xs">
                {item.reviews?.length ?? 0}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            {item.flashSales ? (
              <>
                <h3 className="text-base lg:text-2xl text-brand_pink font-medium">
                  {Number(finalPrice).toLocaleString("en-NG", {
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
              </>
            ) : (
              <h3 className="text-base lg:text-2xl text-brand_pink font-medium">
                {Number(item.price).toLocaleString("en-NG", {
                  style: "currency",
                  currency: "NGN",
                })}
              </h3>
            )}

            {item.flashSales && (
              <div className="text-[11.11px] lg:text-xs text-brand_pink border border-brand_pink ml-4 p-1 rounded-sm">
                <p>
                  {item.flashSales.discountType === "percent"
                    ? `${item.flashSales.discountValue}%`
                    : `₦${item.flashSales.discountValue}`}{" "}
                  OFF Limited time
                </p>
              </div>
            )}
          </div>

          {item.flashSales && (
            <div className=" text-[11.11px] lg:text-xs flex items-center gap-4 text-brand_pink">
              <p className="font-medium">
                Only{" "}
                {Number(
                  calcDiscountPrice(
                    item.price,
                    item.flashSales.discountValue!,
                    item.flashSales.discountType!,
                  ),
                ).toLocaleString("en-NG", {
                  style: "currency",
                  currency: "NGN",
                })}{" "}
                with extra{" "}
                {Number(
                  (
                    item.price -
                    calcDiscountPrice(
                      item.price,
                      item.flashSales!.discountValue!,
                      item.flashSales!.discountType!,
                    )
                  ).toFixed(2),
                ).toLocaleString("en-NG", {
                  style: "currency",
                  currency: "NGN",
                })}{" "}
                off | Ends in
              </p>
              <p className="border border-brand_pink p-[0.1rem] px-1 rounded-sm">
                <CountdownTimer endTime={item.flashSales.endDate} />
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-5 px-4">
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
              setQuantity((prev) => Math.min(prev + 1, currentStock))
            }
            className="size-[1.5rem] rounded-md border border-black/40 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex justify-between px-4">
        <div className="flex gap-6">
          {hasVariants && (
            <div className="flex gap-6 px-4">
              {item.variants!.map((variant, key) => (
                <div
                  key={key}
                  ref={(el) => {
                    variantRefs.current[variant.name] = el;
                  }}
                  className="space-y-2 mt-4"
                >
                  <p className="text-xs text-brand_gray_dark capitalize">
                    Select Property ({variant.name}):
                  </p>

                  <div className="flex gap-2">
                    {variant.values.map((value, idx) => {
                      const isValid = isValidOption(variant.name, value);
                      const isSelected =
                        selectedOptions[variant.name] === value;

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (!isValid) return;
                            selectOption(variant.name, value);
                          }}
                          className={`relative size-[2rem] flex items-center justify-center text-xs cursor-pointer transition-all duration-200 border border-[#BFBFBF]
                  ${isSelected
                              ? "after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-[3px] after:bg-purple-600"
                              : ""
                            }
                  ${!isValid ? "opacity-30 cursor-not-allowed" : ""}
                `}
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
      </div>

      <div className="w-full flex items-center sticky !bottom-0 pt-4 px-4 pb-4 lg:py-4 bg-white border-t border-t-black/40 gap-8">
        <div className="flex gap-2 items-center">
          {!cartItem ? (
            <button
              // onClick={() =>
              //   addItem({
              //     ...item,
              //     quantity,
              //     selectedVariants: selectedVariants ?? [],
              //   })
              // }
              onClick={(e) => {
                if (!ensureVariantSelection()) {
                  return;
                }

                animateToCart({
                  buttonElement: e.currentTarget,
                  cartElement: cartRef.current!,
                  addItemCallback: () =>
                    addItem({
                      ...item,
                      price: basePrice,
                      stock: currentStock,
                      quantity: quantity || 1,
                      selectedVariants: selectedVariantsArray,
                      selected: true,
                    }),
                });
              }}
              className="h-[2rem] lg:h-[3rem] text-xs bg-brand_pink text-white rounded-full w-max  px-8"
            >
              Add to Cart
            </button>
          ) : (
            <div
              // onClick={() => addItem({ ...item, quantity })}
              className="h-[2rem] lg:h-[3rem] flex font-bold justify-between text-xs lg:text-base border-2 items-center border-brand_pink text-brand_gray_dark rounded-full w-[8rem] lg:w-[10rem] overflow-clip"
            >
              <button
                onClick={() => {
                  setQuantity((prev) => Math.max(prev - 1, 0));
                  if (quantity == 0) {
                    removeItem(item._id);
                  }
                }}
                className="size-[2rem] lg:size-[3rem]  rounded-full border flex items-center text-brand_pink font-semibold justify-center border-brand_pink"
              >
                -
              </button>
              {quantity}
              <button
                onClick={() =>
                  setQuantity((prev) => Math.min(prev + 1, currentStock))
                }
                className="size-[2rem] lg:size-[3rem]  rounded-full border flex items-center text-brand_pink font-semibold justify-center border-brand_pink"
              >
                +
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              if (isInWishlist(item._id)) {
                void removeWishlistItem(item._id);
                return;
              }

              void addWishlistItem(item);
            }}
          >
            {isInWishlist(item._id) ? (
              <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                <circle cx="21" cy="21" r="20.5" stroke="#FF008C" />
                <path
                  d="M14.0677 20.6154C13.7027 20.2528 13.4135 19.8213 13.217 19.3458C13.0205 18.8704 12.9206 18.3606 12.9231 17.8462C12.9231 16.8057 13.3364 15.8079 14.0721 15.0721C14.8078 14.3364 15.8057 13.9231 16.8462 13.9231C18.3046 13.9231 19.5785 14.7169 20.2523 15.8985H21.2862C21.6287 15.2976 22.1244 14.7983 22.7227 14.4513C23.3211 14.1043 24.0006 13.922 24.6923 13.9231C25.7328 13.9231 26.7306 14.3364 27.4663 15.0721C28.2021 15.8079 28.6154 16.8057 28.6154 17.8462C28.6154 18.9262 28.1538 19.9231 27.4708 20.6154L20.7692 27.3077L14.0677 20.6154Z"
                  fill="#FF008C"
                />
              </svg>
            ) : (
              <svg
                width="42"
                height="42"
                className="size-[2rem] lg:size-[3rem]"
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
            )}
          </button>
        </div>
        <div className="w-full">
          <button
            className="h-[2rem] lg:h-[3rem] text-xs bg-brand_pink text-white rounded-full w-full"
            onClick={() => {
              checkoutHandler(); // open checkout modal
            }}
          >
            Check Out
          </button>
        </div>
      </div>
    </div>
  );
}
