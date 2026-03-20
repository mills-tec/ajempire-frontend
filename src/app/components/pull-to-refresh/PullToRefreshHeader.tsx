"use client";

import Butterflies from "@/components/svgs/Butterflies";
import { usePullToRefresh } from "./PullToRefreshProvider";
import CustomSvg from "@/components/svgs/CustomSvg";

export default function PullToRefreshHeader() {
    const { pull, refreshing } = usePullToRefresh();

    const progress = Math.min(pull / 180, 1);

    // Vertical translation based on pull distance: 0px at no pull, -15px at max pull
    const translateY = -progress * 15;

    return (
        <div
            className="fixed top-0 left-0 w-full z-40 pointer-events-none"
            style={{
                height: pull,
                overflow: "hidden",
                transition: refreshing ? "height 0.3s cubic-bezier(.22,1,.36,1)" : "none",
            }}
        >
            <svg
                viewBox="0 0 430 300"
                preserveAspectRatio="none"
                className="w-full h-full"
            >
                <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                        <stop stopColor="#FF008C" />
                        <stop offset="1" stopColor="#A600FF" />
                    </linearGradient>
                </defs>

                {/* THIS is the liquid curve */}
                <path
                    d={`
            M0 0
            H430
            V${pull - 40}
            Q215 ${pull + 40} 0 ${pull - 40}
            Z
          `}
                    fill="url(#grad)"
                />
            </svg>

            <div
                className="absolute w-full text-center text-white text-sm"
                style={{
                    top: pull / 2 - 10,
                    opacity: refreshing ? 1 : progress,
                }}>
                <div className="flex flex-col gap-2 items-center">
                    {/* Wave Loader - Applied to CustomSvg */}
                    <div>
                        <div
                            style={{
                                opacity: refreshing ? 0.8 : Math.max(0.2, progress),
                                animation: refreshing
                                    ? `wave 1.2s ease-in-out infinite`
                                    : "none",
                                transform: refreshing ? "none" : `translateY(${-progress * 15}px)`,
                                transition: refreshing ? "none" : "transform 0.2s ease-out, opacity 0.2s ease-out",
                            }}
                        >
                            <CustomSvg imageHref="/logorefresh.png" />
                        </div>
                        <p
                            className="text-white text-xs mt-1"
                            style={{
                                opacity: refreshing || progress > 0.8 ? 1 : 0,
                                transition: "opacity 0.2s ease-out",
                            }}
                        >
                            {progress > 0.1 || refreshing ? "Release to refresh" : "Pull to refresh"}
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes wave {
                    0%, 100% {
                        transform: scaleY(0.5);
                    }
                    50% {
                        transform: scaleY(1.2);
                    }
                }
            `}</style>
        </div>
    );
}
