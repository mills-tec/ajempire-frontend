"use client";
export const dynamic = "force-dynamic";
import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  searchProducts,
  getCategories,
  getProductsByCategory,
} from "@/lib/api";
import { useSearchStore } from "@/lib/search-store";
import ProductCard from "@/app/components/ProductCard";
import SearchBar from "@/app/components/ui/SearchBar";
import type { Product as CatalogProduct, Product } from "@/lib/types";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import PriceFilter from "../components/PriceFilter";
import { calcDiscountPrice } from "@/lib/utils";

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
  } = useSearchStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get("q") || "";
  const query = rawQuery.trim();
  const hasQuery = query.length > 0;
  const hasImageResults = (searchByImageProducts?.length ?? 0) > 0;
  const hasAnySearch = hasQuery || hasImageResults;

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

  const { data: allCategories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    setQuery(query);
  }, [query, setQuery]);

  // Clear image results when switching to text search
  useEffect(() => {
    if (rawQuery) setSearchByImageProducts([]);
  }, [rawQuery, setSearchByImageProducts]);

  // Skeleton delay — only for query changes
  useEffect(() => {
    if (!hasQuery) {
      setSkeletonLoading(false);
      return;
    }
    setSkeletonLoading(true);
    const timer = setTimeout(() => setSkeletonLoading(false), 500);
    return () => clearTimeout(timer);
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

  const { data: categoryProducts, isLoading: isCategoryProductsLoading } =
    useQuery({
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
    const combined = [
      ...productsMatchingQuery,
      ...(searchByImageProducts ?? []),
    ];
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

  // FIX: text search must be done loading before we wait for category loading
  // If text search is still loading — show skeletons
  // If text search is done (even with 0 results) — only wait for categories
  // if they are actually relevant (matchedCategoryNames.length > 0)
  const textSearchDone = !isLoading && data !== undefined;
  const showLoadingState =
    hasAnySearch &&
    (skeletonLoading ||
      searchByImageLoading ||
      !textSearchDone ||
      (textSearchDone &&
        matchedCategoryNames.length > 0 &&
        isCategoryProductsLoading) ||
      (!textSearchDone && isCategoriesLoading));

  if (isError)
    return <p className="text-center mt-20">Error loading products.</p>;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-white px-4 py-3 shadow-sm">
        <SearchBar showCam={false} />
      </div>

      <div className="min-h-screen px-5 lg:px-10 pt-16 lg:pt-10 mt-10 lg:mt-10 font-poppins">
        <h1 className="text-xl lg:text-2xl font-poppins font-medium mb-6">
          {hasQuery ? (
            <>
              Search Results for:{" "}
              <span className="text-brand_pink">{query}</span>
            </>
          ) : hasImageResults ? (
            <span>Image Search Results</span>
          ) : (
            "Search Products"
          )}
        </h1>

        {matchedCategoryNames.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-700 mb-2">
              Categories
            </h2>
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

        {!hasAnySearch ? (
          <div className="col-span-full text-center mt-20">
            <p className="text-sm text-gray-500">
              Search for a product to see results.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-brand_pink text-white rounded-lg hover:bg-brand_pink_hover transition-colors"
              onClick={() => router.push("/")}
            >
              Go to Home Page
            </button>
          </div>
        ) : showLoadingState ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="h-[300px] w-full bg-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full text-center mt-20">
            <Image
              src="https://i.pinimg.com/1200x/b4/00/f1/b400f13f56058fc7cd35b778d1953d83.jpg"
              alt="No results"
              width={150}
              height={150}
              className="mx-auto"
            />
            <p className="text-sm text-gray-500 mt-4">
              No products match your search.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-brand_pink text-white rounded-lg hover:bg-brand_pink_hover transition-colors"
              onClick={() => {
                clearSearch();
                router.push("/");
              }}
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
                    <ProductCard
                      product={product as CatalogProduct}
                      index={index}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  <p>{product.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
