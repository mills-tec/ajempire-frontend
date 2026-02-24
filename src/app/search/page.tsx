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
import PriceFilter from "../components/PriceFilter";

type Category = {
    name: string;
    _id: string;
};

type Product = {
    _id: string;
    name: string;
    price: number;
    category: Category; // ← based on your logs, it's a single object
};

function SearchContent() {
    const { clearSearch, setQuery } = useSearchStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    const minParam = searchParams.get("min");
    const maxParam = searchParams.get("max");

    const localMinPrice = minParam ? Number(minParam) : null;
    const localMaxPrice = maxParam ? Number(maxParam) : null;

    const isPriceFilterActive =
        localMinPrice !== null && localMaxPrice !== null;



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

    useEffect(() => {
        console.log("Raw API data:", data);
        console.log("Products array:", data?.message?.products ?? []);
        data?.message?.products?.forEach((p, i) => {
            console.log("return only cat", p.category);
        });
    }, [data]);

    useEffect(() => {
        console.log("Raw API data:", data);
    }, [data]);

    const normalize = (str: string) =>
        str.toLowerCase().replace(/\s+/g, "");
    const productsMatchingQuery = useMemo(() => {
        const products = data?.message?.products ?? [];
        if (!query) return products;

        const normalizedQuery = normalize(query);

        return products.filter((product) => {
            const normalizedName = normalize(product.name);
            const normalizedCategory = normalize(product.category.name);

            const matchesName =
                normalizedName.includes(normalizedQuery);

            const matchesCategory =
                normalizedCategory.includes(normalizedQuery);

            return matchesName || matchesCategory;
        });
    }, [data, query]);

    // const filteredProducts = useMemo(() => {
    //     const products = data?.message?.products ?? [];
    //     if (!query) return products;

    //     return products.filter((product) => {
    //         const matchesName = product.name.toLowerCase().includes(query.toLowerCase());
    //         const matchesCategories = product.category?.toLocaleLowerCase().includes(query.toLowerCase())
    //         const matchesMin = minPrice === null || product.price >= minPrice;
    //         const matchesMax = maxPrice === null || product.price <= maxPrice;
    //         return (matchesName || matchesCategories) && matchesMin && matchesMax;
    //     });
    // }, [data, query, minPrice, maxPrice]);
    // const filteredProducts = useMemo(() => {
    //     return productsMatchingQuery.filter((product) => {
    //         const meetsMin = localMinPrice === null || product.price >= localMinPrice;
    //         const meetsMax = localMaxPrice === null || product.price <= localMaxPrice;
    //         return meetsMin && meetsMax;
    //     });
    // }, [productsMatchingQuery, localMinPrice, localMaxPrice]);
    // const filteredProducts = useMemo(() => {
    //     if (!isPriceFilterActive) {
    //         return productsMatchingQuery;
    //     }

    //     return productsMatchingQuery.filter((product) => {
    //         return (
    //             product.price >= (localMinPrice ?? 0) &&
    //             product.price <= (localMaxPrice ?? Infinity)
    //         );
    //     });
    // }, [productsMatchingQuery, isPriceFilterActive, localMinPrice, localMaxPrice]);



    // const categoriesInResults = useMemo(() => {
    //     const products = data?.message?.products ?? [];

    //     const cats = products.reduce((acc, product) => {
    //         if (product.category) {
    //             acc.add(product.category);
    //         }
    //         return acc;
    //     }, new Set());

    //     return Array.from(cats);
    // }, [data]);
    const filteredProducts = useMemo(() => {
        console.log("productsMatchingQuery", productsMatchingQuery)
        if (localMinPrice === null && localMaxPrice === null) {
            return productsMatchingQuery;
        }

        return productsMatchingQuery.filter((product) => {
            return (
                (localMinPrice === null || product.price >= localMinPrice) &&
                (localMaxPrice === null || product.price <= localMaxPrice)
            );
        });
    }, [productsMatchingQuery, localMinPrice, localMaxPrice]);

    // 1️⃣ Get all categories from products
    const categoriesInResults = useMemo(() => {
        const set = new Set<string>();

        data?.message?.products?.forEach(product => {
            // If category is an array of objects
            if (Array.isArray(product.category)) {
                (product.category as Category[]).forEach(cat => {
                    if (cat && typeof cat.name === "string") {
                        set.add(cat.name);
                    }
                });
            }
            // If category is a single object
            else if (product.category && typeof product.category === "object") {
                const cat = product.category as Category;
                if (cat.name) set.add(cat.name);
            }
            // Optional: fallback if category is string
            else if (typeof product.category === "string") {
                set.add(product.category);
            }
        });

        return Array.from(set);
    }, [data]);


    const priceRangeInResults = useMemo(() => {
        if (!productsMatchingQuery.length) {
            return { min: 0, max: 0 };
        }

        const prices = productsMatchingQuery.map(p => p.price);

        return {
            min: Math.min(...prices),
            max: Math.max(...prices),
        };
    }, [productsMatchingQuery]);


    // const startMatches = categoriesInResults.filter((cat) =>
    //     cat.toLowerCase().startsWith(query.toLowerCase())
    // );

    // const containMatches = categoriesInResults.filter((cat) =>
    //     !cat.toLowerCase().startsWith(query.toLowerCase()) &&
    //     cat.toLowerCase().includes(query.toLowerCase())
    // );

    const matchedCategories = useMemo(() => {
        if (!query) return categoriesInResults; // show all if no query

        const lowerQuery = query.toLowerCase();

        const startMatches = categoriesInResults.filter((cat) =>
            cat.toLowerCase().startsWith(lowerQuery)
        );

        const containMatches = categoriesInResults.filter((cat) =>
            !cat.toLowerCase().startsWith(lowerQuery) &&
            cat.toLowerCase().includes(lowerQuery)
        );

        return [...startMatches, ...containMatches];
    }, [categoriesInResults, query]);

    useEffect(() => {
        console.log("Products matching query:", productsMatchingQuery);
        console.log("Filtered products:", filteredProducts);
        console.log("Categories in results:", categoriesInResults);
        console.log("Matched categories:", matchedCategories);
    }, [productsMatchingQuery, filteredProducts, categoriesInResults, matchedCategories]);

    if (isError) return <p className="text-center mt-20">Error loading products.</p>;

    return (
        <div className="min-h-screen px-5 lg:px-10 mt-10 lg:mt-10 font-poppins">
            <h1 className="text-xl lg:text-2xl font-poppins font-medium mb-6">
                Search Results for: <span className="text-brand_pink">{query}</span>
            </h1>

            {/* —–– Category Suggestions UI —–––– */}
            {/* —–– Category Suggestions UI —–––– */}
            {matchedCategories.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-lg font-medium text-gray-700 mb-2">
                        Categories
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {matchedCategories.map((cat: any) => (
                            <button
                                key={cat}
                                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200"
                                onClick={() => {
                                    setQuery(cat)
                                    router.push(`/search?q=${encodeURIComponent(cat)}`);
                                }
                                }
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* —–– Price Range Filter UI —–––– */}
            {/* <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-700 mb-2">
                    Filter by Price
                </h2>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        placeholder={`Min (${priceRangeInResults.min})`}
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={localMinPrice ?? ""}
                        onChange={(e) =>
                            setLocalMinPrice(e.target.value ? Number(e.target.value) : null)
                        }
                    />
                    <span className="text-gray-500 font-medium">—</span>
                    <input
                        type="number"
                        placeholder={`Max (${priceRangeInResults.max})`}
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={localMaxPrice ?? ""}
                        onChange={(e) =>
                            setLocalMaxPrice(e.target.value ? Number(e.target.value) : null)
                        }
                    />
                </div>
            </div> */}
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

