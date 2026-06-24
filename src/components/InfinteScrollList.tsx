"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import Image from "next/image";
import {
  startTransition,
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
  maxRecycled?: number;
  shuffle?: <U>(arr: U[]) => U[];
  recycleRootMargin?: string;
  scrollRestorationKey?: string;
  disabled?: boolean;
  blockLoadMoreRef?: React.RefObject<boolean>;
  onRefresh?: () => Promise<void>;
  children?: React.ReactNode;
  /** Responsive column map. Must match your gridClassName breakpoints. */
  columns?: { default: number; sm?: number; md?: number; lg?: number; xl?: number };
  /** Estimated px height of one grid row. Used for initial virtualizer measurement. */
  estimatedItemHeight?: number;
  /** Virtualizer overscan in rows (extra rows rendered above/below viewport). */
  overscan?: number;
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

const DEFAULT_COLUMNS: NonNullable<InfiniteFeedProps<any>["columns"]> = {
  default: 2,
  sm: 3,
  md: 4,
  lg: 5,
};

// ── Hook: responsive column count ─────────────────────────────────────────────

function useColumnCount(
  columns: InfiniteFeedProps<any>["columns"]
): number {
  const cfg = columns ?? DEFAULT_COLUMNS;
  const [count, setCount] = useState(cfg.default);

  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      let c = cfg.default;
      if (cfg.xl && window.matchMedia("(min-width: 1280px)").matches) c = cfg.xl;
      else if (cfg.lg && window.matchMedia("(min-width: 1024px)").matches)
        c = cfg.lg;
      else if (cfg.md && window.matchMedia("(min-width: 768px)").matches)
        c = cfg.md;
      else if (cfg.sm && window.matchMedia("(min-width: 640px)").matches)
        c = cfg.sm;
      setCount(c);
    };
    update();

    const mqs = [
      window.matchMedia("(min-width: 640px)"),
      window.matchMedia("(min-width: 768px)"),
      window.matchMedia("(min-width: 1024px)"),
      window.matchMedia("(min-width: 1280px)"),
    ];
    mqs.forEach((mq) => mq.addEventListener("change", update));
    return () => mqs.forEach((mq) => mq.removeEventListener("change", update));
  }, [cfg.default, cfg.sm, cfg.md, cfg.lg, cfg.xl]);

  return count;
}

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
  maxRecycled = 120,
  shuffle = DEFAULT_SHUFFLE,
  scrollRestorationKey = "feed-scroll-y",
  disabled = false,
  blockLoadMoreRef,
  onRefresh,
  children,
  columns,
  estimatedItemHeight = 320,
  overscan = 3,
}: InfiniteFeedProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const columnCount = useColumnCount(columns);

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
  } = useInfiniteQuery<FeedPage<T>, Error, FeedPage<T>>({
    queryKey,
    queryFn: ({ pageParam = "" }) => queryFn(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime,
  });

  const sourceItems = useMemo<T[]>(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data?.pages]
  );

  const isRefetching = isFetching && !isFetchingNextPage;

  // ── Recycle State ──────────────────────────────────────────────────────────
  const [recycledItems, setRecycledItems] = useState<T[]>([]);
  const [isAppending, setIsAppending] = useState(false);
  const recycleAppendLock = useRef(false);

  const isRecycleMode = !hasNextPage && sourceItems.length > 0;

  // FIX: Seed recycled pool immediately when API is exhausted.
  // Use useMemo so visibleData never briefly becomes empty during transition.
  const visibleData = useMemo(() => {
    if (!isRecycleMode) return sourceItems;
    // During the first render after API exhaustion, recycledItems might be empty.
    // Fall back to sourceItems until recycledItems is seeded.
    return recycledItems.length > 0 ? recycledItems : sourceItems;
  }, [isRecycleMode, sourceItems, recycledItems]);

  const rowCount = Math.ceil(visibleData.length / columnCount);

  // Seed recycled pool once API is exhausted
  useEffect(() => {
    if (isRecycleMode && recycledItems.length === 0 && sourceItems.length > 0) {
      setRecycledItems([...sourceItems]);
    }
  }, [isRecycleMode, sourceItems, recycledItems.length]);

  // Reset recycle on explicit refresh
  const handleRefresh = useCallback(async () => {
    setRecycledItems([]);
    await refetch();
    await onRefresh?.();
  }, [refetch, onRefresh]);

  // ── Window Virtualizer ─────────────────────────────────────────────────────
  // FIX #1: Use useWindowVirtualizer instead of useVirtualizer.
  // useVirtualizer with getScrollElement returning document.documentElement
  // causes the virtualizer to observe the <html> element with ResizeObserver.
  // document.documentElement's height is the FULL page height, not viewport.
  // This breaks viewport calculations, causing only 1-2 rows to render.
  //
  // useWindowVirtualizer is designed for window scrolling and uses:
  // - window.innerHeight for viewport size
  // - window.scrollY for scroll offset
  // - observeWindowRect (no ResizeObserver on window)
  //
  // FIX #2: Remove custom measureElement.
  // The default measureElement uses ResizeObserver internally, which:
  // - Measures each row when it mounts
  // - Re-measures when row height changes (e.g., images loading)
  // - Updates virtualizer state automatically
  // A custom (el) => el.getBoundingClientRect().height only measures once
  // per render and misses async image load size changes.
  //
  // FIX #3: Add scrollMargin.
  // The virtualizer needs to know the offset of the list from the document top
  // so it can correctly calculate which rows are in the viewport.
  //
  // FIX #4: Add useFlushSync: false for React 19 / Next.js 15 compatibility.

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => estimatedItemHeight,
    overscan,
    scrollMargin: parentRef.current?.offsetTop ?? 0,
    useFlushSync: false,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const lastVirtualItem = virtualItems[virtualItems.length - 1];
  const isNearEnd = lastVirtualItem
    ? lastVirtualItem.index >= rowCount - Math.max(overscan, 2)
    : false;

  // ── API pagination trigger ───────────────────────────────────────────────
  useEffect(() => {
    if (isRecycleMode) return;
    if (!isNearEnd || !hasNextPage || isFetchingNextPage) return;
    if (disabled) return;
    if (blockLoadMoreRef?.current) return;
    fetchNextPage();
  }, [
    isRecycleMode,
    isNearEnd,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    disabled,
    blockLoadMoreRef,
  ]);

  // ── Recycle append trigger ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isRecycleMode || !isNearEnd || recycleAppendLock.current) return;
    if (disabled) return;
    if (blockLoadMoreRef?.current) return;
    recycleAppendLock.current = true;

    setIsAppending(true);
    startTransition(() => {
      setRecycledItems((prev) => {
        if (prev.length >= maxRecycled) return prev;
        const next = shuffle([...sourceItems]);
        const combined = [...prev, ...next];
        return combined.length > maxRecycled
          ? combined.slice(combined.length - maxRecycled)
          : combined;
      });
    });

    const unlock = setTimeout(() => {
      recycleAppendLock.current = false;
      setIsAppending(false);
    }, 250);
    return () => clearTimeout(unlock);
  }, [isRecycleMode, isNearEnd, shuffle, sourceItems, maxRecycled, disabled, blockLoadMoreRef]);

  // ── Scroll Restoration ──────────────────────────────────────────────────────
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

  // ── Derived State ──────────────────────────────────────────────────────────
  const isEmpty = !isLoading && visibleData.length === 0 && !error;
  const hasError = !!error;

  // ── Render Helpers ─────────────────────────────────────────────────────────
  const renderSkeletons = (prefix: string) =>
    Array.from({ length: skeletonCount }).map((_, i) => (
      <div key={`${prefix}-${i}`}>{skeletonComponent}</div>
    ));

  // ── Loading State ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={className}>
        {children}
        <div className={gridClassName}>{renderSkeletons("skeleton")}</div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
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

  // ── Empty State ────────────────────────────────────────────────────────────
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

  // ── Main Render (Virtualized) ──────────────────────────────────────────────
  return (
    <div ref={parentRef} className={className}>
      {children}

      <div
        style={{
          position: "relative",
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
        }}
      >
        {virtualItems.map((virtualRow) => {
          const rowIndex = virtualRow.index;
          const startIdx = rowIndex * columnCount;
          const endIdx = Math.min(startIdx + columnCount, visibleData.length);
          const rowItems = visibleData.slice(startIdx, endIdx);

          return (
            <div
              key={virtualRow.key}
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              className={gridClassName}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                minHeight: `${virtualRow.size}px`,
                willChange: "transform",
              }}
            >
              {rowItems.map((item, colIndex) => {
                const globalIndex = startIdx + colIndex;
                return (
                  <div key={`${getItemId(item)}-${globalIndex}`}>
                    {renderItem(item, globalIndex)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Fetch skeletons */}
      {isFetchingNextPage && (
        <div className={gridClassName}>{renderSkeletons("fetch")}</div>
      )}

      {/* Recycle append skeletons */}
      {isAppending && (
        <div className={gridClassName}>{renderSkeletons("append")}</div>
      )}

      {/* Bottom loader — backward compat with function signature */}
      {hasNextPage &&
        (typeof endlessLoaderComponent === "function"
          ? endlessLoaderComponent(() => {})
          : endlessLoaderComponent)}
    </div>
  );
}

// ── Hook Export ──────────────────────────────────────────────────────────────
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