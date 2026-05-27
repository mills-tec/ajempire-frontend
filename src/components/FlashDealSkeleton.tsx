import React from 'react'
import Skeleton from './ui/Skeleton'

export default function FlashDealSkeleton() {
    return (
        Array.from({ length: 5 }).map((_, index) => (
            <div
                key={index}
                className="font-poppins space-x-10 text-[14px] w-full flex items-center justify-between lg:p-5 p-3 rounded-md"
            >
                <div>
                    {/* Title row */}
                    <div className="flex items-center gap-2 mb-2">
                        <Skeleton width={32} height={32} borderRadius="50%" />
                        <Skeleton width={160} height={16} borderRadius={4} />
                    </div>

                    {/* Description */}
                    <div className="space-y-2 mt-2">
                        <Skeleton width={256} height={12} borderRadius={4} />
                        <Skeleton width={208} height={12} borderRadius={4} />
                    </div>

                    {/* Button */}
                    <div className="mt-3">
                        <Skeleton width={112} height={30} borderRadius={9999} />
                    </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col items-end gap-2 space-y-10">
                    <Skeleton width={96} height={20} borderRadius={4} />
                    <Skeleton width={112} height={40} borderRadius={4} />
                </div>
            </div>
        ))
    )
}
