"use client";
import { CategoryCardSkeleton } from "@/app/components/CategoryCardSkeleton";
import ProductCard from "@/app/components/ProductCard";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getProductsByCategory } from "@/lib/api";
import { useCartStore } from "@/lib/stores/cart-store";
import { calcDiscountPrice, ITEMS_TO_APPEND, shuffleArray } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useSearchStore } from "@/lib/search-store";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Skeleton from "@/components/Skeleton";
import type { Product } from "@/lib/types";

const EMPTY: Product[] = [];

// Hard ceiling on accumulated items so the underlying array can't grow
// forever even on an "endless" feed. Rows beyond this just recycle via
// shuffle, but we never keep more than this many Product objects in memory.
const MAX_ACCUMULATED = 400;

// How many extra rows to render above/below the viewport for smoothness
const OVERSCAN = 4;

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

// Tailwind breakpoints used by the existing grid classes
// (grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5)
function useColumnCount(isMobileLayout: boolean) {
  const [cols, setCols] = useState(isMobileLayout ? 1 : 5);

  useEffect(() => {
    if (isMobileLayout) {
      setCols(1); // mobile layout is a single-column stacked list
      return;
    }

    const calc = () => {
      const w = window.innerWidth;
      if (w >= 1024)
        setCols(5); // lg
      else if (w >= 768)
        setCols(4); // md
      else if (w >= 640)
        setCols(3); // sm
      else setCols(2);
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [isMobileLayout]);

  return cols;
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.id as string;
  const categoryName = slug.replace(/-/g, " ");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", slug],
    queryFn: () => getProductsByCategory(categoryName),
    staleTime: Infinity,
  });

  const { getItem } = useCartStore();
  const setSelectedItem = useCartStore((state) => state.setSelectedItem);
  const router = useRouter();
  const searchedQuery = useSearchStore((state) => state.searchedQuery);

  const filteredProducts = React.useMemo(() => {
    const products = data ?? EMPTY;
    if (!searchedQuery) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchedQuery.toLowerCase()),
    );
  }, [data, searchedQuery]);

  const [visibleProducts, setVisibleProducts] = useState<Product[]>(EMPTY);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollRestoredRef = useRef(false);
  const filteredRef = useRef(filteredProducts);
  filteredRef.current = filteredProducts;
  const visibleCountRef = useRef(0);
  const scrollKey = `category-scroll-${slug}`;

  // Reset visible slice when filtered list changes (data load or search)
  useEffect(() => {
    const initial = filteredProducts.slice(0, ITEMS_TO_APPEND);
    visibleCountRef.current = initial.length;
    setVisibleProducts(initial);
    scrollRestoredRef.current = false;
  }, [filteredProducts]);

  // Save scroll position on unmount
  useEffect(() => {
    return () => {
      sessionStorage.setItem(scrollKey, String(window.scrollY));
    };
  }, [scrollKey]);

  // Restore scroll once initial products are painted
  useEffect(() => {
    if (visibleProducts.length === 0 || scrollRestoredRef.current) return;
    const savedY = sessionStorage.getItem(scrollKey);
    if (!savedY) return;
    scrollRestoredRef.current = true;
    sessionStorage.removeItem(scrollKey);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(savedY, 10));
      });
    });
  }, [visibleProducts.length, scrollKey]);

  // ----- Mobile (single column) virtualizer -----
  const mobileRowVirtualizer = useWindowVirtualizer({
    count: visibleProducts.length,
    estimateSize: () => 116, // approx height of one mobile row (px), incl. gap
    overscan: OVERSCAN,
    enabled: visibleProducts.length > 0,
  });

  // ----- Desktop (grid) virtualizer -----
  const desktopCols = useColumnCount(false);
  const desktopRowCount = Math.ceil(visibleProducts.length / desktopCols);
  const desktopRowVirtualizer = useWindowVirtualizer({
    count: desktopRowCount,
    estimateSize: () => 340, // approx height of one desktop card row (px), incl. gap
    overscan: OVERSCAN,
    enabled: visibleProducts.length > 0,
  });

  const loadMore = React.useCallback(async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);

    const allProducts = filteredRef.current;
    if (allProducts.length === 0) {
      setIsLoadingMore(false);
      return;
    }

    const currentCount = visibleCountRef.current;
    const nextBatch =
      currentCount < allProducts.length
        ? allProducts.slice(currentCount, currentCount + ITEMS_TO_APPEND)
        : shuffleArray(allProducts).slice(0, ITEMS_TO_APPEND);

    visibleCountRef.current = currentCount + nextBatch.length;

    setVisibleProducts((prev) => {
      const combined = [...prev, ...nextBatch];
      // Hard cap so the array itself never grows unbounded, even on an
      // "endless" feed that's just cycling through a small product set.
      if (combined.length > MAX_ACCUMULATED) {
        const trimmed = combined.slice(combined.length - MAX_ACCUMULATED);
        // Keep visibleCountRef roughly in sync with what's been trimmed so
        // the next "slice past the end" math stays sane.
        visibleCountRef.current = Math.min(
          visibleCountRef.current,
          allProducts.length + MAX_ACCUMULATED,
        );
        return trimmed;
      }
      return combined;
    });

    setIsLoadingMore(false);
  }, [isLoadingMore]);

  // Trigger loadMore when the virtualizer's rendered range nears the end of
  // what we currently have buffered.
  const maybeLoadMore = (lastVisibleIndex: number) => {
    if (isLoading || visibleProducts.length === 0) return;
    if (lastVisibleIndex >= visibleProducts.length - ITEMS_TO_APPEND) {
      loadMore();
    }
  };

  const mobileItems = mobileRowVirtualizer.getVirtualItems();
  const desktopItems = desktopRowVirtualizer.getVirtualItems();

  useEffect(() => {
    const last = mobileItems[mobileItems.length - 1];
    if (last) maybeLoadMore(last.index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileItems]);

  useEffect(() => {
    const last = desktopItems[desktopItems.length - 1];
    if (last) maybeLoadMore(last.index * desktopCols);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desktopItems]);

  if (isError) return <p>Error loading products.</p>;

  return (
    <>
      {/* Mobile layout */}
      <div className="lg:hidden w-full flex flex-col gap-3">
        {!isLoading && filteredProducts.length === 0 && (
          <div className="col-span-full">
            <Image
              src="https://i.pinimg.com/1200x/b4/00/f1/b400f13f56058fc7cd35b778d1953d83.jpg"
              alt="No results"
              width={150}
              height={150}
              className="mx-auto mt-10"
            />
            <p className="text-center text-sm text-gray-500 mt-10">
              {searchedQuery
                ? "No products match your search."
                : "No products in this category yet."}
            </p>
          </div>
        )}
        {isLoading ? (
          <CategoryCardSkeleton />
        ) : (
          <div
            style={{
              position: "relative",
              height: `${mobileRowVirtualizer.getTotalSize()}px`,
              width: "100%",
            }}
          >
            {mobileItems.map((virtualRow) => {
              const product = visibleProducts[virtualRow.index];
              if (!product) return null;
              const index = virtualRow.index;
              return (
                <div
                  key={`mobile-${product._id}-${index}`}
                  data-index={virtualRow.index}
                  ref={mobileRowVirtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                    paddingBottom: "12px", // preserves the gap-3 spacing
                  }}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/product/${product._id}`);
                    }}
                    className="w-full"
                  >
                    <div className="lg:hidden w-full border rounded-lg p-2 bg-white flex gap-3">
                      {/* Image + info */}
                      <div className="flex gap-3 flex-1">
                        <div className="relative w-[90px] h-auto flex-shrink-0 rounded-md overflow-hidden border">
                          <Image
                            src={product.cover_image || "/placeholder.png"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium leading-tight truncate w-full">
                            {product.name.length > 10
                              ? product.name.substring(0, 10) + "..."
                              : product.name}
                          </p>
                          <p className="text-[0.65rem] text-brand_purple">
                            Only {product.stock} left
                          </p>
                          <div className="flex items-center gap-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) =>
                                i <
                                (product.averageRating
                                  ? +product.averageRating
                                  : 0) ? (
                                  <span key={i}>{filledStar}</span>
                                ) : (
                                  <span key={i}>{unfilledStar}</span>
                                ),
                              )}
                            </div>
                            <p className="text-[10px] text-black/60">
                              {product.numReviews}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-[14px] lg:text-lg font-medium text-brand_pink">
                              {product.flashSales &&
                                Number(
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
                            <p className="text-[9px] text-black/60">1k+ sold</p>
                          </div>
                        </div>
                      </div>
                      {/* Cart button */}
                      <button
                        className="relative flex-shrink-0 flex items-end cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(product);
                        }}
                      >
                        {getItem(product._id) && (
                          <div className="absolute size-4 rounded-full left-5 bottom-3 z-10 bg-brand_pink text-white text-xs font-semibold flex items-center justify-center">
                            <p>{getItem(product._id)?.quantity}</p>
                          </div>
                        )}
                        <svg
                          width="30"
                          height="20"
                          viewBox="0 0 30 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="0.35"
                            y="0.35"
                            width="28.4667"
                            height="18.9667"
                            rx="9.48333"
                            stroke="black"
                            strokeWidth="0.7"
                          />
                          <path
                            d="M8.5 5.66667H21.1667L19.1667 12.3333H10.5L8.5 5.66667ZM8.5 5.66667L8 4M13.1613 9H14.4947M14.4947 9H15.828M14.4947 9V7.66667M14.4947 9V10.3333M13.8333 14.6667C13.8333 14.9319 13.728 15.1862 13.5404 15.3738C13.3529 15.5613 13.0985 15.6667 12.8333 15.6667C12.5681 15.6667 12.3138 15.1862 12.1262 15.3738C11.9387 15.1862 11.8333 14.9319 11.8333 14.6667M17.8333 14.6667C17.8333 14.9319 17.728 15.1862 17.5404 15.3738C17.3529 15.5613 17.0986 15.6667 16.8333 15.6667C16.5681 15.6667 16.3138 15.5613 16.1262 15.3738C15.9387 15.1862 15.8333 14.9319 15.8333 14.6667"
                            stroke="black"
                            strokeWidth="0.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop layout */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="h-[300px] w-full bg-gray-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="hidden lg:block">
          {filteredProducts.length === 0 && (
            <div className="col-span-full">
              <Image
                src="https://i.pinimg.com/1200x/b4/00/f1/b400f13f56058fc7cd35b778d1953d83.jpg"
                alt="No results"
                width={150}
                height={150}
                className="mx-auto mt-10"
              />
              <p className="text-center text-sm text-gray-500 mt-10">
                {searchedQuery
                  ? "No products match your search."
                  : "No products in this category yet."}
              </p>
            </div>
          )}
          <div
            style={{
              position: "relative",
              height: `${desktopRowVirtualizer.getTotalSize()}px`,
              width: "100%",
            }}
          >
            {desktopItems.map((virtualRow) => {
              const rowStart = virtualRow.index * desktopCols;
              const rowProducts = visibleProducts.slice(
                rowStart,
                rowStart + desktopCols,
              );
              if (rowProducts.length === 0) return null;
              return (
                <div
                  key={`desktop-row-${virtualRow.index}`}
                  data-index={virtualRow.index}
                  ref={desktopRowVirtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                    paddingBottom: "1.5rem", // preserves gap-6
                  }}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
                    {rowProducts.map((product, i) => {
                      const index = rowStart + i;
                      return (
                        <div
                          key={`desktop-${product._id}-${index}`}
                          className="relative"
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <ProductCard index={index} product={product} />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center">
                              <p>{product.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
