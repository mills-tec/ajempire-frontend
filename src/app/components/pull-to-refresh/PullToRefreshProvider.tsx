"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type PullContextType = {
  pull: number;
  refreshing: boolean;
};

const PullContext = createContext<PullContextType | null>(null);

const MAX_PULL = 150;
const TRIGGER_PULL = 120;

export function PullToRefreshProvider({
  children,
  onRefresh,
}: {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
}) {
  const startY = useRef(0);
  const pulling = useRef(false);

  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Handlers read these refs instead of state so the window listeners can be
  // attached exactly once — re-subscribing on every pull frame (the old
  // behavior) removed/added three listeners dozens of times per second.
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    // Touch only — no mouse events so desktop is unaffected

    // Coalesce touchmove updates to one state commit per frame.
    let rafId = 0;
    const commitPull = (value: number) => {
      pullRef.current = value;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setPull(value));
    };

    const triggerRefresh = async () => {
      refreshingRef.current = true;
      setRefreshing(true);
      commitPull(MAX_PULL);
      await onRefreshRef.current();
      refreshingRef.current = false;
      setRefreshing(false);
      commitPull(0);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY !== 0 || refreshingRef.current) return;
      pulling.current = true;
      startY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling.current || refreshingRef.current) return;

      const delta = e.touches[0].clientY - startY.current;

      if (delta > 0) {
        e.preventDefault();
        const resistance = 0.8;
        const damped = delta * resistance;

        commitPull(
          delta < MAX_PULL ? damped : MAX_PULL + (delta - MAX_PULL) * 0.2,
        );
      }
    };

    const onTouchEnd = async () => {
      if (!pulling.current) return;
      pulling.current = false;

      if (pullRef.current >= TRIGGER_PULL) {
        await triggerRefresh();
      } else {
        commitPull(0);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const value = useMemo(() => ({ pull, refreshing }), [pull, refreshing]);

  return <PullContext.Provider value={value}>{children}</PullContext.Provider>;
}

export function usePullToRefresh() {
  const ctx = useContext(PullContext);
  if (!ctx) throw new Error("usePullToRefresh must be used inside provider");
  return ctx;
}
