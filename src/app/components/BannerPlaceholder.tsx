"use client";

import { BannerImage, getBanner } from "@/lib/api";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function BannerSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-pink-200 bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 h-[200px] lg:h-[379px] animate-pulse ${className}`}
    >
      {/* Shimmer sweep — a lighter stripe that rides across */}
      <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent" />

      {/* Centre content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 select-none">
        {/* Picture / image icon */}
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

      {/* AD badge — top-right corner */}
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
  const [images, setImages] = useState<BannerImage[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getBanner().then((data) => {
      if (data?.message?.isActive && data.message.images.length > 0) {
        setImages(data.message.images);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [images]);

  if (loading) return <BannerSkeleton className={className} />;
  if (images.length === 0) return <BannerSkeleton className={className} />;

  const image = images[current];
  const content = (
    <div
      className={`relative w-full overflow-hidden rounded-2xl h-[220px] lg:h-[379px]     ${className}`}
    >
      <Image
        src={image.url}
        alt="Banner"
        className="w-full h-full object-fill transition-opacity duration-500"
      />

      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                setCurrent(i);
              }}
              className={`w-2 h-2  rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (image.link) {
    return (
      <a href={image.link} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}
