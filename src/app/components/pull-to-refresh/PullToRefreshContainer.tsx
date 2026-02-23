"use client";

import { usePullToRefresh } from "./PullToRefreshProvider";

export default function PullToRefreshContainer({
    children,
}: {
    children: React.ReactNode;
}) {
    const { pull, refreshing } = usePullToRefresh();

    return (
        <div
            style={{
                transform: `translateY(${pull}px)`,
                // transition: refreshing ? "transform 0.25s ease" : "none",
                transition: refreshing
                    ? "transform 0.3s cubic-bezier(.22,1,.36,1)"
                    : pull === 0
                        ? "transform 0.3s cubic-bezier(.22,1,.36,1)"
                        : "none",

            }}
        >
            {children}
        </div>
    );
}
