"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Categories from "@/app/components/ui/Categories";
import SearchBar from "./components/ui/SearchBar";
import CartPopup from "./components/CartPopup";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts } from "@/lib/api";
import { useCartStore } from "@/lib/stores/cart-store";
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
import { ITEMS_TO_APPEND, shuffleArray } from "@/lib/utils";


export default function Home() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(""),
  });

  return (
    <PullToRefreshProvider onRefresh={async (): Promise<void> => {
      await refetch();
    }}>
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
  const [cursor, setCursor] = useState("");
  const [lastItemInview, setLastItemInView] = useState(false);
  const [triggerManualLoad, setManualLoad] = useState(true);
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

  const filteredProducts = React.useMemo(() => {
    const products = data?.message?.products ?? [];
    if (!searchedQuery) return products;

    return products.filter((product: any) => {
      const matchesName =
        product.name.toLowerCase().includes(searchedQuery.toLowerCase());
      const matchesMin =
        minPrice === null || product.price >= minPrice;
      const matchesMax =
        maxPrice === null || product.price <= maxPrice;
      return matchesName && matchesMin && matchesMax;
    });
  }, [searchedQuery, data, minPrice, maxPrice]);

  const [infiniteRef] = useInfiniteScroll({
    loading: false,
    hasNextPage,
    onLoadMore: async () => {



      try {
        const newData = await getProducts(`limit=${ITEMS_TO_APPEND}&cursor=${cursor}`); // fetch next page
        // Update the cached query to append new products
        appendProducts(newData?.message?.products || []);
        setCursor((newData?.message as any)?.nextCursor! || "");

        // Update hasNextPage based on backend response
        setHasNextPage((newData!.message as any)?.hasMore ?? false);


      } catch (err) {
        console.error("Error loading more products:", err);
      }
    },
    disabled: Boolean(false),

  });



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


  useEffect(() => {
    if (hasNextPage === false || !triggerManualLoad) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setLastItemInView(true);
            observer.unobserve(entry.target); // optional: stop observing once visible
          }
        },
        {
          root: null, // viewport
          rootMargin: "0px",
          threshold: 0.5, // 50% of the item is visible
        }
      );

      if (lastItemRef.current) {
        observer.observe(lastItemRef.current);
      }
      setManualLoad(true);
      return () => {
        if (lastItemRef.current) observer.unobserve(lastItemRef.current);
      };
    }
  }, [hasNextPage, triggerManualLoad])


  // appends new data
  useEffect(() => {
    if (!lastItemInview) return;



    const loadMoreProducts = () => {
      const total = filteredProducts.length;
      if (total === 0) return;

      const nextItems = shuffleArray(filteredProducts);

      appendProducts(nextItems);
      setLastItemInView(false);
      setManualLoad(false);
    };

    const timer = setTimeout(loadMoreProducts, 500); // optional delay for UX

    return () => clearTimeout(timer); // cleanup if component unmounts
  }, [lastItemInview]);



  return (
    <>
      <PullToRefreshHeader />
      <PullToRefreshContainer>

        <div className="w-full">
          {selectedItem && <CartPopup />}

          <div
            className="lg:hidden w-full bg-white z-50 shadow-sm px-[20px] h-[90px] flex items-center"

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
                  No products match your search.
                </p>
              </div>
            )}

            {/* Products */}
            <div className="mt-8">
              {uiLoading || searchLoading ? (
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
                    {filteredProducts.map((product: any, index: number) => (
                      <div ref={!hasNextPage && index === filteredProducts.length - 1 ? lastItemRef : null} key={index}>
                        <ProductItem key={product._id} product={product} index={index} />
                      </div>

                    ))}

                    {!hasNextPage && [...Array(ITEMS_TO_APPEND)].map((_, i) => (
                      <div key={i}>

                        <Skeleton />

                      </div>
                    ))}



                  </div>
                  <EndlessScrollLoading infiniteRef={infiniteRef} hasNextPage={hasNextPage} />




                </>
              )}
            </div>

          </div>
        </div>
      </PullToRefreshContainer>
    </>

  );
}
