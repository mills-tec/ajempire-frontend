"use client";
import { usePullToRefresh } from "./pull-to-refresh/PullToRefreshProvider";

export default function PullToRefreshLoader() {
    const { pull, refreshing } = usePullToRefresh();
    const progress = Math.min(pull / 160, 1);

    return (
        <div
            className="fixed left-0 right-0 top-0 z-[9999] pointer-events-none"
            style={{
                transform: `translateY(${pull - 160}px)`,
                transition: refreshing ? "transform 0.3s ease" : "none",
            }}
        >
            <svg
                viewBox="0 0 430 299"
                className="w-full"
                style={{
                    height: `${120 + progress * 120}px`,
                }}
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

            <div
                className="absolute inset-0 flex flex-col items-center justify-center text-white"
                style={{
                    opacity: progress,
                    transform: `scale(${0.9 + progress * 0.1})`,
                }}
            >
                <p className="text-sm mt-2">
                    {progress > 0.8 ? "Release to refresh" : "Pull to refresh"}
                </p>
            </div>
        </div>
    );
}
