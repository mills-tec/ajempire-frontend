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
                transition: refreshing ? "transform 0.25s ease" : "none",
            }}
        >
            {children}
        </div>
    );
}
