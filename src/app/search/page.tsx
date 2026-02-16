"use client";
export const dynamic = "force-dynamic";
import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/api";
import { useSearchStore } from "@/lib/search-store";
import ProductCard from "@/app/components/ProductCard";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { Suspense } from "react";


function SearchContent() {
    const { clearSearch } = useSearchStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    const { minPrice, maxPrice } = useSearchStore();

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["products"],
        queryFn: getProducts,
    });

    const [searchLoading, setSearchLoading] = useState(false);

    // Simulate skeleton loading when query changes
    useEffect(() => {
        if (!query) return;
        setSearchLoading(true);
        const timer = setTimeout(() => setSearchLoading(false), 500);
        return () => clearTimeout(timer);
    }, [query]);

    const filteredProducts = useMemo(() => {
        const products = data?.message?.products ?? [];
        if (!query) return products;

        return products.filter((product) => {
            const matchesName = product.name.toLowerCase().includes(query.toLowerCase());
            const matchesMin = minPrice === null || product.price >= minPrice;
            const matchesMax = maxPrice === null || product.price <= maxPrice;
            return matchesName && matchesMin && matchesMax;
        });
    }, [data, query, minPrice, maxPrice]);

    if (isError) return <p className="text-center mt-20">Error loading products.</p>;

    return (
        <div className="min-h-screen px-5 lg:px-10 mt-10 lg:mt-10 font-poppins">
            <h1 className="text-xl lg:text-2xl font-poppins font-medium mb-6">
                Search Results for: <span className="text-brand_pink">{query}</span>
            </h1>

            {isLoading || searchLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="h-[300px] w-full bg-gray-200 rounded-xl animate-pulse" />
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
                    <p className="text-sm text-gray-500 mt-4">No products match your search.</p>
                    <button
                        className="mt-4 px-4 py-2 bg-brand_pink text-white rounded-lg hover:bg-brand_pink_hover transition-colors"
                        onClick={() => {
                            clearSearch();       // ✅ reset Zustand search state
                            router.push("/");    // ✅ navigate to Home page
                        }}
                    >
                        Go to Home Page
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
                    {filteredProducts.map((product) => (
                        <Tooltip key={product._id}>
                            <TooltipTrigger asChild>
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
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
            <SearchContent />
        </Suspense>
    );
}

