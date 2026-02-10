"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

type ContextType = {
    pull: number;
    refreshing: boolean;
};

const PullContext = createContext<ContextType | null>(null);

const MAX_PULL = 160;
const TRIGGER_PULL = 120;

export function PullToRefreshProvider({
    children,
    onRefresh,
    enabled = true,
}: {
    children: React.ReactNode;
    onRefresh: () => Promise<void>;
    enabled?: boolean;
}) {
    const startY = useRef(0);
    const pulling = useRef(false);

    const [pull, setPull] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!enabled) return;

        const onTouchStart = (e: TouchEvent) => {
            if (window.scrollY !== 0 || refreshing) return;
            pulling.current = true;
            startY.current = e.touches[0].clientY;
        };

        const onTouchMove = (e: TouchEvent) => {
            if (!pulling.current || refreshing) return;

            const delta = e.touches[0].clientY - startY.current;
            if (delta > 0) {
                e.preventDefault(); // 🔥 disables native refresh
                setPull(Math.min(delta, MAX_PULL));
            }
        };

        const onTouchEnd = async () => {
            if (!pulling.current) return;
            pulling.current = false;

            if (pull >= TRIGGER_PULL) {
                setRefreshing(true);
                setPull(MAX_PULL);
                await onRefresh();
                setRefreshing(false);
            }

            setPull(0);
        };

        window.addEventListener("touchstart", onTouchStart, { passive: false });
        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("touchend", onTouchEnd);

        return () => {
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchEnd);
        };
    }, [pull, refreshing, onRefresh, enabled]);

    return (
        <PullContext.Provider value={{ pull, refreshing }}>
            {children}
        </PullContext.Provider>
    );
}

export const usePullToRefresh = () => {
    const ctx = useContext(PullContext);
    if (!ctx) throw new Error("usePullToRefresh must be used inside provider");
    return ctx;
};