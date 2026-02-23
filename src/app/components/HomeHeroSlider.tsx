"use client";
import React from "react";
import Image from "next/image";
import Ajbanner from "@/assets/Ajbanner.png";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface HomeHeroSliderProps {
    products: any[];
    loading: boolean;
}

export default function HomeHeroSlider({
    products,
    loading,
}: HomeHeroSliderProps) {
    const [current, setCurrent] = React.useState(0);
    const [isHovered, setIsHovered] = React.useState(false);
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

    const totalSlides = 2;
    const router = useRouter();

    // Only first 3 products
    const flashProducts = products.slice(0, 3);

    const nextSlide = React.useCallback(() => {
        setCurrent((prev) => (prev + 1) % totalSlides);
    }, []);

    const prevSlide = () => {
        setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    // Autoplay
    React.useEffect(() => {
        if (isHovered) return;

        intervalRef.current = setInterval(() => {
            nextSlide();
        }, 2500);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isHovered, nextSlide]);

    if (loading) {
        return (
            <div className="w-full lg:h-[379px]  bg-gray-200 animate-pulse rounded-xl lg:rounded-3xl" />
        );
    }

    return (
        <div
            className="relative z-0 w-full lg:h-[379px] bg-blue-200 overflow-hidden rounded-xl lg:rounded-3xl group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Slides Wrapper */}
            <div
                className="flex h-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${current * 100}%)` }}
            >
                {/* ---------------- Slide 1 ---------------- */}
                <div className="relative w-full flex-shrink-0 h-full overflow-hidden ">
                    <Image
                        src={Ajbanner}
                        alt="banner image"
                        priority
                        className="w-full lg:h-[379px] h-full lg:object-cover object-contain"

                    />
                </div>

                {/* ---------------- Slide 2 ---------------- */}
                <div className="relative w-full  flex-shrink-0 h-full overflow-hidden">
                    <Image
                        src={Ajbanner}
                        alt="Flash Sale Banner"
                        className="w-full h-full object-cover"
                    />

                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Content */}
                    <div className="absolute z-0 inset-0 flex flex-col justify-center items-center px-4 lg:px-10">

                        <div className="grid grid-cols-3 gap-4 lg:gap-6 w-full max-w-4xl">
                            {flashProducts.map((product) => (
                                <div
                                    key={product._id}
                                    className="flex flex-col items-center group cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/product/${product._id}`);
                                    }}
                                >
                                    {/* Product Image Card */}
                                    <div className="bg-white rounded-2xl p-3 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full">
                                        <div className="relative w-full aspect-square overflow-hidden rounded-xl">
                                            <Image
                                                src={product.cover_image ?? ""}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <p className="mt-2 text-sm lg:text-base font-semibold text-white">
                                        ₦{product.price.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>

            {/* Arrows (show only on hover) */}
            {isHovered && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition"
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {[...Array(totalSlides)].map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${current === index
                            ? "w-6 bg-white"
                            : "w-2 bg-white/60"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
