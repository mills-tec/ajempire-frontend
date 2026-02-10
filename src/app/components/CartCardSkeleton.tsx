"use client";
import clsx from "clsx";

export default function CartCardSkeleton() {
    return (
        <div className="lg:flex w-screen  lg:justify-between lg:gap-6 lg:px-0 lg:pl-2 lg:pr-10 max-w-7xl mx-auto">
            <div>
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex gap-4 mt-3 lg:mt-0 p-4 border-b lg:w-[50rem] border-black/10 animate-pulse lg:flex-row lg:items-center"
                    >
                        {/* Image placeholder */}
                        <div className="w-24 h-24 bg-gray-300 rounded-md overflow-hidden relative lg:w-32 lg:h-32"></div>

                        {/* Info placeholder */}
                        <div className="flex-1 flex flex-col justify-between gap-2">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                            <div className="flex gap-2 mt-2">
                                <div className="w-16 h-6 bg-gray-300 rounded"></div>
                                <div className="w-12 h-6 bg-gray-300 rounded"></div>
                            </div>
                        </div>

                        {/* Checkbox placeholder */}
                        <div className="self-start lg:self-center">
                            <div className="w-5 h-5 rounded-full bg-gray-300"></div>
                        </div>
                    </div>
                ))}
            </div>
            <div
                className="hidden lg:block lg:sticky bottom-[5rem] lg:bottom-0 w-screen p-4 lg:top-[8rem] bg-white rounded-t-2xl border-t border-black/25 lg:border-none lg:p-0 lg:bg-transparent lg:rounded-none lg:w-min animate-pulse">
                {/* Toggle arrow */}
                <div className="flex justify-center mb-2 lg:hidden">
                    <div className="w-6 h-3 bg-gray-300 rounded"></div>
                </div>

                {/* Title */}
                <p className="text-sm text-center pb-4">
                    <span className="block h-5 w-40 bg-gray-300 rounded mx-auto mb-1"></span>
                    <span className="block h-4 w-20 bg-gray-300 rounded mx-auto"></span>
                </p>

                {/* Selected items */}
                <div className="flex gap-2 min-h-[5rem]">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-300 rounded-md"></div>
                            <div className="h-3 w-12 bg-gray-300 rounded"></div>
                        </div>
                    ))}
                </div>

                <hr className="mt-4 border-gray-200" />

                {/* Summary lines */}
                <div className="text-sm space-y-2 py-1">
                    {["Item(s) total", "Item(s) discount", "Coupon applied", "Delivery fee"].map(
                        (label, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                                <div className="h-3 w-28 bg-gray-300 rounded"></div>
                                <div className="h-3 w-16 bg-gray-300 rounded"></div>
                            </div>
                        )
                    )}
                </div>

                <hr className="border-gray-200" />

                {/* Total payable */}
                <div className="mt-2">
                    <div className="text-xs flex justify-between text-black/60 mb-1">
                        <div className="h-2 w-6 bg-gray-300 rounded"></div>
                        <div className="h-3 w-16 bg-gray-300 rounded"></div>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                        <div className="h-3 w-16 bg-gray-300 rounded"></div>
                        <div className="h-5 w-24 bg-gray-300 rounded"></div>
                    </div>
                </div>

                {/* Checkout button */}
                <div className="mt-4 flex justify-center">
                    <div className="w-[20rem] h-10 bg-gray-300 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}
