"use client";
import React, { useRef, useState } from "react";
import clsx from "clsx";

export default function ProductScrollabeCategoriesContainer() {
  const filter_categories = [
    "All",
    "New Arrivals",
    "Nail Kits",
    "Lip Products",
    "Face Makeup",
    "Eye Makeup",
    "Press-On Nails",
    "Press-On Nails",
    "Press-On Nails",
    "Press-On Nails",
    "Press-On Nails",
    "Press-On Nails",
  ];

  const [selectedCategory, setSelectedCategory] = useState(
    filter_categories[0]
  );
  const catScrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (distance: number) => {
    if (catScrollRef.current) {
      catScrollRef.current.scrollBy({ left: distance, behavior: "smooth" });
    }
  };
  return (
    <div className="w-[calc(100vw-7rem)] relative mx-auto mt-8">
      {/* Scrollable wrapper */}
      <div
        ref={catScrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar [scrollbar-width:none] scroll-smooth px-8"
      >
        {filter_categories.map((cat, idx) => (
          <button
            key={idx}
            className={clsx(
              "py-2 px-3 rounded-sm min-w-max !text-sm",
              selectedCategory === cat
                ? "bg-brand_light_pink text-black/80"
                : "!bg-brand_gray hover:!bg-brand_gray !text-black/40"
            )}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Left arrow */}
      <button
        className="absolute top-0 left-0 h-full bg-gradient-to-l from-transparent to-white px-3 z-30"
        onClick={() => scrollBy(-200)}
      >
        <svg
          width="12"
          height="18"
          viewBox="0 0 12 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.97715 3.65117L2.93359 8.69472L7.97715 13.7383"
            stroke="black"
            strokeOpacity="0.6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Right arrow */}
      <button
        className="absolute top-0 right-0 h-full bg-gradient-to-r from-transparent to-white px-3 z-30"
        onClick={() => scrollBy(200)}
      >
        <svg
          width="12"
          height="18"
          viewBox="0 0 12 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.02285 3.65117L9.06641 8.69472L4.02285 13.7383"
            stroke="black"
            strokeOpacity="0.6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
