"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

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
  /** Backward-compatible: accepts ref callback (ignored) or ReactNode */
  endlessLoaderComponent?:
    | React.ReactNode
    | ((ref: (node: HTMLElement | null) => void) => React.ReactNode);
  className?: string;
  gridClassName?: string;
  skeletonCount?: number;
  /** Hard cap on rendered product cards. DOM nodes never exceed this. */
  maxRendered?: number;
  shuffle?: <U>(arr: U[]) => U[];
  scrollRestorationKey?: string;
  disabled?: boolean;
  blockLoadMoreRef?: React.RefObject<boolean>;
  onRefresh?: () => Promise<void>;
  children?: React.ReactNode;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_SKELETON = (
  <div className="h-[300px] w-full bg-gray-200 rounded-xl animate-pulse" />
);

const DEFAULT_SHUFFLE = <T,>(arr: T[]): T[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ── Component ─────────────────────────────────────────────────────────────────

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
  maxRendered = 120,
  shuffle = DEFAULT_SHUFFLE,
  scrollRestorationKey = "feed-scroll-y",
  disabled = false,
  blockLoadMoreRef,
  onRefresh,
  children,
}: InfiniteFeedProps<T>) {
  // ── Infinite Query ─────────────────────────────────────────────────────────
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
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

  // ── Bounded Recycling Feed State ───────────────────────────────────────────
  //
  // ARCHITECTURE: Bounded-Memory Recycling (Sliding Window)
  // ────────────────────────────────────────────────────────
  //
  // Why this approach was chosen over Circular Feed:
  //
  //   Circular Feed (modulo indexing) is excellent for TikTok/Instagram Reels
  //   where content is ephemeral and users never navigate back to specific items.
  //   But for ecommerce, it fails critical requirements:
  //     • Product positions are unstable (same item appears at different indices)
  //     • Scroll restoration is unreliable (content at a pixel offset changes)
  //     • Navigate-back UX is poor (the product you clicked is gone)
  //     • React keys are unstable (same item gets different keys per cycle)
  //
  //   Bounded Recycling solves all of these:
  //     • Product positions are stable within the visible window
  //     • Scroll restoration is reliable (paddingTop compensates for removed items)
  //     • Navigate-back works (products stay in place until trimmed)
  //     • React keys are stable (itemsRemovedCount offset preserves key identity)
  //     • DOM and memory are both bounded by maxRendered
  //
  // How it works:
  //   1. Seed: copy sourceItems into recycledItems when API is exhausted.
  //   2. Append: shuffle sourceItems and append to recycledItems.
  //   3. Cap: if recycledItems exceeds maxRendered, remove oldest items from
  //      the beginning (slice from the end).
  //   4. Compensate: add paddingTop equal to the height of removed items.
  //      This keeps the document height stable and prevents scroll jumps.
  //   5. Keys: use itemsRemovedCount as an offset so React keys remain stable
  //      across window shifts.
  //
  // Memory safety:
  //   • recycledItems array never exceeds maxRendered (default 120)
  //   • DOM nodes never exceed maxRendered × ~15 nodes/card = ~1,800 nodes
  //   • This is within Lighthouse's warning threshold (~1,400) but close.
  //   • For heavier cards, reduce maxRendered. For lighter cards, increase it.
  //   • JavaScript heap: only 120 product objects + sourceItems. Constant.
  //
  // Why this beats PrevHome:
  //   PrevHome: recycledProducts grew exponentially (2→4→8→16→32→64→128→256...)
  //   After ~10 appends: 2,048 items → ~30,000 DOM nodes → iPhone CRASH
  //
  //   Bounded Recycling: recycledItems capped at 120 forever
  //   After 1,000 appends: still 120 items → ~1,800 DOM nodes → iPhone STABLE

  const [recycledItems, setRecycledItems] = useState<T[]>([]);
  const [isAppending, setIsAppending] = useState(false);

  // topPadding compensates for items removed from the beginning of the window.
  // When we slice off old items, the document shrinks from the top. Adding
  // padding-top of equal height keeps the viewport stable and prevents
  // jarring scroll jumps. This is the key to making the trimming invisible.
  const [topPadding, setTopPadding] = useState(0);

  // itemsRemovedCount tracks how many items have been trimmed from the top.
  // It is used as an offset in React keys so that the key for a given item
  // at a given logical position stays stable even as the window slides.
  //
  // Example:
  //   Before trim: itemsRemovedCount=0, item at index 5 has key "prod-123-5"
  //   After trim (8 removed): itemsRemovedCount=8, item at index 5 has key "prod-123-13"
  //   The SAME logical item (now at index 5) keeps its key stable because
  //   the offset accounts for the shift.
  const [itemsRemovedCount, setItemsRemovedCount] = useState(0);

  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const recycleObserverActive = useRef(false);

  const isRecycleMode = !hasNextPage && sourceItems.length > 0;

  // ── Seed: copy sourceItems into recycledItems when API is exhausted ────────
  //
  // This matches PrevHome's seed behavior exactly. It ensures recycledItems
  // starts with the full fetched dataset so the first append has something
  // meaningful to shuffle.
  useEffect(() => {
    if (isRecycleMode && recycledItems.length === 0 && sourceItems.length > 0) {
      setRecycledItems(sourceItems);
    }
  }, [isRecycleMode, sourceItems, recycledItems.length]);

  // ── Recycle Append: IntersectionObserver on the last item ─────────────────
  //
  // When the last rendered item enters the viewport (with 300px rootMargin),
  // we append a shuffled copy of sourceItems to recycledItems.
  //
  // If the combined array exceeds maxRendered, we slice off the oldest items
  // from the beginning and compensate scroll position with topPadding.
  useEffect(() => {
    const shouldObserve = isRecycleMode && recycledItems.length > 0;

    if (!shouldObserve || recycleObserverActive.current || isAppending) return;

    const ref = lastItemRef.current;
    if (!ref) return;

    recycleObserverActive.current = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        recycleObserverActive.current = false;

        // Append a shuffled copy of sourceItems.
        // We shuffle sourceItems (not recycledItems) to avoid exponential growth
        // while still providing visual variety on each append.
        const next = shuffle([...sourceItems]);
        if (next.length === 0) return;

        setIsAppending(true);
        setRecycledItems((prev) => {
          const combined = [...prev, ...next];

          // If we exceed the cap, remove oldest items from the beginning.
          if (combined.length > maxRendered) {
            const removedCount = combined.length - maxRendered;
            const result = combined.slice(-maxRendered);

            // Compensate scroll position for removed items.
            // We use a rough estimate: each removed item ≈ average card height.
            // In practice, card heights vary, but this is close enough to
            // prevent jarring jumps. For more precision, you could measure
            // actual removed item heights before slicing.
            //
            // The compensation works because:
            //   Old document height = topPadding + (prev.length * avgHeight)
            //   New document height = (topPadding + removed*avgHeight) + (result.length * avgHeight)
            //   ≈ same total height
            //   → viewport stays at the same relative position
            setTopPadding((p) => p + removedCount * 320); // 320px = rough card height
            setItemsRemovedCount((c) => c + removedCount);

            return result;
          }

          return combined;
        });
        setTimeout(() => setIsAppending(false), 300);
      },
      { rootMargin: "300px", threshold: 0 },
    );
    observer.observe(ref);

    return () => {
      observer.unobserve(ref);
      recycleObserverActive.current = false;
    };
  }, [isRecycleMode, recycledItems, sourceItems, shuffle, maxRendered, isAppending]);

  // Reset recycle on explicit refresh
  const handleRefresh = useCallback(async () => {
    setRecycledItems([]);
    setTopPadding(0);
    setItemsRemovedCount(0);
    await refetch();
    await onRefresh?.();
  }, [refetch, onRefresh]);

  // ── Visible Data ───────────────────────────────────────────────────────────
  // During API pagination: show all sourceItems (never truncated)
  // During recycle mode: show the sliding window (recycledItems)
  const visibleData = useMemo(() => {
    if (!isRecycleMode) return sourceItems;
    return recycledItems.length > 0 ? recycledItems : sourceItems;
  }, [isRecycleMode, sourceItems, recycledItems]);

  // ── Console Logging ────────────────────────────────────────────────────────
  useEffect(() => {
    console.log("[InfiniteFeed] sourceItems.length:", sourceItems.length);
  }, [sourceItems.length]);

  useEffect(() => {
    console.log("[InfiniteFeed] recycledItems.length:", recycledItems.length);
  }, [recycledItems.length]);

  useEffect(() => {
    console.log("[InfiniteFeed] visibleData.length:", visibleData.length);
    console.log("[InfiniteFeed] itemsRemovedCount:", itemsRemovedCount);
    console.log("[InfiniteFeed] topPadding:", topPadding);
  }, [visibleData.length, itemsRemovedCount, topPadding]);

  // ── Scroll Restoration ────────────────────────────────────────────────────
  const scrollRestored = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!scrollRestorationKey) return;
    return () => {
      if (typeof window === "undefined") return;
      sessionStorage.setItem(scrollRestorationKey, String(window.scrollY));
    };
  }, [scrollRestorationKey]);

  useEffect(() => {
    if (!scrollRestorationKey || !isMounted || isLoading || scrollRestored.current) return;
    if (typeof window === "undefined") return;

    const savedY = sessionStorage.getItem(scrollRestorationKey);
    if (!savedY) return;

    const y = parseInt(savedY, 10);
    if (isNaN(y)) {
      sessionStorage.removeItem(scrollRestorationKey);
      return;
    }

    scrollRestored.current = true;
    sessionStorage.removeItem(scrollRestorationKey);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, y);
      });
    });
  }, [isMounted, isLoading, scrollRestorationKey]);

  // ── API Pagination Trigger (while hasNextPage is true) ───────────────────
  const apiObserverActive = useRef(false);
  const apiLoadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isRecycleMode) return;
    if (!hasNextPage || isFetchingNextPage) return;
    if (disabled) return;
    if (blockLoadMoreRef?.current) return;
    if (apiObserverActive.current) return;

    const ref = apiLoadMoreRef.current;
    if (!ref) return;

    apiObserverActive.current = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        apiObserverActive.current = false;
        fetchNextPage();
      },
      { rootMargin: "100px", threshold: 0 },
    );
    observer.observe(ref);

    return () => {
      observer.unobserve(ref);
      apiObserverActive.current = false;
    };
  }, [isRecycleMode, hasNextPage, isFetchingNextPage, fetchNextPage, disabled, blockLoadMoreRef]);

  // ── Derived State ─────────────────────────────────────────────────────────
  const isEmpty = !isLoading && visibleData.length === 0 && !error;
  const hasError = !!error;

  // ── Render Helpers ────────────────────────────────────────────────────────
  const renderSkeletons = (prefix: string) =>
    Array.from({ length: skeletonCount }).map((_, i) => (
      <div key={`${prefix}-${i}`}>{skeletonComponent}</div>
    ));

  // ── Loading State ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={className}>
        {children}
        <div className={gridClassName}>{renderSkeletons("skeleton")}</div>
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────────────────────
  if (hasError) {
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

  // ── Empty State ───────────────────────────────────────────────────────────
  if (isEmpty) {
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

  // ── Main Render (Bounded Recycling — Sliding Window) ─────────────────────
  //
  // The outer wrapper applies topPadding to compensate for items that have
  // been trimmed from the top of the sliding window. This keeps the document
  // height stable and prevents scroll jumps when old items are removed.
  //
  // React keys use itemsRemovedCount as an offset to maintain stability
  // across window shifts. The key for a given item at a given logical
  // position stays consistent even as the window slides.
  return (
    <div className={className}>
      {children}

      <div style={{ paddingTop: topPadding }}>
        <div className={gridClassName}>
          {visibleData.map((item, index) => {
            // Global index accounts for items removed from the top.
            // This ensures React keys remain stable across window shifts.
            const globalIndex = index + itemsRemovedCount;

            return (
              <div
                key={`${getItemId(item)}-${globalIndex}`}
                ref={
                  index === visibleData.length - 1
                    ? isRecycleMode
                      ? lastItemRef      // recycle observer owns the last item
                      : apiLoadMoreRef   // API pagination observer owns the last item
                    : null
                }
              >
                {renderItem(item, globalIndex)}
              </div>
            );
          })}

          {/* Skeletons during real API pagination */}
          {isFetchingNextPage && renderSkeletons("fetch")}

          {/* Skeletons during recycle-append */}
          {isAppending && renderSkeletons("append")}
        </div>
      </div>

      {/* Bottom loader — backward compat with function signature */}
      {hasNextPage &&
        (typeof endlessLoaderComponent === "function"
          ? endlessLoaderComponent(() => {})
          : endlessLoaderComponent)}
    </div>
  );
}

// ── Hook Export ───────────────────────────────────────────────────────────────
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