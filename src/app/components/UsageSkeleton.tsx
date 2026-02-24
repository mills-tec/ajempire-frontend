export default function UsageSkeleton() {
    return (
        <div className="w-full lg:relative lg:flex-row lg:gap-0 flex flex-col gap-10 animate-pulse">

            {/* TOP SECTION */}
            <div className="w-full flex flex-col gap-16 lg:flex-row justify-around">

                {/* LEFT SIDE - PROFILE + STATS */}
                <div className="flex flex-col items-start gap-5">

                    {/* Title */}
                    <div className="h-6 w-32 bg-gray-200 rounded"></div>

                    {/* Profile */}
                    <div className="flex items-center gap-3">
                        <div className="w-[65px] h-[65px] rounded-full bg-gray-200"></div>
                        <div className="flex flex-col gap-2">
                            <div className="h-3 w-24 bg-gray-200 rounded"></div>
                            <div className="h-3 w-32 bg-gray-200 rounded"></div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="flex gap-3 w-full">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="bg-gray-200 w-[120px] h-[110px] rounded-sm flex flex-col items-center justify-center gap-3"
                            >
                                <div className="h-3 w-16 bg-gray-300 rounded"></div>
                                <div className="h-6 w-10 bg-gray-300 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDE - CHART */}
                <div className="w-full flex items-center justify-center">
                    <div className="lg:w-[400px] w-full lg:h-[400px] flex items-center justify-center p-4 border rounded-lg">
                        <div className="w-[250px] h-[250px] rounded-full bg-gray-200"></div>
                    </div>
                </div>
            </div>

            {/* RECENT PURCHASES */}
            <div className="lg:absolute w-full lg:top-72">
                <div className="w-full">
                    <div className="h-4 w-40 bg-gray-200 mb-5 rounded"></div>

                    <div className="flex flex-col gap-5 lg:w-[45%]">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="w-full flex items-center gap-2 border border-gray-200 rounded-md p-3"
                            >
                                <div className="w-[100px] h-[100px] bg-gray-200 rounded"></div>
                                <div className="w-full flex flex-col gap-2">
                                    <div className="h-3 w-40 bg-gray-200 rounded"></div>
                                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
