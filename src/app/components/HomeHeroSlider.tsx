"use client";
import React from "react";
import Image from "next/image";
import Ajbanner from "@/assets/Ajbanner.png";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import CountdownTimer from "@/components/CountDownTimer";

interface HomeHeroSliderProps {
  products: Product[];
  loading: boolean;
}

export default function HomeHeroSlider({
  products,
  loading,
}: HomeHeroSliderProps) {
  const [current, setCurrent] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const router = useRouter();

  const flashProducts = React.useMemo(
    () =>
      products
        .filter(
          (product) =>
            product.flashSales?.endDate &&
            new Date(product.flashSales.endDate).getTime() > Date.now(),
        )
        .slice(0, 3),
    [products],
  );

  const totalSlides = flashProducts.length > 0 ? 2 : 1;

  React.useEffect(() => {
    if (current >= totalSlides) {
      setCurrent(0);
    }
  }, [current, totalSlides]);

  const nextSlide = React.useCallback(() => {
    setCurrent((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = React.useCallback(() => {
    setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Autoplay
  React.useEffect(() => {
    if (isHovered || totalSlides <= 1) return;

    const timeout = window.setTimeout(() => {
      nextSlide();
    }, 2500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [current, isHovered, nextSlide, totalSlides]);

  if (loading) {
    return (
      <div className="w-full lg:h-[379px]  bg-gray-200 animate-pulse rounded-xl lg:rounded-3xl" />
    );
  }

  return (
    <div
      className="relative z-0 w-full lg:h-[379px] bg-blue-200 overflow-hidden rounded-xl lg:rounded-3xl group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides Wrapper */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {/* ---------------- Slide 1 ---------------- */}
        <div className="relative w-full flex-shrink-0 h-full overflow-hidden ">
          <Image
            src={Ajbanner}
            alt="banner image"
            priority
            className="w-full lg:h-[379px] h-full lg:object-cover object-contain"
          />
        </div>

        {flashProducts.length > 0 && (
          <div className="relative w-full  flex-shrink-0 h-full overflow-hidden">
            <Image
              src={Ajbanner}
              alt="Flash Sale Banner"
              className="w-full h-full object-cover"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Content */}
            <div className="absolute z-0 inset-0 flex flex-col justify-center items-center px-4 lg:px-10">
              <div className="grid grid-cols-3 gap-4 lg:gap-6 w-full max-w-4xl">
                {flashProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex flex-col items-center group cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/product/${product._id}`);
                    }}
                  >
                    {/* Product Image Card */}
                    <div className="bg-white rounded-2xl p-3 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full">
                      <div className="relative w-full aspect-square overflow-hidden rounded-xl">
                        <Image
                          src={product.cover_image ?? ""}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 rounded-full bg-brand_pink px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-md">
                          Flashsale
                        </div>
                        {product.flashSales?.endDate && (
                          <div className="absolute inset-x-2 text-[10px] bottom-1 rounded-full border border-brand_pink bg-black/55 px-2 py-1 text-center text-white backdrop-blur-[2px]">
                            <CountdownTimer
                              endTime={product.flashSales.endDate}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <p className="mt-2 text-sm lg:text-base font-semibold text-white">
                      {product.price.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Arrows (show only on hover) */}
      {isHovered && totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {totalSlides > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {[...Array(totalSlides)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === index ? "w-6 bg-white" : "w-2 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
