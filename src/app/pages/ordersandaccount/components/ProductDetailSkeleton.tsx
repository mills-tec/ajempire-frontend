"use client";

export default function ProductDetailSkeleton() {
    return (
        <section className="px-4 lg:pl-[3.5rem] pt-4 lg:pt-8 animate-fast-pulse">
            <div className="lg:flex lg:space-x-20">

                {/* LEFT SIDE - IMAGES */}
                <div className="lg:w-1/2 space-y-8">
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="w-full h-[20rem] lg:h-[38rem] bg-gray-200 rounded-sm" />

                        {/* Thumbnails */}
                        <div className="flex gap-2 lg:gap-5">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="size-[3rem] lg:size-[6rem] bg-gray-200 rounded-xl"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Mobile description */}
                    <div className="lg:hidden space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                </div>

                {/* RIGHT SIDE - DESCRIPTION */}

                <div className="w-1/2 hidden lg:block space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />

                    {/* Price */}
                    <div className="h-8 bg-gray-200 rounded w-1/3 mt-4" />
                    <div className="space-y-1 items-start flex flex-col">
                        <h1 className="text-sm  text-black bg-gray-200 font-medium w-36 truncate">

                        </h1>
                        <div className="flex gap-2 items-center justify-end">
                            <div

                                className=" bg-gray-200 text-gray-200 size-[1.5rem] flex justify-center items-center text-xs rounded-md border-black/40"
                            >
                                -
                            </div>
                            <div className="bg-gray-200"></div>
                            <div

                                className="bg-gray-200 text-gray-200 size-[1.5rem] flex justify-center items-center text-xs rounded-md border-black/40"
                            >
                                +
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 py-20">
                        <div className="p-10 border rounded-lg space-y-2 bg-gray-200"></div>
                        <div className="p-10 border rounded-lg space-y-2 bg-gray-200"></div>
                    </div>
                    {/* Buttons */}
                    <div className="flex flex-col gap-3 mt-6">
                        <div className="h-[2.5rem]  text-white bg-gray-200 rounded-full w-[calc(100%-2.5rem)]" />
                        <div className="h-[2.5rem] bg-gray-200 text-white rounded-full w-full" />
                    </div>
                </div>

                {/* CART SIDEBAR */}
                {/* <div className="w-[14rem] px-4 space-y-6 border-l hidden lg:flex flex-col">
                    <div className="space-y-2">
                        <div className="h-10 bg-gray-200 rounded-full w-full" />
                        <div className="h-10 bg-gray-200 rounded-full w-full" />
                    </div>

                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-32 w-full bg-gray-200 rounded-lg" />
                            <div className="h-3 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                    ))}
                </div> */}
            </div>

            {/* MOBILE BOTTOM BAR */}
            <div className="w-full sticky bottom-20 pt-4 pb-4 bg-white border-t flex gap-4 lg:hidden">
                <div className="h-8 w-24 bg-gray-200 rounded-full" />
                <div className="h-8 flex-1 bg-gray-200 rounded-full" />
            </div>
        </section>
    );
}
