"use client";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/api";
import { Category } from "@/lib/types";
import ArrowRightIcon from "@/components/svgs/ArrowRightIcon";
import { useSearchStore } from "@/lib/search-store";

interface CategoriesProps {
  cat?: string;
  categories?: Category[];
  onCategorySelect?: (category: Category | null) => void;
  selectedCategoryId?: string | null;
}

const Categories = ({
  cat,
  categories,
  onCategorySelect,
  selectedCategoryId,
}: CategoriesProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { clearSearch } = useSearchStore();
  const isFilterMode = Boolean(onCategorySelect);

  const { data } = useQuery<{ message: Category[] }>({
    queryKey: ["categories"],
    queryFn: getCategories,
    onSuccess: (data) => {},
  });

  const finalCategories = categories ?? data?.message;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!finalCategories) {
    // Skeleton loader for categories
    return (
      <div className="flex gap-4 overflow-x-auto pb-2 pt-3">
        {[...Array(11)].map((_, i) => (
          <div
            key={i}
            className="lg:w-20 lg:h-20 rounded-full bg-gray-200 animate-pulse shrink-0 w-14 h-14"
          />
        ))}
      </div>
    );
  }

  return (
    <div id="categories-section" className="lg:pt-4">
      {/* Header */}
      <div className="hidden lg:flex items-center gap-2 px-4">
        <p className="text-[16px] font-poppins font-medium">{cat}</p>
      </div>

      {/* Categories scroll */}
      <div className="flex items-start pt-4 gap-4 px-4 lg:px-[30px] font-poppins">
        {/* Left Arrow */}
        <button onClick={() => scroll("left")} className="p-2 hidden lg:block">
          <ArrowRightIcon className="w-4 h-4 mt-3 rotate-180 text-black" />
        </button>

        {/* Scrollable Categories */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide justify-between scroll-smooth flex-1"
        >
          {isFilterMode && (
            <button
              type="button"
              className={`whitespace-nowrap text-xs flex flex-col items-center transition ${
                !selectedCategoryId
                  ? "opacity-100"
                  : "opacity-80 hover:opacity-100"
              }`}
              onClick={() => onCategorySelect?.(null)}
              aria-pressed={!selectedCategoryId}
            >
              <div
                className={`size-[3rem] rounded-full border flex items-center justify-center relative bg-white ${
                  !selectedCategoryId
                    ? "border-brand_pink ring-2 ring-brand_pink/20"
                    : "border-gray-200"
                }`}
              >
                <span className="text-[11px] font-semibold text-black">
                  All
                </span>
              </div>
              <p
                className={`mt-1 text-[10px] lg:text-base capitalize ${
                  !selectedCategoryId
                    ? "text-brand_pink font-medium"
                    : "text-black"
                }`}
              >
                All
              </p>
            </button>
          )}

          {finalCategories?.map((category) => {
            const slug = category.name.toLowerCase().replace(/\s+/g, "-");
            const isActive = selectedCategoryId === category._id;
            const itemClassName = `whitespace-nowrap text-xs flex flex-col items-center transition ${
              isActive ? "opacity-100" : "opacity-80 hover:opacity-100"
            }`;
            const imageWrapperClassName = `size-[3rem] rounded-full border flex items-center justify-center relative bg-white ${
              isActive
                ? "border-brand_pink ring-2 ring-brand_pink/20"
                : "border-gray-200"
            }`;
            const labelClassName = `mt-1 text-[10px] lg:text-base text-black capitalize ${
              isActive ? "text-brand_pink font-medium" : "text-black"
            }`;

            if (isFilterMode) {
              return (
                <button
                  type="button"
                  key={category._id}
                  className={itemClassName}
                  onClick={() => onCategorySelect?.(category)}
                  aria-pressed={isActive}
                >
                  <div className={imageWrapperClassName}>
                    <Image
                      src={category.image}
                      alt={category.name}
                      className="object-cover size-full absolute rounded-full"
                      height={44}
                      width={44}
                    />
                  </div>
                  <p className={labelClassName}>{category.name}</p>
                </button>
              );
            }

            return (
              <Link
                href={`/categories/${slug}`}
                key={category._id}
                className={itemClassName}
                onClick={clearSearch}
              >
                <div className={imageWrapperClassName}>
                  <Image
                    src={category.image}
                    alt={category.name}
                    className="object-cover size-full absolute rounded-full"
                    height={44}
                    width={44}
                  />
                </div>
                <p className={labelClassName}>{category.name}</p>
              </Link>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="p-2 mt-3 hidden lg:block"
        >
          <ArrowRightIcon className="w-4 h-4 text-black" />
        </button>
      </div>
    </div>
  );
};

export default Categories;
