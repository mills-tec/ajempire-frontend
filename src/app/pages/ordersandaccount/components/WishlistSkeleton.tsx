export default function WishlistSkeleton() {
    return (
        <div className="flex flex-col gap-4 animate-pulse">

            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="w-full border rounded flex justify-between p-4 gap-4 bg-white"
                >
                    {/* LEFT SIDE */}
                    <div className="flex gap-4 w-full">

                        {/* IMAGE */}
                        <div className="relative lg:w-[110px] w-[100px] h-[100px] flex-shrink-0 rounded overflow-hidden bg-gray-200"></div>

                        {/* TEXT */}
                        <div className="flex flex-col gap-2 w-full min-w-0">

                            {/* Product name */}
                            <div className="h-3 w-40 bg-gray-200 rounded"></div>

                            {/* Seller tag */}
                            <div className="h-4 w-20 bg-gray-200 rounded"></div>

                            {/* Rating */}
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                <div className="h-3 w-6 bg-gray-200 rounded"></div>
                            </div>

                            {/* Stock */}
                            <div className="h-3 w-24 bg-gray-200 rounded"></div>

                            {/* Discount badge */}
                            <div className="h-5 w-40 bg-gray-200 rounded"></div>

                            {/* Price */}
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-20 bg-gray-200 rounded"></div>
                                <div className="h-3 w-10 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE ICONS (desktop) */}
                    <div className="hidden lg:flex flex-col items-end justify-between gap-2 flex-shrink-0">
                        <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                        <div className="w-[105px] h-[26px] bg-gray-200 rounded-full"></div>
                    </div>

                    {/* MOBILE CART ICON */}
                    <div className="lg:hidden flex items-end">
                        <div className="w-[30px] h-[20px] bg-gray-200 rounded-full"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
