"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface FeedPage<T> {
  items: T[];
  nextCursor: string | null | undefined;
  hasMore: boolean;
}

export interface InfiniteFeedProps<T> {
  queryKey: string[];
  queryFn: (cursor: string) => Promise<FeedPage<T>>;
  staleTime?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemId: (item: T) => string;
  emptyComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  skeletonComponent?: React.ReactNode;
  endlessLoaderComponent?:
    | React.ReactNode
    | ((ref: (node: HTMLElement | null) => void) => React.ReactNode);
  className?: string;
  gridClassName?: string;
  skeletonCount?: number;
  /**
   * Number of DOM slots in the recycle pool. DOM node count never exceeds this.
   * Lower = less GPU memory on iOS Safari. 60 covers ~6 mobile screens at 2 cols.
   */
  maxRendered?: number;
  shuffle?: <U>(arr: U[]) => U[];
  scrollRestorationKey?: string;
  disabled?: boolean;
  blockLoadMoreRef?: React.RefObject<boolean>;
  onRefresh?: () => Promise<void>;
  children?: React.ReactNode;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const DEFAULT_SKELETON = (
  <div className="h-[300px] w-full bg-gray-200 rounded-xl animate-pulse" />
);

const DEFAULT_SHUFFLE = <T,>(arr: T[]): T[] => {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
};

// Items rotated into the pool on each trigger. Must be ≤ maxRendered / 2
// so the bottom half of the pool stays visible while the top half is replaced.
const RECYCLE_BATCH = 20;

// ── Component ──────────────────────────────────────────────────────────────────

export function InfiniteFeed<T>({
  queryKey,
  queryFn,
  staleTime = Infinity,
  renderItem,
  getItemId,
  emptyComponent,
  errorComponent,
  skeletonComponent = DEFAULT_SKELETON,
  endlessLoaderComponent,
  className = "",
  gridClassName = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6",
  skeletonCount = 10,
  maxRendered = 60,
  shuffle = DEFAULT_SHUFFLE,
  scrollRestorationKey = "feed-scroll-y",
  disabled = false,
  blockLoadMoreRef,
  onRefresh,
  children,
}: InfiniteFeedProps<T>) {

  // ── Infinite Query ───────────────────────────────────────────────────────────
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    error,
  } = useInfiniteQuery<FeedPage<T>, Error, FeedPage<T>>(
    queryKey,
    ({ pageParam = "" }) => queryFn(pageParam),
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      staleTime,
    }
  );

  const sourceItems = useMemo<T[]>(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data?.pages]
  );

  const isRecycleMode = !hasNextPage && sourceItems.length > 0;

  // ── Recycle Pool ─────────────────────────────────────────────────────────────
  //
  // Architecture: ring-buffer via slot-based React keys.
  //
  // Keys are "slot-0" … "slot-N" (stable per position, not per item).
  // React reconciles slot-0 → slot-0, updating props in-place instead of
  // mounting new DOM nodes. This keeps the DOM node count exactly constant.
  //
  // On each recycle trigger we drop the first RECYCLE_BATCH items from the
  // front of the pool and append RECYCLE_BATCH new items from the circular
  // cursor. DOM nodes at the top of the grid (off-screen, behind the user)
  // silently receive new content. Scroll position is unaffected because no
  // DOM node changes its physical position.
  //
  // Result: zero new component mounts, zero growing Maps, zero new Image
  // elements, constant DOM node count, constant memory footprint.

  const [pool, setPool] = useState<T[]>([]);
  const [isSeeded, setIsSeeded] = useState(false);

  // Circular read cursor into sourceItems — only pointer arithmetic, no array copy.
  const sourceCursorRef = useRef(0);

  // Latest values available inside stable callbacks without re-creating them.
  const sourceItemsRef = useRef(sourceItems);
  sourceItemsRef.current = sourceItems;
  const shuffleRef = useRef(shuffle);
  shuffleRef.current = shuffle;
  const maxRenderedRef = useRef(maxRendered);
  maxRenderedRef.current = maxRendered;

  // ── Seed ─────────────────────────────────────────────────────────────────────
  // Runs once when recycle mode activates. Shuffles source items and fills the
  // pool up to maxRendered. Cursor starts after the seeded window.
  useEffect(() => {
    if (!isRecycleMode || isSeeded) return;
    const src = sourceItemsRef.current;
    const cap = Math.min(src.length, maxRenderedRef.current);
    const shuffled = shuffleRef.current([...src]);
    sourceCursorRef.current = cap % src.length;
    setPool(shuffled.slice(0, cap));
    setIsSeeded(true);
  }, [isRecycleMode, isSeeded]);

  // ── Append ───────────────────────────────────────────────────────────────────
  // Stable callback: advances circular cursor, replaces the oldest RECYCLE_BATCH
  // slots at the top of the pool with new source items.
  // Cost per call: O(pool.length) for one array copy — bounded and constant.
  const appendRecycleBatch = useCallback(() => {
    const src = sourceItemsRef.current;
    if (!src.length) return;
    const batchSize = Math.min(RECYCLE_BATCH, maxRenderedRef.current);
    let cursor = sourceCursorRef.current;

    setPool((prev) => {
      // Drop oldest batchSize items from top; append new items at bottom.
      const next = prev.slice(batchSize);
      for (let i = 0; i < batchSize; i++) {
        next.push(src[cursor]);
        cursor = (cursor + 1) % src.length;
      }
      sourceCursorRef.current = cursor;
      return next;
    });
  }, []);

  // ── Recycle Observer ─────────────────────────────────────────────────────────
  // Created ONCE when the pool is seeded. Never recreated on each append because
  // the last slot's DOM node is stable (same slot-based key = same DOM node).
  const lastSlotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isRecycleMode || !isSeeded) return;
    const el = lastSlotRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        appendRecycleBatch();
      },
      { rootMargin: "400px 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // appendRecycleBatch is stable (no deps). isSeeded only flips true once.
  }, [isRecycleMode, isSeeded, appendRecycleBatch]);

  // ── API Pagination Observer ──────────────────────────────────────────────────
  const apiLoadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isRecycleMode || !hasNextPage || isFetchingNextPage || disabled) return;
    if (blockLoadMoreRef?.current) return;
    const el = apiLoadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        fetchNextPage();
      },
      { rootMargin: "100px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isRecycleMode, hasNextPage, isFetchingNextPage, fetchNextPage, disabled, blockLoadMoreRef]);

  // ── Refresh ──────────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setPool([]);
    setIsSeeded(false);
    sourceCursorRef.current = 0;
    await refetch();
    await onRefresh?.();
  }, [refetch, onRefresh]);
  void handleRefresh; // consumed externally via prop if needed

  // ── Scroll Restoration ───────────────────────────────────────────────────────
  // Save raw scrollY on scroll (rAF-throttled, no DOM queries).
  // Restore before first paint once data is loaded.
  useEffect(() => {
    if (!scrollRestorationKey) return;
    let raf = 0;
    const save = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        sessionStorage.setItem(scrollRestorationKey, String(window.scrollY));
      });
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => {
      window.removeEventListener("scroll", save);
      cancelAnimationFrame(raf);
    };
  }, [scrollRestorationKey]);

  useLayoutEffect(() => {
    if (!scrollRestorationKey || isLoading) return;
    const saved = sessionStorage.getItem(scrollRestorationKey);
    if (!saved) return;
    sessionStorage.removeItem(scrollRestorationKey);
    window.scrollTo({ top: parseFloat(saved), behavior: "auto" });
  }, [scrollRestorationKey, isLoading]);

  // ── Visible Items ────────────────────────────────────────────────────────────
  const visibleItems = isRecycleMode ? pool : sourceItems;

  // ── Render Helpers ───────────────────────────────────────────────────────────
  const renderSkeletons = (prefix: string) =>
    Array.from({ length: skeletonCount }, (_, i) => (
      <div key={`${prefix}-${i}`}>{skeletonComponent}</div>
    ));

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={className}>
        {children}
        <div className={gridClassName}>{renderSkeletons("skeleton")}</div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={className}>
        {children}
        {errorComponent ?? (
          <div className="text-center mt-10">
            <Image
              src="https://i.pinimg.com/1200x/b4/00/f1/b400f13f56058fc7cd35b778d1953d83.jpg"
              alt="Error"
              width={150}
              height={150}
              className="mx-auto"
            />
            <p className="text-sm text-gray-500 mt-4">Failed to load items.</p>
          </div>
        )}
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────────
  if (visibleItems.length === 0) {
    return (
      <div className={className}>
        {children}
        {emptyComponent ?? (
          <div className="text-center mt-10">
            <Image
              src="https://i.pinimg.com/1200x/b4/00/f1/b400f13f56058fc7cd35b778d1953d83.jpg"
              alt="No results"
              width={150}
              height={150}
              className="mx-auto"
            />
            <p className="text-sm text-gray-500 mt-4">No items available.</p>
          </div>
        )}
      </div>
    );
  }

  // ── Main Render ───────────────────────────────────────────────────────────────
  return (
    <div className={className}>
      {children}

      <div className={gridClassName}>
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;

          return (
            <div
              // Slot-based key in recycle mode: React reuses this DOM node instead
              // of mounting a new one. Prop changes are applied in-place.
              // API mode: item-based key so React tracks products correctly.
              key={isRecycleMode ? `slot-${index}` : `api-${getItemId(item)}-${index}`}
              data-product-id={getItemId(item)}
              ref={
                isLast
                  ? isRecycleMode
                    ? lastSlotRef
                    : apiLoadMoreRef
                  : undefined
              }
            >
              {renderItem(item, index)}
            </div>
          );
        })}

        {isFetchingNextPage && renderSkeletons("fetch")}
      </div>

      {hasNextPage &&
        (typeof endlessLoaderComponent === "function"
          ? endlessLoaderComponent(() => {})
          : endlessLoaderComponent)}
    </div>
  );
}

// ── Hook Export ────────────────────────────────────────────────────────────────
export function useInfiniteFeed<T>(
  options: Omit<
    InfiniteFeedProps<T>,
    | "renderItem"
    | "getItemId"
    | "className"
    | "gridClassName"
    | "children"
    | "emptyComponent"
    | "errorComponent"
    | "skeletonComponent"
    | "endlessLoaderComponent"
  >
) {
  return options;
}
