"use client";
import { CategoryCardSkeleton } from "@/app/components/CategoryCardSkeleton";
import ProductCard from "@/app/components/ProductCard";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getProductsByCategory } from "@/lib/api";
import { useCartStore } from "@/lib/stores/cart-store";
import { calcDiscountPrice } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useSearchStore } from "@/lib/search-store";
import React from "react";
import { useRouter } from "next/navigation";


export default function CategoryPage() {
    const params = useParams();
    const slug = params.id as string;
    const categoryName = slug.replace(/-/g, " ");
    const { data, isLoading, isError } = useQuery({
        queryKey: ["products", slug],
        queryFn: () => getProductsByCategory(categoryName),
    });
    const { addItem: addToCart, getItem: getCartItem, } = useCartStore();
    const setSelectedItem = useCartStore((state) => state.setSelectedItem);
    const router = useRouter();
    const { getItem } = useCartStore();

    const { searchedQuery, } = useSearchStore();
    // const searchActive = Boolean(searchedQuery);
    // const [searchLoading, setSearchLoading] = React.useState(false);


    const filteredProducts = React.useMemo(() => {
        const products = data ?? [];

        if (!searchedQuery) return products;

        return products.filter((product) =>
            product.name.toLowerCase().includes(searchedQuery.toLowerCase())
        );
    }, [data, searchedQuery]);

    // React.useEffect(() => {
    //     if (!searchActive) return;

    //     setSearchLoading(true);

    //     const timer = setTimeout(() => {
    //         setSearchLoading(false);
    //     }, 500); // 200ms is enough for skeleton to show

    //     return () => clearTimeout(timer);
    // }, [searchedQuery]);

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat("en-NG", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.round(amount));
    };


    const filledStar = (
        <svg
            width="16"
            height="16"
            className="size-4"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M8.16382 0.828125L9.99671 6.46919H15.9281L11.1295 9.95557L12.9624 15.5966L8.16382 12.1103L3.36525 15.5966L5.19814 9.95557L0.399566 6.46919H6.33092L8.16382 0.828125Z"
                fill="#403C39"
            />
        </svg>
    );
    const unfilledStar = (
        <svg
            width="16"
            height="16"
            className="size-4"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M9.40625 6.55859L9.4707 6.75781H14.7236L10.6436 9.72168L10.4736 9.8457L10.5381 10.0449L12.0967 14.8408L8.0166 11.877L7.84766 11.7539L7.67773 11.877L3.59668 14.8408L5.15625 10.0449L5.2207 9.8457L5.05176 9.72168L0.97168 6.75781H6.22461L6.28906 6.55859L7.84766 1.76074L9.40625 6.55859Z"
                stroke="#403C39"
                strokeWidth="0.57732"
            />
        </svg>
    );
    const handleAddToCart = (product: any, e: React.MouseEvent) => {
        e.stopPropagation();

        // Add to Cart
        const existingCartItem = getCartItem(product._id);
        if (existingCartItem) {
            // If already in cart, just increase quantity by 1
            addToCart({ ...product, quantity: 1 });
            toast.success("Increased quantity in cart");
        } else {
            // If not in cart, add with quantity = 1
            addToCart({ ...product, quantity: 1 });
            toast.success("Added to cart");
        }
    };

    if (isError) return <p>Error loading products.</p>;
    return (
        <>
            <div className="lg:hidden w-full flex flex-col gap-3 h-[600px] overflow-y-auto scrollbar-hide">
                {!isLoading && filteredProducts.length === 0 && (
                    <div className="col-span-full" >
                        <Image
                            src="https://i.pinimg.com/1200x/b4/00/f1/b400f13f56058fc7cd35b778d1953d83.jpg"
                            alt="No results"
                            width={150}
                            height={150}
                            className="mx-auto mt-10"
                        />

                        <p className="text-center text-sm text-gray-500 mt-10">
                            No products match your search.
                        </p>
                    </div>
                )}
                {
                    isLoading ? (
                        <CategoryCardSkeleton />
                    )
                        :
                        (
                            filteredProducts?.map((product, index) => (

                                <div
                                    onClick={
                                        (e) => {
                                            // Navigate to product detail page
                                            e.stopPropagation();
                                            router.push(`/product/${product._id}`);
                                            ;
                                        }
                                    }
                                    key={index}

                                >
                                    <div className="lg:hidden w-full border rounded-lg p-2 bg-white flex  gap-3">

                                        {/* LEFT SIDE (image + info) */}
                                        <div className="flex gap-3 flex-1">

                                            {/* Image */}
                                            <div className="relative w-[90px] h-auto flex-shrink-0 rounded-md overflow-hidden border">
                                                <Image
                                                    src={product.cover_image || "/placeholder.png"}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>

                                            {/* Text */}
                                            <div className="flex flex-col gap-1">
                                                <p className="text-sm font-medium leading-tight">{product.name}</p>

                                                <p className="text-[0.65rem] text-brand_purple">
                                                    Only {product.stock} left
                                                </p>

                                                <div className="flex items-center gap-1">
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) =>
                                                            i < (product.averageRating ? +product.averageRating : 0) ? (
                                                                <span key={i}>{filledStar}</span>
                                                            ) : (
                                                                <span key={i}>{unfilledStar}</span>
                                                            )
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-black/60">
                                                        {product.numReviews}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-semibold text-brand_pink">
                                                        N{formatPrice(calcDiscountPrice(product.price, product.discountedPrice ?? 0))}
                                                    </h3>
                                                    <p className="text-[9px] text-black/60">1k+ sold</p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* RIGHT SIDE (cart icon) */}
                                        <button className="relative  flex-shrink-0 flex items-end cursor-pointer" onClick={((e) => {
                                            e.stopPropagation();
                                            setSelectedItem(product)
                                        })}>
                                            {getItem(product._id) && (
                                                <div className="absolute size-4 rounded-full left-5 bottom-3 z-10 bg-brand_pink text-white text-xs font-semibold flex items-center justify-center">
                                                    <p>{getItem(product._id)?.quantity}</p>
                                                </div>
                                            )}
                                            <svg width="30" height="20" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="0.35" y="0.35" width="28.4667" height="18.9667" rx="9.48333" stroke="black" strokeWidth="0.7" />
                                                <path d="M8.5 5.66667H21.1667L19.1667 12.3333H10.5L8.5 5.66667ZM8.5 5.66667L8 4M13.1613 9H14.4947M14.4947 9H15.828M14.4947 9V7.66667M14.4947 9V10.3333M13.8333 14.6667C13.8333 14.9319 13.728 15.1862 13.5404 15.3738C13.3529 15.5613 13.0985 15.6667 12.8333 15.6667C12.5681 15.6667 12.3138 15.5613 12.1262 15.3738C11.9387 15.1862 11.8333 14.9319 11.8333 14.6667M17.8333 14.6667C17.8333 14.9319 17.728 15.1862 17.5404 15.3738C17.3529 15.5613 17.0986 15.6667 16.8333 15.6667C16.5681 15.6667 16.3138 15.5613 16.1262 15.3738C15.9387 15.1862 15.8333 14.9319 15.8333 14.6667" stroke="black" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                            ))
                        )
                }
            </div>
            {
                isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
                        {[...Array(10)].map((_, i) => (
                            <div
                                key={i}
                                className="h-[300px] w-full bg-gray-200 rounded-xl animate-pulse"
                            />
                        ))}
                    </div >
                )
                    :
                    <div className="hidden lg:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
                        {!isLoading && filteredProducts.length === 0 && (
                            <div className="col-span-full">
                                <Image
                                    src="https://i.pinimg.com/1200x/b4/00/f1/b400f13f56058fc7cd35b778d1953d83.jpg"
                                    alt="No results"
                                    width={150}
                                    height={150}
                                    className="mx-auto mt-10"
                                />

                                <p className="text-center text-sm text-gray-500 mt-10">
                                    No products match your search.
                                </p>
                            </div>
                        )}
                        {filteredProducts?.map((product, index) => (
                            <div key={product._id} className="relative">
                                {/* Only wrap the main card content for tooltip */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div>
                                            <ProductCard index={index} product={product} />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" align="center">
                                        <p>{product.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        ))}
                    </div>

            }
        </>
    );
}
