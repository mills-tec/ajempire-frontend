"use client";
export const dynamic = "force-dynamic";
import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { searchProducts, getCategories, getProductsByCategory } from "@/lib/api";
import { useSearchStore } from "@/lib/search-store";
import ProductCard from "@/app/components/ProductCard";
import SearchBar from "@/app/components/ui/SearchBar";
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
    cover_image?: string;
    category?: Category;
    stock?: number;
    averageRating?: number;
    numReviews?: number;
    discountedPrice?: number;
    description?: string;
    [key: string]: any; // allow other fields
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
    const [searchLoading, setSearchLoading] = useState(false);

    // fetch name-based search results
    const { data, isLoading, refetch, isError } = useQuery({
        queryKey: ["search", query],
        queryFn: () => searchProducts(query),
        enabled: !!query,
    });

    // load all categories (used for category matching and suggestions)
    const { data: allCategories } = useQuery({
        queryKey: ["categories"],
        queryFn: () => getCategories(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    useEffect(() => {
        console.log("🔍 Query string:", query);
        console.log("Raw API data:", data);
    }, [data]);

    // when query changes we may want to refetch categories (they're cached anyway)
    useEffect(() => {
        if (!query) return;
        console.log("normalizing for category match", normalize(query));
    }, [query]);


    // Simulate skeleton loading when query changes
    useEffect(() => {
        if (!query) return;
        setSearchLoading(true);
        const timer = setTimeout(() => setSearchLoading(false), 500);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        console.log("Products array:", data ?? []);
        (data ?? []).forEach((p, i) => {
            console.log("return only cat", p.category);
        });
    }, [data]);

    const normalize = (str: string) =>
        str.toLowerCase().replace(/\s+/g, "");

    // figure out which categories match the query (using the full category list)
    const matchedCategoryNames = useMemo(() => {
        if (!query || !allCategories?.message) return [];
        const normQuery = normalize(query);
        return allCategories.message
            .map((c) => c.name)
            .filter((name) => normalize(name).includes(normQuery));
    }, [allCategories, query]);

    // fetch products for matched categories
    const { data: categoryProducts } = useQuery({
        queryKey: ["categorySearch", matchedCategoryNames.sort().join(",")],
        queryFn: async () => {
            const lists = await Promise.all(
                matchedCategoryNames.map((cat) => getProductsByCategory(cat))
            );
            return lists.flat();
        },
        enabled: matchedCategoryNames.length > 0,
    });

    // combine name-search results with category products (dedup by _id)
    const productsMatchingQuery = useMemo(() => {
        const base = data ?? [];
        const extras = categoryProducts ?? [];
        const map = new Map<string, Product>();
        base.concat(extras).forEach((p) => map.set(p._id, p));
        return Array.from(map.values());
    }, [data, categoryProducts]);

    useEffect(() => {
        console.log("matchedCategoryNames:", matchedCategoryNames);
    }, [matchedCategoryNames]);

    useEffect(() => {
        console.log("categoryProducts:", categoryProducts);
    }, [categoryProducts]);

    // if you still want additional filtering you can apply it here (price etc.)



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
    // for backward compatibility we keep this, but suggestions now come from matchedCategoryNames
    const categoriesInResults = useMemo(() => {
        const set = new Set<string>();
        (data ?? []).forEach(product => {
            if (Array.isArray(product.category)) {
                (product.category as Category[]).forEach(cat => {
                    if (cat && typeof cat.name === "string") set.add(cat.name);
                });
            } else if (product.category && typeof product.category === "object") {
                const cat = product.category as Category;
                if (cat.name) set.add(cat.name);
            } else if (typeof product.category === "string") {
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

    // suggestions come from any category name that matches the query
    const matchedCategories = useMemo(() => {
        if (!query) return [];
        // prefer category list from server, fallback to ones seen in results
        const source = allCategories?.message?.map((c) => c.name) ?? categoriesInResults;
        const normQuery = normalize(query);
        const startMatches = source.filter((cat) => normalize(cat).startsWith(normQuery));
        const containMatches = source.filter(
            (cat) => !normalize(cat).startsWith(normQuery) && normalize(cat).includes(normQuery)
        );
        return [...startMatches, ...containMatches];
    }, [allCategories, categoriesInResults, query]);

    useEffect(() => {
        console.log("Products matching query:", productsMatchingQuery);
        console.log("Filtered products:", filteredProducts);
        console.log("Categories in results:", categoriesInResults);
        console.log("Matched categories:", matchedCategories);
    }, [productsMatchingQuery, filteredProducts, categoriesInResults, matchedCategories]);

    if (isError) return <p className="text-center mt-20">Error loading products.</p>;

    return (
        <>
            {/* Fixed mobile search bar so users can refine results without scrolling up */}
            <div className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-white px-4 py-3 shadow-sm">
                <SearchBar showCam={false} />
            </div>

            <div className="min-h-screen px-5 lg:px-10 pt-16 lg:pt-10 mt-10 lg:mt-10 font-poppins">
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
                        {filteredProducts.map((product, index) => (
                            <Tooltip key={product._id}>
                                <TooltipTrigger asChild>
                                    <div>
                                        <ProductCard product={product as any} index={index} />
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

