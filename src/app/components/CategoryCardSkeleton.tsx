export function CategoryCardSkeleton() {
    return (
        <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="w-full border rounded-lg p-2 bg-white flex gap-3 animate-pulse"
                >
                    {/* LEFT SIDE */}
                    <div className="flex gap-3 flex-1">
                        {/* Image Skeleton */}
                        <div className="w-[90px] h-[120px] flex-shrink-0 rounded-md bg-gray-200" />

                        {/* Text Skeleton */}
                        <div className="flex flex-col gap-2 flex-1">
                            {/* Title */}
                            <div className="h-3 w-3/4 bg-gray-200 rounded" />

                            {/* Stock text */}
                            <div className="h-2 w-1/3 bg-gray-200 rounded" />

                            {/* Rating row */}
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-16 bg-gray-200 rounded" />
                                <div className="h-2 w-6 bg-gray-200 rounded" />
                            </div>

                            {/* Price row */}
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-12 bg-gray-200 rounded" />
                                <div className="h-2 w-10 bg-gray-200 rounded" />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE (cart icon skeleton) */}
                    <div className="flex-shrink-0 flex items-end">
                        <div className="w-[30px] h-[20px] bg-gray-200 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}
