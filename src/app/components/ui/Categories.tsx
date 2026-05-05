"use client";
import { memo, useCallback, useMemo, useRef } from "react";
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

interface CategoryItemProps {
  category: Category;
  isActive: boolean;
  isFilterMode: boolean;
  onCategorySelect?: (category: Category | null) => void;
  clearSearch: () => void;
}

// Memoized so only the two items that change active state re-render on selection
const CategoryItem = memo(function CategoryItem({
  category,
  isActive,
  isFilterMode,
  onCategorySelect,
  clearSearch,
}: CategoryItemProps) {
  const slug = category.name.toLowerCase().replace(/\s+/g, "-");

  const itemCn = `whitespace-nowrap text-xs flex flex-col items-center transition ${
    isActive ? "opacity-100" : "opacity-80 hover:opacity-100"
  }`;
  const ringCn = `size-[3rem] rounded-full border flex items-center justify-center relative bg-white ${
    isActive ? "border-brand_pink ring-2 ring-brand_pink/20" : "border-gray-200"
  }`;
  const labelCn = `mt-1 text-[10px] lg:text-base capitalize ${
    isActive ? "text-brand_pink font-medium" : "text-black"
  }`;

  if (isFilterMode) {
    return (
      <button
        type="button"
        className={itemCn}
        onClick={() => onCategorySelect?.(category)}
        aria-pressed={isActive}
      >
        <div className={ringCn}>
          <Image
            src={category.image}
            alt={category.name}
            className="object-cover size-full absolute rounded-full"
            height={44}
            width={44}
          />
        </div>
        <p className={labelCn}>{category.name}</p>
      </button>
    );
  }

  return (
    <Link href={`/categories/${slug}`} className={itemCn} onClick={clearSearch}>
      <div className={ringCn}>
        <Image
          src={category.image}
          alt={category.name}
          className="object-cover size-full absolute rounded-full"
          height={44}
          width={44}
        />
      </div>
      <p className={labelCn}>{category.name}</p>
    </Link>
  );
});

const Categories = memo(function Categories({
  cat,
  categories,
  onCategorySelect,
  selectedCategoryId,
}: CategoriesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Selector — only re-renders if clearSearch itself changes (it never does)
  const clearSearch = useSearchStore((state) => state.clearSearch);
  const isFilterMode = Boolean(onCategorySelect);

  const { data } = useQuery<{ message: Category[] }>({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: Infinity,
  });

  const finalCategories = useMemo(
    () => categories ?? data?.message,
    [categories, data?.message],
  );

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  }, []);

  return (
    <div id="categories-section" className="lg:pt-4">
      <div className="hidden lg:flex items-center gap-2 px-4">
        <p className="text-[16px] font-poppins font-medium">{cat}</p>
      </div>

      <div className="flex items-start pt-4 gap-4 px-4 lg:px-[30px] font-poppins">
        <button onClick={() => scroll("left")} className="p-2 hidden lg:block">
          <ArrowRightIcon className="w-4 h-4 mt-3 rotate-180 text-black" />
        </button>

        {/* Same container for both skeleton and real items — no layout shift on load */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide justify-between scroll-smooth flex-1"
        >
          {!finalCategories ? (
            [...Array(11)].map((_, i) => (
              <div
                key={i}
                className="rounded-full bg-gray-200 animate-pulse shrink-0 size-[3rem]"
              />
            ))
          ) : (
            <>
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

              {finalCategories.map((category) => (
                <CategoryItem
                  key={category._id}
                  category={category}
                  isActive={selectedCategoryId === category._id}
                  isFilterMode={isFilterMode}
                  onCategorySelect={onCategorySelect}
                  clearSearch={clearSearch}
                />
              ))}
            </>
          )}
        </div>

        <button
          onClick={() => scroll("right")}
          className="p-2 mt-3 hidden lg:block"
        >
          <ArrowRightIcon className="w-4 h-4 text-black" />
        </button>
      </div>
    </div>
  );
});

export default Categories;
