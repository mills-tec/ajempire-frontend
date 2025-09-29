import React from "react";
import Image from "next/image";
import ProductCard from "./components/ProductCard";
import bannerImg from "@/assets/banner.png";
import ProductScrollabeCategoriesContainer from "./components/ProductScrollabeCategoriesContainer";

export default function Home() {
  return (
    <section>
      <ProductScrollabeCategoriesContainer />

      <div className="relative w-full h-[14rem] border mt-6">
        <Image src={bannerImg} alt="banner image" fill />
      </div>

      <div className="grid grid-cols-4 gap-6 w-max mx-auto mt-8">
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
      </div>

      <button className="flex gap-1 items-center w-[20rem] justify-center mx-auto mt-20 mb-10 py-2 rounded-full bg-brand_pink text-white">
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
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </section>
  );
}
