import React from 'react'

export default function FlashDealSkeleton() {
    return (
        Array.from({ length: 5 }).map((_, index) => <div
            key={index}
            className="font-poppins space-x-10 text-[14px] w-full flex items-center justify-between lg:p-5 p-3 rounded-md bg-gray-200 animate-pulse"
        >
            <div className="">
                {/* Title row */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div className="h-4 w-40 bg-gray-300 rounded"></div>
                </div>

                {/* Description */}
                <div className="space-y-2 mt-2">
                    <div className="h-3 w-64 bg-gray-300 rounded"></div>
                    <div className="h-3 w-52 bg-gray-300 rounded"></div>
                </div>

                {/* Button */}
                <div className="mt-3 h-[30px] w-28 bg-gray-300 rounded-full"></div>
            </div>

            {/* Right side */}
            <div className="flex flex-col items-end gap-2 space-y-10">
                <div className="h-5 w-24 bg-gray-300 rounded"></div>
                <div className="h-10 w-28 bg-gray-300 rounded"></div>
            </div>
        </div>)
    )
}
