"use client";
export const dynamic = "force-dynamic";
import ProductCard from "@/app/components/ProductCard";
import SearchBar from "@/app/components/ui/SearchBar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getCategories, getProductsByCategory, searchProducts } from "@/lib/api";
import { useSearchStore } from "@/lib/search-store";
import type { Product } from "@/lib/types";
import { calcDiscountPrice } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import PriceFilter from "../components/PriceFilter";

type Category = { name: string; _id: string };

function getEffectivePrice(product: Product): number {
  if (product.flashSales) {
    return Number(
      calcDiscountPrice(
        product.price,
        product.flashSales?.discountValue,
        product.flashSales?.discountType,
      ),
    );
  }
  return product.price;
}

const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, "");

function SearchContent() {
  const {
    clearSearch,
    setQuery,
    searchByImageProducts,
    setSearchByImageProducts,
    searchByImageLoading,
    recent,
    removeRecent,
    clearRecent,
  } = useSearchStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get("q") || "";
  const query = rawQuery.trim();
  const hasQuery = query.length > 0;
  // Mirrors hasQuery: "an image search is active" per the URL, independent of
  // whether it happened to return zero results — so a genuinely empty image
  // search still renders the results/empty-state block instead of falling
  // back to the pre-search view.
  const hasImageQuery = searchParams.get("type") === "image";
  const hasAnySearch = hasQuery || hasImageQuery;

  const minParam = searchParams.get("min");
  const maxParam = searchParams.get("max");
  const localMinPrice = minParam ? Number(minParam) : null;
  const localMaxPrice = maxParam ? Number(maxParam) : null;

  const [skeletonLoading, setSkeletonLoading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchProducts(query),
    enabled: hasQuery,
  });

  const { data: allCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => { setQuery(query); }, [query, setQuery]);

  useEffect(() => {
    if (rawQuery) setSearchByImageProducts([]);
  }, [rawQuery, setSearchByImageProducts]);

  useEffect(() => {
    if (!hasQuery) { setSkeletonLoading(false); return; }
    setSkeletonLoading(true);
    const timer = setTimeout(() => setSkeletonLoading(false), 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const matchedCategoryNames = useMemo(() => {
    if (!hasQuery || !allCategories?.message) return [];
    const normQuery = normalize(query);
    const source = allCategories.message.map((c: Category) => c.name);
    const startMatches = source.filter((name: string) =>
      normalize(name).startsWith(normQuery),
    );
    const containMatches = source.filter(
      (name: string) =>
        !normalize(name).startsWith(normQuery) &&
        normalize(name).includes(normQuery),
    );
    return [...startMatches, ...containMatches];
  }, [allCategories, hasQuery, query]);

  const { data: categoryProducts, isLoading: isCategoryProductsLoading } = useQuery({
    queryKey: ["categorySearch", [...matchedCategoryNames].sort().join(",")],
    queryFn: async () => {
      const lists = await Promise.all(
        matchedCategoryNames.map((cat: string) => getProductsByCategory(cat)),
      );
      return lists.flat();
    },
    enabled: matchedCategoryNames.length > 0,
  });

  const productsMatchingQuery = useMemo(() => {
    const base = data ?? [];
    const extras = categoryProducts ?? [];
    const map = new Map<string, Product>();
    base.concat(extras).forEach((p) => map.set(p._id, p));
    return Array.from(map.values());
  }, [data, categoryProducts]);

  const allProducts = useMemo(() => {
    const combined = [...productsMatchingQuery, ...(searchByImageProducts ?? [])];
    const map = new Map<string, Product>();
    combined.forEach((p) => map.set(p._id, p));
    return Array.from(map.values());
  }, [productsMatchingQuery, searchByImageProducts]);

  const priceRangeInResults = useMemo(() => {
    if (!allProducts.length) return { min: 0, max: 0 };
    const prices = allProducts.map(getEffectivePrice);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    if (localMinPrice === null && localMaxPrice === null) return allProducts;
    return allProducts.filter((product) => {
      const effective = getEffectivePrice(product);
      return (
        (localMinPrice === null || effective >= localMinPrice) &&
        (localMaxPrice === null || effective <= localMaxPrice)
      );
    });
  }, [allProducts, localMinPrice, localMaxPrice]);

  const showLoadingState = useMemo(() => {
    if (!hasAnySearch) return false;
    if (searchByImageLoading) return true;
    if (hasQuery) {
      if (skeletonLoading) return true;
      const textSearchDone = !isLoading && data !== undefined;
      if (!textSearchDone) return true;
      if (matchedCategoryNames.length > 0 && isCategoryProductsLoading) return true;
      return false;
    }
    return false;
  }, [
    hasAnySearch, hasQuery, searchByImageLoading,
    skeletonLoading, isLoading, data, matchedCategoryNames, isCategoryProductsLoading,
  ]);

  return (
    <motion.div
      className="min-h-screen bg-white"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {/* Sticky header: back arrow + search bar */}
      <div className="sticky top-0 z-50 bg-white border-b flex md:hidden items-center gap-3 px-4 py-3 ">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="shrink-0 p-1 active:scale-90 transition-transform"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5307 18.9698C15.6004 19.0395 15.6557 19.1222 15.6934 19.2132C15.7311 19.3043 15.7505 19.4019 15.7505 19.5004C15.7505 19.599 15.7311 19.6965 15.6934 19.7876C15.6557 19.8786 15.6004 19.9614 15.5307 20.031C15.461 20.1007 15.3783 20.156 15.2873 20.1937C15.1962 20.2314 15.0986 20.2508 15.0001 20.2508C14.9016 20.2508 14.804 20.2314 14.7129 20.1937C14.6219 20.156 14.5392 20.1007 14.4695 20.031L6.96948 12.531C6.89974 12.4614 6.84443 12.3787 6.80668 12.2876C6.76894 12.1966 6.74951 12.099 6.74951 12.0004C6.74951 11.9019 6.76894 11.8043 6.80668 11.7132C6.84443 11.6222 6.89974 11.5394 6.96948 11.4698L14.4695 3.96979C14.6102 3.82906 14.8011 3.75 15.0001 3.75C15.1991 3.75 15.39 3.82906 15.5307 3.96979C15.6715 4.11052 15.7505 4.30139 15.7505 4.50042C15.7505 4.69944 15.6715 4.89031 15.5307 5.03104L8.56041 12.0004L15.5307 18.9698Z" fill="black"/>
          </svg>
        </button>
        <div className="flex-1">
          <SearchBar showCam />
        </div>
      </div>

      {/* Pre-search state: show recent searches */}
      

      {/* Results state */}
      {hasAnySearch && (
        <div className="px-5 lg:px-10 pt-4 pb-10 font-poppins">
          {isError ? (
            <p className="text-center mt-20 text-sm text-gray-500">Error loading products.</p>
          ) : (
            <>
              <h1 className="text-xl lg:text-2xl font-medium mb-6">
                {hasQuery ? (
                  <>
                    Search Results for:{" "}
                    <span className="text-brand_pink">{query}</span>
                  </>
                ) : (
                  <span>Image Search Results</span>
                )}
              </h1>

              {matchedCategoryNames.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-lg font-medium text-gray-700 mb-2">Categories</h2>
                  <div className="flex flex-wrap gap-3">
                    {matchedCategoryNames.map((cat: string) => (
                      <button
                        key={cat}
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200"
                        onClick={() => {
                          setQuery(cat);
                          router.push(`/search?q=${encodeURIComponent(cat)}`);
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <PriceFilter
                initialMin={priceRangeInResults.min}
                initialMax={priceRangeInResults.max}
                selectedMin={localMinPrice}
                selectedMax={localMaxPrice}
                onApply={(min, max) => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (min === null || max === null) {
                    params.delete("min");
                    params.delete("max");
                  } else {
                    params.set("min", String(min));
                    params.set("max", String(max));
                  }
                  router.push(`/search?${params.toString()}`);
                }}
              />

              {showLoadingState ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-[300px] w-full bg-gray-200 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center mt-20">
                  <Image
                    src="https://i.pinimg.com/1200x/b4/00/f1/b400f13f56058fc7cd35b778d1953d83.jpg"
                    alt="No results"
                    width={150}
                    height={150}
                    className="mx-auto"
                  />
                  <p className="text-sm text-gray-500 mt-4">No products match your search.</p>
                  <button
                    className="mt-4 px-4 py-2 bg-brand_pink text-white rounded-lg"
                    onClick={() => { clearSearch(); router.push("/"); }}
                  >
                    Go to Home Page
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
                  {filteredProducts.map((product, index) => (
                    <Tooltip key={product._id}>
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
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
