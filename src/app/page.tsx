"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ProductCard from "./components/ProductCard";
import Categories from "@/app/components/ui/Categories";
import SearchBar from "./components/ui/SearchBar";
import CartPopup from "./components/CartPopup";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts, getProductsByCategory } from "@/lib/api";
import { useCartStore } from "@/lib/stores/cart-store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSearchStore } from "@/lib/search-store";
import { PullToRefreshProvider } from "./components/pull-to-refresh/PullToRefreshProvider";

import PullToRefreshContainer from "./components/pull-to-refresh/PullToRefreshContainer";
import PullToRefreshHeader from "./components/pull-to-refresh/PullToRefreshHeader";
import HomeHeroSlider from "./components/HomeHeroSlider";
import { usePullToRefresh } from "./components/pull-to-refresh/PullToRefreshProvider";
import useInfiniteScroll from "react-infinite-scroll-hook";
import EndlessScrollLoading from "@/components/EndlessScrollLoading";

export default function Home() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(""),
  });
  const queryClient = useQueryClient();

  const handleRefresh = async (): Promise<void> => {
    // pull current products from cache
    const currentData = queryClient.getQueryData<any>(["products"]);
    const products: any[] = currentData?.message?.products ?? [];

    if (products.length > 0) {
      // rotate the list by a random offset so the mid index moves
      const offset = Math.floor(Math.random() * products.length);
      const rotated = products
        .slice(offset)
        .concat(products.slice(0, offset));

      // optionally shuffle a little inside the rotated list to add variation
      const rearranged = rotated.sort(() => Math.random() - 0.5);

      // apply the new order back into the cache
      queryClient.setQueryData(["products"], {
        ...currentData,
        message: {
          ...currentData.message,
          products: rearranged,
        },
      });
    }

    // ensure we show loading animation for at least 1s
    await new Promise((r) => setTimeout(r, 1000));
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
  data: any;
  isLoading: boolean;
}) {
  const { pull } = usePullToRefresh();

  const selectedItem = useCartStore((state) => state.selectedItem);
  const { searchedQuery, resetToken, minPrice, maxPrice } =
    useSearchStore();
  const queryClient = useQueryClient();
  const [uiLoading, setUiLoading] = React.useState(false);
  const searchActive = Boolean(searchedQuery);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (resetToken === 0) return;
    setUiLoading(true);
    const timer = setTimeout(() => setUiLoading(false), 500);
    return () => clearTimeout(timer);
  }, [resetToken]);

  React.useEffect(() => {
    if (!searchActive) return;
    setSearchLoading(true);
    const timer = setTimeout(() => setSearchLoading(false), 500);
    return () => clearTimeout(timer);
  }, [searchedQuery]);

  const products = data?.message?.products ?? [];

  // const filteredProducts = React.useMemo(() => {
  //   const products = data?.message?.products ?? [];
  //   if (!searchedQuery) return products;

  //   return products.filter((product: any) => {
  //     const matchesName =
  //       product.name.toLowerCase().includes(searchedQuery.toLowerCase());
  //     const matchesMin =
  //       minPrice === null || product.price >= minPrice;
  //     const matchesMax =
  //       maxPrice === null || product.price <= maxPrice;
  //     return matchesName && matchesMin && matchesMax;
  //   });
  // }, [searchedQuery, data, minPrice, maxPrice]);

  const [infiniteRef] = useInfiniteScroll({
    loading: uiLoading,
    hasNextPage,
    onLoadMore: async () => {
      const cursor = (data?.message as any)?.nextCursor || "";
      if (!cursor) return;

      try {
        const newData = await getProducts(cursor); // fetch next page
        // Update the cached query to append new products
        appendProducts(newData?.message?.products || []);

        // Update hasNextPage based on backend response
        setHasNextPage((newData!.message as any)?.hasMore ?? false);
      } catch (err) {
        console.error("Error loading more products:", err);
      }
    },
    disabled: Boolean(false),

  });

  useEffect(() => {
    if (!lastItemRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          appendProducts(shuffleArray(data?.message?.products || []));
        }
      },
      { threshold: 0.1 } // 1 = fully visible, 0.5 = half visible
    );

    observer.observe(lastItemRef.current);

    return () => {
      if (lastItemRef.current) observer.unobserve(lastItemRef.current);
    };
  }, []);

  const appendProducts = (newProducts: any[]) => {
    queryClient.setQueryData(["products"], (oldData: any) => {
      if (!oldData) return { message: { products: [...newProducts] } };

      return {
        ...oldData,
        message: {
          ...oldData.message,
          products: [
            ...(oldData.message?.products ?? []),
            ...newProducts,
          ],
        },
      };
    });
  };

  function shuffleArray(array: any[]) {
    const arr = [...array]; // copy so original isn't mutated
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // pick a random index
      [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
    }
    return arr;
  }

  return (
    <>
      <PullToRefreshHeader />
      <PullToRefreshContainer>

        <div className="w-full">
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

          <div className="mt-[0rem] lg:mt-0 px-[20px] lg:px-10">
            {/* Banner */}
            {
              !searchActive && <div className="mx-auto rounded-xl lg:rounded-3xl overflow-hidden mt-6">
                {uiLoading || isLoading ? (
                  <div className="w-full lg:h-[379px] h-[150px] bg-gray-200 animate-pulse  rounded-xl lg:rounded-3xl" />
                ) : (

                  <HomeHeroSlider
                    products={data?.message?.products ?? []}
                    loading={uiLoading || isLoading}
                  />
                )}
              </div>
            }

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
                <Categories cat={"categories"} />
              )}
            </div>
            {!isLoading && products.length === 0 && (
              <div className="col-span-full">
                <Image
                  src="https://i.pinimg.com/1200x/b4/00/f1/b400f13f56058fc7cd35b778d1953d83.jpg"
                  alt="No results"
                  width={150}
                  height={150}
                  className="mx-auto mt-10"
                />

                <p className="text-center text-sm text-gray-500 mt-10">
                  No products match your search.
                </p>
              </div>
            )}

            {/* Products */}
            <div className="mt-8">
              {uiLoading || searchLoading || isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="h-[300px] w-full bg-gray-200 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className=" grid  grid-cols-2  gap-2  sm:grid-cols-3  md:grid-cols-4  lg:grid-cols-5 lg:gap-6">
                  {products.map((product: any, index: number) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <div>
                          <ProductCard product={product} index={index} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center">
                        <p>{product.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              )}

              <EndlessScrollLoading infiniteRef={infiniteRef} hasNextPage={hasNextPage} />

            </div>
          </div>
        </div>
      </PullToRefreshContainer>
    </>

  )


}