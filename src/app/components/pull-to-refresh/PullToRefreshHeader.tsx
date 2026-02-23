// "use client";

import { usePullToRefresh } from "./PullToRefreshProvider";
export default function PullToRefreshHeader() {
    const { pull, refreshing } = usePullToRefresh();

    const progress = Math.min(pull / 180, 1);

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
                    opacity: progress,
                }}>
                <svg width="142" height="42" viewBox="0 0 142 42" fill="none" xmlns="http://www.w3.org/2000/svg" xlinkHref="http://www.w3.org/1999/xlink">
                    <rect width="142" height="42" fill="url(#pattern0_1335_14313)" />
                    <defs>
                        <pattern id="pattern0_1335_14313" patternContentUnits="objectBoundingBox" width="1" height="1">
                            <use xlinkHref="#image0_1335_14313" transform="matrix(0.000486471 0 0 0.00164474 -0.00155208 0)" />
                        </pattern>
                    </defs>
                </svg>

                {progress > 0.8 ? "Release to refresh" : "Pull to refresh"}
            </div>
        </div>
    );
}
