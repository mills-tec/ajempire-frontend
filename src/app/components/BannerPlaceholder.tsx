"use client";

import { BannerImage, getBanner } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRef, useState } from "react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";

import { bunnyLoader } from "@/lib/bunnyLoader";
import "swiper/css";

function BannerSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-pink-200 bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 h-[200px] lg:h-[379px] animate-pulse ${className}`}
    >
      <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 select-none">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-pink-100">
          <svg
            className="w-5 h-5 text-pink-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        </div>
        <p className="text-[11px] font-semibold tracking-widest uppercase text-pink-400">
          Banner Space
        </p>
        <p className="text-[9px] text-pink-300">Your ad will appear here</p>
      </div>
      <span className="absolute right-3 top-3 rounded bg-pink-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-pink-500">
        AD
      </span>
    </div>
  );
}

export default function BannerPlaceholder({
  className = "",
}: {
  className?: string;
}) {
  const [current, setCurrent] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["home-banner"],
    queryFn: () => getBanner(),
  });

  const images: BannerImage[] =
    data?.message?.isActive && data.message.images.length > 0
      ? data.message.images
      : [];

  if (isLoading) return <BannerSkeleton className={className} />;
  if (images.length === 0) return <BannerSkeleton className={className} />;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl h-[120px]  lg:h-[379px] ${className}`}
    >
      <Swiper
        modules={[Autoplay]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        loop={images.length > 1}
        autoplay={
          images.length > 1
            ? { delay: 4000, disableOnInteraction: false }
            : false
        }
        onSlideChange={(swiper) => setCurrent(swiper.realIndex)}
        className="w-full h-full"
      >
        {images.map((image, i) => {
          const slide = (
            <div className="relative w-full h-full">
              <Image
                loader={bunnyLoader}
                sizes="100vw"                
                src={image.url}
                alt="Banner"
                className="w-full lg:h-full object-cover"
                fill
              />
            </div>
          );
          return (
            <SwiperSlide key={i}>
              {image.link ? (
                <a
                  href={image.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  {slide}
                </a>
              ) : (
                slide
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                swiperRef.current?.slideToLoop(i);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
