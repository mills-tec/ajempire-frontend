"use client";

import { usePullToRefresh } from "./PullToRefreshProvider";

export default function PullToRefreshHeader() {
    const { pull, refreshing } = usePullToRefresh();
    const progress = Math.min(pull / 160, 1);

    return (
        <div
            style={{
                height: pull,
                overflow: "hidden",
                transition: refreshing ? "height 0.25s ease" : "none",
            }}
        >
            <svg
                viewBox="0 0 430 299"
                className="w-full"
                style={{ height: 120 + progress * 120 }}
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                        <stop stopColor="#FF008C" />
                        <stop offset="1" stopColor="#A600FF" />
                    </linearGradient>
                </defs>
                <ellipse cx="214.5" cy="60" rx="332.5" ry="239" fill="url(#grad)" />
            </svg>

            <div className="text-center text-white text-sm -mt-10">
                {progress > 0.8 ? "Release to refresh" : "Pull to refresh"}
            </div>
        </div>
    );
}
