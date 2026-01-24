"use client";
import clsx from "clsx";

export default function CartCardSkeleton() {
    return (
        <div className="flex gap-4 p-4 border-b border-black/10 animate-pulse lg:flex-row lg:items-center">
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
    );
}
