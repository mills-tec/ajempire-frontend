"use client";
export const dynamic = "force-dynamic";
import React from "react";
import Image from "next/image";
import ProductCard from "./components/ProductCard";
import bannerImg from "@/assets/banner.png";
import Categories from "@/app/components/ui/Categories";
import SearchBar from "./components/ui/SearchBar";
import CartPopup from "./components/CartPopup";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/api";
import Spinner from "./components/Spinner";
import { useCartStore } from "@/lib/stores/cart-store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
export default function Home() {

  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  console.log("data: ", data);
  const selectedItem = useCartStore((state) => state.selectedItem);

  return (
    <div className="w-full ">
      {isLoading && <Spinner />}
      {selectedItem && <CartPopup />}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white z-50 shadow-sm px-[30px] h-[90px] flex items-center">
        <SearchBar />
      </div>
      <div className="mt-[5.8rem] lg:mt-0">
        <Categories />
        {/* <p>products will be displayed here</p> */}
      </div>

      <div className="relative px-4 lg:px-10 lg:bottom-[13rem]">
        <div className="relative mx-auto rounded-xl lg:rounded-3xl overflow-clip mt-6 ">
          <Image
            src={bannerImg}
            alt="banner image"
            // className="absolute object-cover"
            height={379}
            width={1352}
            // fill
          />
        </div>

        <div className="grid grid-cols-2 lg:flex justify-start flex-wrap gap-4 lg:gap-6 mx-auto mt-8">
          {data?.message &&
            data.message.products.map((product) => (
              <Tooltip key={product._id}>
                <TooltipTrigger>
                  <div>
                    <ProductCard product={product} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  <p>{product.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
        </div>

        {data && (
          <button className="flex gap-1 items-center w-[20rem] justify-center mx-auto mt-20 mb-24 py-2 rounded-full bg-brand_pink text-white">
            <p>See More </p>
            <svg
              width="23"
              height="16"
              viewBox="0 0 23 16"
              className="size-3"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.75 5.125L11.875 12L5 5.125"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        
      </div>
    </div>
  );
}
