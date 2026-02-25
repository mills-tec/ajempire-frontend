import React from 'react'


export default function EndlessScrollLoading({ infiniteRef, hasNextPage, gridNumber = "grid-cols-2" }: { infiniteRef: any, hasNextPage: boolean, gridNumber?: string }) {
    return (
        <div ref={infiniteRef}>
            {hasNextPage && <div className={`grid ${gridNumber}  md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6`}>
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className="h-[300px] w-full bg-gray-200 rounded-xl animate-pulse"
                    />
                ))}
            </div>}
        </div>
    )
}
