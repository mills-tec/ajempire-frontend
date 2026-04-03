"use client";

import React, {
  createContext,
  useContext,
  useEffect,
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

  const triggerRefresh = async () => {
    setRefreshing(true);
    setPull(MAX_PULL);
    await onRefresh();
    setRefreshing(false);
    setPull(0);
  };

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY !== 0 || refreshing) return;
      pulling.current = true;
      startY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling.current || refreshing) return;

      const delta = e.touches[0].clientY - startY.current;

      if (delta > 0) {
        e.preventDefault(); // 🔥 kills native refresh
        // setPull(Math.min(delta, MAX_PULL));
        const resistance = 0.8; // Increased from 0.6 for more responsive feel
        const damped = delta * resistance;

        setPull(
          delta < MAX_PULL ? damped : MAX_PULL + (delta - MAX_PULL) * 0.2,
        );
      }
    };

    const onTouchEnd = async () => {
      if (!pulling.current) return;
      pulling.current = false;

      if (pull >= TRIGGER_PULL) {
        await triggerRefresh();
      } else {
        setPull(0);
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (window.scrollY !== 0 || refreshing) return;
      pulling.current = true;
      startY.current = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!pulling.current || refreshing) return;

      const delta = e.clientY - startY.current;

      if (delta > 0) {
        e.preventDefault(); // Prevent default scrolling
        const resistance = 0.8;
        const damped = delta * resistance;

        setPull(
          delta < MAX_PULL ? damped : MAX_PULL + (delta - MAX_PULL) * 0.2,
        );
      }
    };

    const onMouseUp = async () => {
      if (!pulling.current) return;
      pulling.current = false;

      if (pull >= TRIGGER_PULL) {
        await triggerRefresh();
      } else {
        setPull(0);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [pull, refreshing, triggerRefresh]);

  return (
    <PullContext.Provider value={{ pull, refreshing }}>
      {children}
    </PullContext.Provider>
  );
}

export function usePullToRefresh() {
  const ctx = useContext(PullContext);
  if (!ctx) throw new Error("usePullToRefresh must be used inside provider");
  return ctx;
}
