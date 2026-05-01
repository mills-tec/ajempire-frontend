"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Categories from "@/app/components/ui/Categories";
import SearchBar from "./components/ui/SearchBar";
import CartPopup from "./components/CartPopup";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts, getProductsByCategory } from "@/lib/api";
import { useCartStore } from "@/lib/stores/cart-store";
import { useCategoryStore } from "@/lib/stores/category-store";
import { useSearchStore } from "@/lib/search-store";
import { PullToRefreshProvider } from "./components/pull-to-refresh/PullToRefreshProvider";

import PullToRefreshContainer from "./components/pull-to-refresh/PullToRefreshContainer";
import PullToRefreshHeader from "./components/pull-to-refresh/PullToRefreshHeader";
import HomeHeroSlider from "./components/HomeHeroSlider";
import { usePullToRefresh } from "./components/pull-to-refresh/PullToRefreshProvider";
import useInfiniteScroll from "react-infinite-scroll-hook";
import EndlessScrollLoading from "@/components/EndlessScrollLoading";
import ProductItem from "@/components/ProductItem";
import Skeleton from "@/components/Skeleton";
import type { Category, Product, ProductsResponse } from "@/lib/types";
import { ITEMS_TO_APPEND, shuffleArray } from "@/lib/utils";

const EMPTY_PRODUCTS: Product[] = [];

export default function Home() {
  const { data, isLoading } = useQuery<ProductsResponse | null>({
    queryKey: ["products"],
    queryFn: () => getProducts(""),
  });
  const queryClient = useQueryClient();
  const { selectedCategory } = useCategoryStore();

  const handleRefresh = async () => {
    try {
      if (selectedCategory) {
        // For categories, shuffle existing data instead of refetching
        const currentCategoryData = queryClient.getQueryData<Product[]>([
          "home-category-products",
          selectedCategory.name,
        ]);
        if (currentCategoryData && currentCategoryData.length > 0) {
          const shuffled = shuffleArray([...currentCategoryData]);
          queryClient.setQueryData(
            ["home-category-products", selectedCategory.name],
            shuffled,
          );
        }
        return;
      }

      const freshData = await getProducts(
        `limit=${ITEMS_TO_APPEND}&t=${Date.now()}`,
      );

      const newProducts = freshData?.message?.products ?? [];
      if (newProducts.length === 0) return;

      const shuffled = shuffleArray(newProducts);
      queryClient.setQueryData(["products"], {
        ...freshData,
        message: {
          ...freshData?.message,
          products: shuffled,
          nextCursor: freshData?.message?.nextCursor,
          hasMore: freshData?.message?.hasMore,
        },
      });
    } catch (error) {
      console.error("Pull-to-refresh error:", error);
    }
  };

  return (
    <PullToRefreshProvider onRefresh={handleRefresh}>
      <HomeContent data={data} isLoading={isLoading} />
    </PullToRefreshProvider>
  );
}

function HomeContent({
  data,
  isLoading,
}: {
  data: ProductsResponse | null | undefined;
  isLoading: boolean;
}) {
  const { pull, refreshing } = usePullToRefresh();

  const selectedItem = useCartStore((state) => state.selectedItem);
  const { selectedCategory, setSelectedCategory, _hasHydrated } =
    useCategoryStore();
  const { searchedQuery, resetToken } = useSearchStore();
  const queryClient = useQueryClient();
  const [uiLoading, setUiLoading] = React.useState(false);
  const searchActive = Boolean(searchedQuery);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [categoryVisibleProducts, setCategoryVisibleProducts] = useState<
    Product[]
  >([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const [cursor, setCursor] = useState("");

  // Ensure component only uses store data after hydration
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const products = data?.message?.products ?? [];
  console.log("Products:", products);
  const categoryFilterActive = Boolean(selectedCategory);

  // Reflect pull-to-refresh loading and reset scroll state after refresh
  useEffect(() => {
    if (refreshing) {
      setUiLoading(true);
      return;
    }

    // Refresh complete, reset state for clean new view (but keep category selection)
    setUiLoading(false);
    if (!categoryFilterActive) {
      setCursor("");
      setHasNextPage(true);
      setCategoryVisibleProducts([]);
    }
  }, [refreshing, categoryFilterActive]);
  const [lastItemInview, setLastItemInView] = useState(false);
  const [triggerManualLoad, setManualLoad] = useState(true);
  const [isAppending, startAppendTransition] = useTransition();
  const categoryQuery = useQuery<Product[]>({
    queryKey: ["home-category-products", selectedCategory?.name],
    queryFn: () => getProductsByCategory(selectedCategory!.name),
    enabled: !!selectedCategory,
    retry: false, // Don't retry on error to show "no products found" immediately
    onError: (error) => {
      console.error("Category query error:", error);
      // Set empty array on error so "no products found" message shows
      setCategoryVisibleProducts([]);
    },
  });
  const categoryProducts = categoryQuery.data ?? EMPTY_PRODUCTS;
  const isCategoryLoading = categoryQuery.isLoading;
  const categoryError = categoryQuery.error as Error | null;
  const hasCategoryError = Boolean(categoryError);

  React.useEffect(() => {
    if (resetToken === 0) return;
    setSelectedCategory(null);
    setUiLoading(true);
    const timer = setTimeout(() => setUiLoading(false), 500);
    return () => clearTimeout(timer);
  }, [resetToken, setSelectedCategory]);

  // Force category products to refetch after hydration
  React.useEffect(() => {
    if (_hasHydrated && selectedCategory && isMounted) {
      queryClient.invalidateQueries({
        queryKey: ["home-category-products", selectedCategory.name],
      });
    }
  }, [_hasHydrated, isMounted, selectedCategory, queryClient]);

  const visibleProducts = categoryFilterActive
    ? categoryVisibleProducts
    : products;
  const isProductGridLoading =
    uiLoading ||
    searchLoading ||
    (categoryFilterActive ? isCategoryLoading && !categoryError : isLoading);

  const [infiniteRef] = useInfiniteScroll({
    loading: false,
    hasNextPage: !categoryFilterActive && hasNextPage,
    onLoadMore: async () => {
      try {
        const newData = await getProducts(
          `limit=${ITEMS_TO_APPEND}&cursor=${cursor}`,
        ); // fetch next page
        // Update the cached query to append new products
        appendProducts(newData?.message?.products || [], {
          nextCursor: newData?.message?.nextCursor,
          hasMore: newData?.message?.hasMore,
        });
        setCursor(newData?.message?.nextCursor ?? "");

        // Update hasNextPage based on backend response
        setHasNextPage(newData?.message?.hasMore ?? false);
      } catch (err) {
        console.error("Error loading more products:", err);
      }
    },
    disabled: categoryFilterActive,
  });

  const appendProducts = (
    newProducts: Product[],
    pagination?: { nextCursor?: string; hasMore?: boolean },
  ) => {
    queryClient.setQueryData<ProductsResponse | null>(
      ["products"],
      (oldData) => {
        if (!oldData) {
          return {
            message: {
              products: [...newProducts],
              shippingFees: [],
              nextCursor: pagination?.nextCursor,
              hasMore: pagination?.hasMore,
            },
          };
        }

        return {
          ...oldData,
          message: {
            ...oldData.message,
            products: [...(oldData.message?.products ?? []), ...newProducts],
            nextCursor: pagination?.nextCursor ?? oldData.message.nextCursor,
            hasMore: pagination?.hasMore ?? oldData.message.hasMore,
          },
        };
      },
    );
  };

  useEffect(() => {
    if (!data?.message) return;

    setCursor(data.message.nextCursor ?? "");
    setHasNextPage(data.message.hasMore ?? false);
  }, [data?.message?.hasMore, data?.message?.nextCursor]);

  useEffect(() => {
    if (!categoryFilterActive) {
      if (hasNextPage === false || !triggerManualLoad) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setLastItemInView(true);
              observer.unobserve(entry.target);
            }
          },
          {
            root: null,
            rootMargin: "300px",
            threshold: 0,
          },
        );

        if (lastItemRef.current) {
          observer.observe(lastItemRef.current);
        }
        setManualLoad(true);
        return () => {
          if (lastItemRef.current) observer.unobserve(lastItemRef.current);
        };
      }

      return;
    }

    if (categoryVisibleProducts.length > 0) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setLastItemInView(true);
            observer.unobserve(entry.target);
          }
        },
        {
          root: null,
          rootMargin: "300px",
          threshold: 0,
        },
      );

      if (lastItemRef.current) {
        observer.observe(lastItemRef.current);
      }
      return () => {
        if (lastItemRef.current) observer.unobserve(lastItemRef.current);
      };
    }
  }, [
    categoryFilterActive,
    categoryVisibleProducts.length,
    hasNextPage,
    triggerManualLoad,
  ]);

  // appends new data
  useEffect(() => {
    if (!lastItemInview) return;

    if (categoryFilterActive) {
      if (categoryProducts.length === 0) return;
      const nextItems = shuffleArray(categoryProducts);
      if (nextItems.length === 0) return;
      startAppendTransition(() => {
        setCategoryVisibleProducts((prev) => [...prev, ...nextItems]);
      });
      setLastItemInView(false);
      return;
    }

    if (products.length === 0) return;
    const nextItems = shuffleArray(products);
    startAppendTransition(() => {
      appendProducts(nextItems);
    });
    setLastItemInView(false);
    setManualLoad(false);
  }, [categoryFilterActive, categoryProducts, lastItemInview, products]);

  useEffect(() => {
    if (!categoryFilterActive) {
      setCategoryVisibleProducts((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    setCategoryVisibleProducts(categoryProducts);
    setLastItemInView(false);
    setManualLoad(true);
  }, [categoryFilterActive, categoryProducts]);

  return (
    <>
      <PullToRefreshHeader />
      <PullToRefreshContainer>
        <div className="w-full ">
          {selectedItem && <CartPopup />}

          <div
            className="lg:hidden w-full bg-white z-[9999] shadow-sm px-[20px] h-[90px] flex items-center"
            style={{
              transform: `translateY(-${pull * 0.7}px)`,
              opacity: 1 - Math.min(pull / 150, 1),
              transition: pull === 0 ? "all 0.25s ease" : "none",
            }}
          >
            <SearchBar />
          </div>

          <div className="mt-[0re] lg:mt-0 px-[20px] lg:px-10">
            {/* Banner */}
            {!searchActive && (
              <div className="mx-auto rounded-xl lg:rounded-3xl overflow-hidden mt-6">
                {uiLoading || isLoading ? (
                  <div className="w-full lg:h-[379px] h-[150px] bg-gray-200 animate-pulse  rounded-xl lg:rounded-3xl" />
                ) : (
                  <HomeHeroSlider
                    products={data?.message?.products ?? []}
                    loading={uiLoading || isLoading}
                  />
                )}
              </div>
            )}

            {/* Categories */}
            <div className={`mt-${searchActive ? "[1rem]" : "8"}`}>
              {uiLoading || searchLoading || isLoading ? (
                <div className="flex gap-4 overflow-x-auto pb-2 pt-3 lg:pt-0">
                  {[...Array(11)].map((_, i) => (
                    <div
                      key={i}
                      className="lg:w-20 lg:h-20 rounded-full bg-gray-200 animate-pulse shrink-0 w-14 h-14"
                    />
                  ))}
                </div>
              ) : (
                <Categories
                  cat={"categories"}
                  onCategorySelect={setSelectedCategory}
                  selectedCategoryId={selectedCategory?._id ?? null}
                />
              )}
            </div>
            {categoryFilterActive && (
              <div className="mt-6 px-4 lg:px-[30px] flex flex-wrap items-center gap-3 font-poppins">
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm">
                  <span className="text-black/60">Showing</span>
                  <span className="font-medium text-brand_pink capitalize">
                    {selectedCategory?.name}
                  </span>
                  {!isCategoryLoading && (
                    <span className="text-black/50">
                      ({categoryProducts.length})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-black underline underline-offset-4"
                  onClick={() => setSelectedCategory(null)}
                >
                  Show all products
                </button>
              </div>
            )}
            {!isProductGridLoading &&
              (visibleProducts.length === 0 || hasCategoryError) && (
                <div className="col-span-full">
                  <Image
                    src="https://i.pinimg.com/1200x/b4/00/f1/b400f13f56058fc7cd35b778d1953d83.jpg"
                    alt="No results"
                    width={150}
                    height={150}
                    className="mx-auto mt-10"
                  />

                  <p className="text-center text-sm text-gray-500 mt-10">
                    {categoryFilterActive
                      ? hasCategoryError
                        ? `Unable to load products for ${selectedCategory?.name}. Please try again.`
                        : `No products found in ${selectedCategory?.name}.`
                      : "No products are available right now."}
                  </p>
                </div>
              )}

            {/* Products */}
            <div className="mt-8">
              {isProductGridLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="h-[300px] w-full bg-gray-200 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5  gap-x-2 lg:gap-6  ">
                    {visibleProducts.map((product: Product, index: number) => (
                      <div
                        ref={
                          (categoryFilterActive || !hasNextPage) &&
                          index === visibleProducts.length - 1
                            ? lastItemRef
                            : null
                        }
                        key={`${product._id}-${index}`}
                      >
                        <ProductItem
                          key={product._id}
                          product={product}
                          index={index}
                        />
                      </div>
                    ))}

                    {isAppending &&
                      [...Array(ITEMS_TO_APPEND)].map((_, i) => (
                        <div key={i}>
                          <Skeleton />
                        </div>
                      ))}
                  </div>
                  {!categoryFilterActive && (
                    <EndlessScrollLoading
                      infiniteRef={infiniteRef}
                      hasNextPage={hasNextPage}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </PullToRefreshContainer>
    </>
  );
}
