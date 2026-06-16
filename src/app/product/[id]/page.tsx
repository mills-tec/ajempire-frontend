"use client";
import CommentCard from "@/app/components/CommentCard";
import ProductDescription from "@/app/components/ProductDescription";
import ProductReview from "@/app/components/ProductReview";
import RefreshWrapper from "@/app/components/RefreshWrapper";
import DraggableCartButton from "@/app/components/ui/DraggableCartButton";
import ScrollToTop from "@/app/components/ui/ScrollToTop";
import ProductDetailSkeleton from "@/app/pages/ordersandaccount/components/ProductDetailSkeleton";
import RelatedProducts from "@/components/RelatedProducts";
import { Checkbox } from "@/components/ui/checkbox";
import VideoPlayer from "@/components/VideoPlayer";
import { animateToCart } from "@/lib/animateToCart";
import { getBearerToken, getProduct } from "@/lib/api";
import { areVariantsEqual, useCartStore } from "@/lib/stores/cart-store";
import { useModalStore } from "@/lib/stores/modal-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { useProductVariants } from "@/lib/useProductVariants";
import { calcDiscountPrice } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const cartRef = useRef<HTMLAnchorElement>(null);

  const handleShare = async (productName: string) => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: productName, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  // ✅ All hooks must be at the top and unconditional
  const {
    items,
    decreaseQuantity,
    increaseQuantity,
    toggleItemSelect,
    deselectAllCartItems,
    selectAllCartItems,
    addItem,
    removeItem,
    setQuantity: setCartItemQty,
  } = useCartStore();
  const {
    addItem: addWishlistItem,
    removeItem: removeWishlistItem,
    isInWishlist,
  } = useWishlistStore();

  // const { addProductToBrowsingHistory } = useExploreInterest();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: !!id,
    retry: false,
  });

  // 🌀 Base variables
  const item = data?.message?.product ?? null;

  useEffect(() => {
    if (item?._id && getBearerToken()) {
      // addProductToBrowsingHistory(item._id);
    }
  }, [item?._id]);
  const {
    selectedVariantsArray,
    missingVariantName,
    selectedCombination,
    currentStock,
    hasVariants,
    availableVariants,
  } = useProductVariants(item);
  const cartItem = useMemo(() => {
    if (!item) return null;

    if (!hasVariants) {
      return items.find((cartItem) => cartItem._id === item._id) ?? null;
    }

    if (selectedVariantsArray.length !== availableVariants.length) {
      return null;
    }

    return (
      items.find(
        (cartItem) =>
          cartItem._id === item._id &&
          areVariantsEqual(cartItem.selectedVariants, selectedVariantsArray),
      ) ?? null
    );
  }, [
    availableVariants.length,
    hasVariants,
    item,
    items,
    selectedVariantsArray,
  ]);

  const [quantity, setQuantity] = useState(
    cartItem?.quantity && cartItem.quantity > 0 ? cartItem.quantity : 1,
  );

  const [currentCoverItem, setCurrentCoverItem] = useState<{
    src: string;
    type: "image" | "video";
  }>({
    src: "",
    type: "image",
  });

  const openModal = useModalStore((s) => s.openModal);

  const ensureVariantSelection = useCallback(() => {
    if (!hasVariants || !missingVariantName) return true;
    toast.error(`Please select ${missingVariantName}`);
    return false;
  }, [hasVariants, missingVariantName]);

  const resolvedCartPrice =
    item && selectedCombination
      ? item.price + selectedCombination.additionalPrice
      : (item?.price ?? 0);

  const resolvedFinalPrice = item?.flashSales
    ? calcDiscountPrice(
        resolvedCartPrice,
        item.flashSales.discountValue!,
        item.flashSales.discountType!,
      )
    : resolvedCartPrice;
  const resolvedDiscount = resolvedCartPrice - resolvedFinalPrice;
  const checkoutHandler = useCallback(() => {
    if (!ensureVariantSelection()) return;

    const token = getBearerToken();
    if (!token) {
      toast.error("Please log in to checkout");
      openModal("authwrapper");
      return;
    }

    const currentItem = data?.message?.product;
    if (!currentItem || !currentItem._id) {
      toast.error("Product not loaded yet");
      return;
    }

    const store = useCartStore.getState();
    const existingItem = store.items.find(
      (cartItem) =>
        cartItem._id === currentItem._id &&
        areVariantsEqual(cartItem.selectedVariants, selectedVariantsArray),
    );

    if (!existingItem) {
      store.addItem([
        {
          ...currentItem,
          price: resolvedCartPrice,
          basePrice: resolvedCartPrice,
          finalPrice: resolvedFinalPrice,
          discount: resolvedDiscount,
          stock: currentStock,
          quantity,
          selectedVariants: selectedVariantsArray,
          selected: true,
        } as any,
      ]);
    }

    store.selectAllCartItems();
    openModal("checkout");
  }, [
    ensureVariantSelection,
    data,
    resolvedCartPrice,
    currentStock,
    quantity,
    selectedVariantsArray,
    openModal,
  ]);

  const [video, setVideo] = useState({
    showPlay: true,
    muted: true,
  });

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const [playingMap, setPlayingMap] = useState<Record<string, boolean>>({});
  const [loadedMedia, setLoadedMedia] = useState<Record<string, boolean>>({});
  const handleVideoPlay = useCallback((id: string) => {
    setPlayingMap((prev) => ({ ...prev, [id]: !prev[id] }));
    setVideo((prev) => ({ ...prev, showPlay: true }));
    const videoEl = videoRefs.current[id];
    if (videoEl?.paused) {
      videoEl.play();
    } else {
      videoEl?.pause();
    }
  }, []);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const markMediaLoaded = useCallback((src: string) => {
    if (!src) return;

    setLoadedMedia((prev) =>
      prev[src]
        ? prev
        : {
            ...prev,
            [src]: true,
          },
    );
  }, []);

  useEffect(() => {
    if (!item || !cartItem) return;

    if (quantity === 0) {
      removeItem(cartItem._id);
    } else if (cartItem.quantity !== quantity) {
      setCartItemQty(cartItem._id, quantity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity, cartItem, item]);

  useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity > 0 ? cartItem.quantity : 1);
    } else {
      setQuantity(1);
    }
  }, [cartItem]);

  useEffect(() => {
    if (!item) return;

    setCurrentCoverItem({
      src:
        item.video ||
        item.cover_image ||
        item.images?.[0] ||
        "/placeholder.png",
      type: item.video ? "video" : "image",
    });
    setVideo({
      showPlay: true,
      muted: true,
    });
    setPlayingMap({});
    setLoadedMedia({});
  }, [item]);

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError || !data || !item)
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-gray-500 text-sm">
          This product is unavailable right now.
        </p>
        <Link
          href="/"
          className="px-4 py-2 rounded-full bg-brand_pink text-white text-sm"
        >
          Back to Home
        </Link>
      </div>
    );

  const galleryImages = Array.from(
    new Set((item.images ?? []).filter(Boolean)),
  );
  const thumbnailImages = Array.from(
    new Set([
      ...galleryImages,
      ...(item.cover_image ? [item.cover_image] : []),
    ]),
  );
  const currentMediaSrc = currentCoverItem.src || "/placeholder.png";
  const isCurrentMediaLoaded = Boolean(loadedMedia[currentMediaSrc]);

  return (
    <RefreshWrapper
      category={item.category?._id ?? ""}
      // queryKeys={[["relatedProducts", item.category?._id ?? ""]]}
      // onRefreshExtra={reshuffle}
    >
      <section className="">
        <div className="flex lg:hidden justify-between items-center py-3 px-4 z-50 border-b sticky bg-white top-0">
          <Link href={"/"}>
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
          </Link>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => router.push("/search")}
              aria-label="Search"
              className="p-1 active:scale-90 transition-transform"
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 21 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.3752 18.3757L13.8278 13.8283M13.8278 13.8283C15.0586 12.5976 15.75 10.9283 15.75 9.18775C15.75 7.4472 15.0586 5.77794 13.8278 4.54718C12.5971 3.31643 10.9278 2.625 9.18726 2.625C7.44671 2.625 5.77745 3.31643 4.5467 4.54718C3.31594 5.77794 2.62451 7.4472 2.62451 9.18775C2.62451 10.9283 3.31594 12.5976 4.5467 13.8283C5.77745 15.0591 7.44671 15.7505 9.18726 15.7505C10.9278 15.7505 12.5971 15.0591 13.8278 13.8283Z"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={() => handleShare(item.name)}
              aria-label="Share"
              className="p-1 active:scale-90 transition-transform"
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 21 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.4955 8.72372L12.933 2.16122C12.8413 2.06939 12.7244 2.00682 12.5971 1.98143C12.4698 1.95604 12.3378 1.96897 12.2179 2.01858C12.0979 2.06819 11.9954 2.15225 11.9232 2.26014C11.8511 2.36803 11.8125 2.4949 11.8124 2.6247V5.93466C9.68456 6.11677 7.33436 7.15856 5.40089 8.79837C3.07284 10.7737 1.62335 13.3191 1.31901 15.9654C1.29523 16.1712 1.33695 16.3792 1.43822 16.5598C1.5395 16.7405 1.69518 16.8846 1.88311 16.9717C2.07103 17.0587 2.28163 17.0843 2.48492 17.0447C2.68822 17.0052 2.87386 16.9025 3.01542 16.7513C3.91776 15.7907 7.12847 12.7531 11.8124 12.4857V15.7497C11.8125 15.8795 11.8511 16.0064 11.9232 16.1143C11.9954 16.2221 12.0979 16.3062 12.2179 16.3558C12.3378 16.4054 12.4698 16.4184 12.5971 16.393C12.7244 16.3676 12.8413 16.305 12.933 16.2132L19.4955 9.65067C19.6182 9.52765 19.6871 9.36097 19.6871 9.1872C19.6871 9.01342 19.6182 8.84674 19.4955 8.72372ZM13.1249 14.1657V11.8122C13.1249 11.6381 13.0558 11.4712 12.9327 11.3482C12.8097 11.2251 12.6427 11.1559 12.4687 11.1559C10.1653 11.1559 7.92171 11.7572 5.80038 12.9442C4.71998 13.5514 3.71335 14.2814 2.8005 15.1197C3.27628 13.1641 4.47558 11.3044 6.24991 9.79915C8.15468 8.18395 10.4794 7.21845 12.4687 7.21845C12.6427 7.21845 12.8097 7.14931 12.9327 7.02623C13.0558 6.90316 13.1249 6.73624 13.1249 6.5622V4.20954L18.1034 9.1872L13.1249 14.1657Z"
                  fill="black"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="px-4 lg:pl-[3.5rem] pt-4 lg:pt-8 ">
          <div className="lg:flex lg:space-x-20">
            <div className="lg:w-1/2 h-full space-y-8">
              <div className="space-y-4">
                <div
                  className={`relative w-full h-[20rem] lg:h-[38rem] rounded-sm overflow-clip ${
                    !isCurrentMediaLoaded
                      ? "bg-gray-200 animate-fast-pulse"
                      : ""
                  }`}
                >
                  {currentCoverItem.type === "image" ? (
                    <Image
                      src={currentMediaSrc}
                      alt={item.name}
                      fill
                      className={`absolute object-cover transition-opacity duration-200 ${
                        isCurrentMediaLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      onLoad={() => {
                        markMediaLoaded(currentMediaSrc);
                      }}
                    />
                  ) : (
                    <div
                      className={`absolute w-full h-full transition-opacity duration-200 ${
                        isCurrentMediaLoaded ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <VideoPlayer
                        handleVideoPlay={handleVideoPlay}
                        item={item}
                        video={video}
                        playingMap={playingMap}
                        videoRefs={videoRefs}
                        src={currentCoverItem.src}
                        setPlayingMap={setPlayingMap}
                        handleSetVideo={(data) =>
                          setVideo((prev) => ({ ...prev, ...data }))
                        }
                        onLoadedData={() => {
                          markMediaLoaded(currentCoverItem.src);
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 lg:gap-5 flex-wrap">
                  {thumbnailImages.length > 0 || item.video ? (
                    <>
                      {thumbnailImages.map((image, key) => (
                        <button
                          type="button"
                          key={key}
                          className={`size-[3rem] lg:size-[6rem] overflow-clip relative rounded-xl cursor-pointer border-2 ${
                            currentCoverItem.type === "image" &&
                            currentCoverItem.src === image
                              ? "border-brand_pink"
                              : "border-transparent"
                          }`}
                          onClick={() => {
                            setCurrentCoverItem({
                              src: image,
                              type: "image",
                            });
                          }}
                        >
                          <Image
                            src={image}
                            alt={`${item.name} thumbnail ${key + 1}`}
                            fill
                            className="absolute object-cover"
                          />
                        </button>
                      ))}

                      {item.video && (
                        <button
                          type="button"
                          className={`size-[3rem] lg:size-[6rem] overflow-clip relative rounded-xl cursor-pointer border-2 ${
                            currentCoverItem.type === "video"
                              ? "border-brand_pink"
                              : "border-transparent"
                          }`}
                          onClick={() => {
                            setCurrentCoverItem({
                              src: item.video!,
                              type: "video",
                            });
                          }}
                        >
                          <video
                            preload="metadata"
                            ref={videoRef}
                            src={item.video}
                            className="absolute object-cover h-full w-full"
                            onLoadedMetadata={(e) => {
                              e.currentTarget.currentTime = 0;
                            }}
                            muted
                            onMouseEnter={() => {
                              void videoRef.current?.play();
                            }}
                            onMouseLeave={() => {
                              videoRef.current?.pause();
                            }}
                            playsInline
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5 4.5L11.5 8L5 11.5V4.5Z"
                                fill="white"
                              />
                            </svg>
                          </div>
                        </button>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
              <div className="lg:hidden">
                {data?.message && (
                  <ProductDescription
                    handleSelectCover={(
                      src: string,
                      type: "image" | "video",
                    ) => {
                      setCurrentCoverItem({
                        src,
                        type,
                      });
                    }}
                    product_data={data}
                  />
                )}
              </div>

              <div className="lg:hidden h-[200px] overflow-y-auto ">
                {data?.message && (
                  <ProductReview product={data?.message.product} />
                )}
                {data?.message &&
                  data.message.product.reviews?.map((review) => (
                    <CommentCard key={review._id} review={review} />
                  ))}
              </div>
              <div>
                <div className="hidden lg:block">
                  {data?.message && (
                    <ProductReview product={data?.message.product} />
                  )}
                </div>
                {data?.message &&
                  data.message.product.reviews?.map((review) => (
                    <CommentCard key={review._id} review={review} />
                  ))}
              </div>
            </div>
            <div className="w-1/2 h-full hidden lg:block">
              {data?.message && (
                <ProductDescription
                  product_data={data}
                  handleSelectCover={(src: string, type: "image" | "video") => {
                    setCurrentCoverItem({
                      src,
                      type,
                    });
                  }}
                />
              )}
            </div>

            {items.length > 0 && (
              <div className="w-[14rem] px-4 space-y-6 border-l sticky top-[6.6rem] flex-col items-center h-[calc(100vh-6.6rem)] overflow-y-auto hidden lg:flex">
                <div className="sticky top-0 space-y-2">
                  <button
                    className="h-[2.5rem] bg-brand_pink text-white rounded-full w-full"
                    onClick={checkoutHandler}
                  >
                    Check Out
                  </button>

                  <button className="h-[2.5rem] border border-black text-black rounded-full w-full">
                    <Link href="/pages/cart">Go to cart</Link>
                  </button>
                </div>
                <div className="space-y-3 w-full">
                  <div className="flex items-center gap-1">
                    <Checkbox
                      checked={
                        items.length > 0 && items.every((item) => item.selected)
                      }
                      onClick={() =>
                        items.length > 0 && items.every((item) => item.selected)
                          ? deselectAllCartItems()
                          : selectAllCartItems()
                      }
                      className="z-30 bg-white !rounded-full left-2 top-2"
                    />
                    <p>Select all ({items.length})</p>
                  </div>
                  {items.map((item, key) => (
                    <div
                      className="w-[8rem] mx-auto flex flex-col relative items-center"
                      key={key}
                    >
                      <Checkbox
                        checked={item?.selected}
                        onCheckedChange={() => {
                          toggleItemSelect(item._id);
                        }}
                        className="absolute z-30 bg-white border !border-brand_pink !rounded-full left-2 top-2"
                      />
                      <div className="h-[8rem] w-[8rem] overflow-clip relative rounded-lg bg-gray-300">
                        <Image
                          src={item.cover_image ?? ""}
                          alt="product image"
                          fill
                          className="transition-transform duration-300 ease-in-out group-hover:scale-110"
                        />
                      </div>
                      <div className="space-y-1">
                        <h1 className="text-sm text-black font-medium w-[8rem] truncate">
                          {item.name}
                        </h1>
                        <div className="flex gap-2 items-center justify-end">
                          <div
                            onClick={() => decreaseQuantity(item._id)}
                            className="border size-[1.5rem] flex justify-center items-center text-xs rounded-md border-black/40"
                          >
                            -
                          </div>
                          <div>{item?.quantity}</div>
                          <div
                            onClick={() => increaseQuantity(item._id)}
                            className="border size-[1.5rem] flex justify-center items-center text-xs rounded-md border-black/40"
                          >
                            +
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="font-poppins py-10 space-y-5">
            <h1 className="text-2xl">Related Products</h1>
            {item.category && (
              <RelatedProducts
                category={item.category._id}
                // shuffleSeed={shuffleSeed}
              />
            )}
          </div>
        </div>

        <DraggableCartButton cartRef={cartRef} itemCount={items.length} />

        {/* add to cart div  */}
        <div className="w-full bottom-0 flex items-center z-50 fixed left-0  pt-4 pb-4 lg:py-4 bg-white border-t border-t-black/40 gap-8 lg:hidden px-4">
          <div className="flex gap-2 items-center">
            {!cartItem ? (
              <button
                onClick={(e) => {
                  if (!ensureVariantSelection()) {
                    return;
                  }

                  animateToCart({
                    buttonElement: e.currentTarget,
                    cartElement: cartRef.current!,
                    addItemCallback: () =>
                      addItem([
                        {
                          ...item,
                          price: resolvedCartPrice,
                          basePrice: resolvedCartPrice,
                          finalPrice: resolvedFinalPrice,
                          discount: resolvedDiscount,
                          stock: currentStock,
                          quantity,
                          selected: false,
                          selectedVariants: selectedVariantsArray,
                        },
                      ]),
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
          <button
            className="h-[2rem] lg:h-[3rem]  text-xs bg-brand_pink text-white rounded-full w-full"
            onClick={checkoutHandler}
          >
            Check Out
          </button>
        </div>
      </section>
      <ScrollToTop />
    </RefreshWrapper>
  );
}
