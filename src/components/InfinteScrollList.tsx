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
   * Maximum number of items kept in the DOM during recycle mode.
   * When exceeded, the oldest items are trimmed from the top.
   * CSS Scroll Anchoring keeps the visible viewport stable during trims.
   * Lower = less memory on iOS Safari. 60 ≈ 6 mobile screens at 2 cols.
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

// Items appended to the bottom of displayItems on each recycle trigger.
const APPEND_BATCH = 20;

// ── Internal item shape ────────────────────────────────────────────────────────

interface SlottedItem<T> {
  item: T;
  // Globally monotonic key — guarantees React never confuses two different
  // items even when the same source product recurs in a later loop.
  key: string;
}

// ── Component ──────────────────────────────────────────────────────────────────
//
// Recycle-mode architecture — sliding window with CSS Scroll Anchoring
// ────────────────────────────────────────────────────────────────────
// displayItems is a bounded array that slides forward through an infinite
// circular source:
//
//   1. A sentinel element lives BELOW the grid.
//   2. When the sentinel enters the viewport (with a 600px rootMargin buffer),
//      appendBatch() fires:
//        a. Pulls APPEND_BATCH items from the circular source (mod wrap).
//        b. Pushes them onto the END of displayItems.
//        c. If displayItems now exceeds maxRendered, trims the FRONT.
//   3. CSS Scroll Anchoring (on by default in Chrome 56+, Firefox 66+,
//      Safari 16+) automatically adjusts scrollTop when items are removed
//      above the viewport — the visible area never jumps.
//   4. Each item carries a monotonically increasing key. React treats
//      append as "create new DOM at bottom" and trim as "destroy old DOM
//      at top". Browser reclaims image bitmap memory for destroyed nodes.
//
// Memory bound: max(maxRendered, source.length) DOM nodes. Constant.
// No absolute positioning. No measurement. No fixed-height containers.
// Normal CSS grid layout controlled entirely by gridClassName.

export function InfiniteFeed<T>({
  queryKey,
  queryFn,
  staleTime = 0,
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
    dataUpdatedAt,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    error,
  } = useInfiniteQuery<FeedPage<T>, Error, FeedPage<T>>({
    queryKey,
    queryFn: ({ pageParam = "" }) => queryFn(pageParam as string),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime,
  });

  const sourceItems = useMemo<T[]>(
    () => data?.pages?.flatMap((p) => p.items ?? []) ?? [],
    [data?.pages]
  );


  const isRecycleMode = !hasNextPage && sourceItems.length > 0;

  // ── Stable refs ──────────────────────────────────────────────────────────────
  const shuffleRef = useRef(shuffle);
  shuffleRef.current = shuffle;
  const maxRenderedRef = useRef(maxRendered);
  maxRenderedRef.current = maxRendered;

  // ── Recycle state ─────────────────────────────────────────────────────────────
  const [displayItems, setDisplayItems] = useState<SlottedItem<T>[]>([]);
  const [isSeeded, setIsSeeded] = useState(false);

  // Circular cursor into the shuffled source array.
  const cursorRef = useRef(0);
  // Global counter — appended to keys for permanent uniqueness.
  const counterRef = useRef(0);
  // Shuffled snapshot of sourceItems, fixed at seed time.
  const shuffledSrcRef = useRef<T[]>([]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const apiLoadMoreRef = useRef<HTMLDivElement | null>(null);

  // ── Reseed on fresh data ───────────────────────────────────────────────────────
  // A completed refetch (e.g. the automatic staleTime:0 mount refetch, or a
  // pull-to-refresh) replaces `data`, but once recycle mode has already seeded
  // once it otherwise never looks at `data` again — so a product deleted after
  // seeding would stay visible forever. Un-seed whenever the query resolves with
  // a newer `dataUpdatedAt`, which lets the seed effect below rebuild the
  // recycle pool from the fresh source items.
  const seededAtRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isRecycleMode) return;
    if (seededAtRef.current === dataUpdatedAt) return;
    seededAtRef.current = dataUpdatedAt;
    setIsSeeded(false);
  }, [isRecycleMode, dataUpdatedAt]);

  // ── Seed ─────────────────────────────────────────────────────────────────────
  // Fires once when the API has no more pages.
  // Shuffles source items, fills displayItems up to maxRendered.
  useEffect(() => {
    if (!isRecycleMode || isSeeded) return;

    // --- FIX: Validate the shuffle result ---
    let shuffled = shuffleRef.current([...sourceItems]);
    // If the shuffle function does not preserve the input length, fall back to
    // the built‑in DEFAULT_SHUFFLE which is known to work.
    if (!Array.isArray(shuffled) || shuffled.length !== sourceItems.length) {
      console.warn(
        "[InfiniteFeed] Custom shuffle returned invalid array (length mismatch). Falling back to default shuffle."
      );
      shuffled = DEFAULT_SHUFFLE([...sourceItems]);
    }
    // ---------------------------------------

    shuffledSrcRef.current = shuffled;
    cursorRef.current = 0;
    counterRef.current = 0;

    const cap = Math.min(shuffled.length, maxRenderedRef.current);
    const initial: SlottedItem<T>[] = [];
    for (let i = 0; i < cap; i++) {
      initial.push({ item: shuffled[i], key: `feed-${counterRef.current++}` });
    }
    cursorRef.current = cap % shuffled.length;

    setDisplayItems(initial);
    setIsSeeded(true);
  // sourceItems is stable by this point (hasNextPage just became false).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecycleMode, isSeeded]);

  // ── Append batch ──────────────────────────────────────────────────────────────
  // Pulls APPEND_BATCH items from the circular source, pushes them onto the end
  // of displayItems, then trims the front to stay within maxRendered.
  //
  // Front-trimming is safe because CSS Scroll Anchoring compensates scrollTop
  // automatically — the browser selects a visible element as its anchor point
  // and preserves its viewport position when content above it is removed.
  const appendBatch = useCallback(() => {
    const src = shuffledSrcRef.current;
    if (!src.length) return;

    const newItems: SlottedItem<T>[] = [];
    for (let i = 0; i < APPEND_BATCH; i++) {
      newItems.push({
        item: src[cursorRef.current],
        key: `feed-${counterRef.current++}`,
      });
      cursorRef.current = (cursorRef.current + 1) % src.length;
    }

    setDisplayItems((prev) => {
      const combined = [...prev, ...newItems];
      const cap = maxRenderedRef.current;
      // Keep only the most-recent `cap` items. The front (oldest, above the
      // viewport) is discarded. Scroll Anchoring keeps the screen stable.
      if (combined.length > cap) {
        return combined.slice(combined.length - cap);
      }
      return combined;
    });
  }, []);

  // ── Sentinel observer ─────────────────────────────────────────────────────────
  // Observes a 1px sentinel placed after the grid. The 600px rootMargin fires
  // appendBatch while the user is still ~2 screens above the true bottom,
  // giving React time to commit new items before they scroll into view.
  useEffect(() => {
    if (!isSeeded) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) appendBatch(); },
      { rootMargin: "600px 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // appendBatch is stable (no deps). isSeeded flips true once and stays.
  }, [isSeeded, appendBatch]);

  // ── API pagination observer ───────────────────────────────────────────────────
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

  // ── Refresh ───────────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setDisplayItems([]);
    setIsSeeded(false);
    cursorRef.current = 0;
    counterRef.current = 0;
    shuffledSrcRef.current = [];
    await refetch();
    await onRefresh?.();
  }, [refetch, onRefresh]);
  void handleRefresh;

  // ── Scroll restoration ────────────────────────────────────────────────────────
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

  // ── Render helpers ────────────────────────────────────────────────────────────
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

  // ── Recycle mode ──────────────────────────────────────────────────────────────
  if (isRecycleMode && isSeeded) {
    return (
      <div className={className}>
        {children}
        <div className={gridClassName}>
          {displayItems.map(({ item, key }, index) => (
            <div key={key} data-product-id={getItemId(item)}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
        {/*
          Sentinel: a 1px element below the grid.
          IntersectionObserver fires when it comes within 600px of the viewport,
          triggering appendBatch() before the user actually reaches the bottom.
        */}
        <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────────
  if (sourceItems.length === 0) {
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


  // ── API pagination mode ───────────────────────────────────────────────────────
  return (
    <div className={className}>
      {children}

      <div className={gridClassName}>
        {sourceItems.map((item, index) => {
          const isLast = index === sourceItems.length - 1;
          
          return (
            <div
              key={`api-${getItemId(item)}-${index}`}
              data-product-id={getItemId(item)}
              ref={isLast ? apiLoadMoreRef : undefined}
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