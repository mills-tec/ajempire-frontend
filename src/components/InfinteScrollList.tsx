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

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FeedPage<T> {
  items: T[];
  nextCursor: string | null | undefined;
  hasMore: boolean;
}

interface RecycledItem<T> {
  item: T;
  /** Permanent unique ID – used as React key; never changes after creation */
  instanceId: number;
  /** Permanent creation order – suitable for animations / display index */
  logicalIndex: number;
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
  /** Hard cap on rendered product cards. DOM nodes never exceed this. */
  maxRendered?: number;
  shuffle?: <U>(arr: U[]) => U[];
  scrollRestorationKey?: string;
  disabled?: boolean;
  blockLoadMoreRef?: React.RefObject<boolean>;
  onRefresh?: () => Promise<void>;
  children?: React.ReactNode;
}

// ── Defaults & Constants ─────────────────────────────────────────────────────

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

const MIN_RECYCLE_BATCH = 20; // always append at least this many items
const TRIM_HYSTERESIS = 30;   // only trim when length > maxRendered + this

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Build a batch of `size` items by repeatedly shuffling copies of `source`. */
function buildBatch<T>(
  source: T[],
  size: number,
  shuffle: (arr: T[]) => T[]
): T[] {
  const batch: T[] = [];
  while (batch.length < size) {
    batch.push(...shuffle([...source]));
  }
  return batch.slice(0, size);
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

  // ── Bounded Recycling State ────────────────────────────────────────────────

  const [recycledItems, setRecycledItems] = useState<RecycledItem<T>[]>([]);
  const [isAppending, setIsAppending] = useState(false);

  // Permanent counters – never reset during recycle sessions
  const nextInstanceIdRef = useRef(0);
  const nextLogicalIndexRef = useRef(0);

  // Map of instanceId → DOM element for sentinel measurement
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());

  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const recycleObserverActive = useRef(false);

  const isRecycleMode = !hasNextPage && sourceItems.length > 0;

  // ── Sentinel‑based scroll compensation ─────────────────────────────────────
  const sentinelBeforeRef = useRef<number | null>(null);
  const sentinelInstanceIdRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const sentinelInstanceId = sentinelInstanceIdRef.current;
    if (sentinelBeforeRef.current !== null && sentinelInstanceId !== null) {
      const sentinelEl = itemRefs.current.get(sentinelInstanceId);
      if (sentinelEl) {
        const sentinelTopAfter = sentinelEl.getBoundingClientRect().top;
        const delta = sentinelTopAfter - sentinelBeforeRef.current;
        window.scrollBy(0, delta);
      }
      sentinelBeforeRef.current = null;
      sentinelInstanceIdRef.current = null;
    }
  }, [recycledItems]);

  // ── Seed with sourceItems when recycle mode activates ──────────────────────
  useEffect(() => {
    if (isRecycleMode && recycledItems.length === 0 && sourceItems.length > 0) {
      const seeded = sourceItems.map((item) => ({
        item,
        instanceId: nextInstanceIdRef.current++,
        logicalIndex: nextLogicalIndexRef.current++,
      }));
      setRecycledItems(seeded);
    }
  }, [isRecycleMode, sourceItems, recycledItems.length]);

  // ── Recycle Append Observer (early trigger + bulk batches) ─────────────────
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

        // Build a batch of at least MIN_RECYCLE_BATCH items
        const batch = buildBatch(sourceItems, MIN_RECYCLE_BATCH, shuffle);
        const nextBatch = batch.map((item) => ({
          item,
          instanceId: nextInstanceIdRef.current++,
          logicalIndex: nextLogicalIndexRef.current++,
        }));

        setIsAppending(true);

        // ── Sentinel capture BEFORE state update ─────────────────────────────
        let sentinelBefore: number | null = null;
        let sentinelId: number | null = null;

        const newCombined = [...recycledItems, ...nextBatch];

        // Only trim if we exceed maxRendered + hysteresis
        if (newCombined.length > maxRendered + TRIM_HYSTERESIS) {
          const removeCount = newCombined.length - maxRendered;
          const firstRemaining = newCombined[removeCount];
          sentinelId = firstRemaining.instanceId;
          const sentinelEl = itemRefs.current.get(sentinelId);
          if (sentinelEl) {
            sentinelBefore = sentinelEl.getBoundingClientRect().top;
          }
        }

        sentinelBeforeRef.current = sentinelBefore;
        sentinelInstanceIdRef.current = sentinelId;

        setRecycledItems(
          newCombined.length > maxRendered + TRIM_HYSTERESIS
            ? newCombined.slice(-maxRendered)
            : newCombined
        );

        setTimeout(() => setIsAppending(false), 300);
      },
      {
        // Fire when last card is 400px away from entering the viewport
        rootMargin: "400px 0px",
        threshold: 0,
      }
    );
    observer.observe(ref);

    return () => {
      observer.unobserve(ref);
      recycleObserverActive.current = false;
    };
  }, [isRecycleMode, recycledItems, sourceItems, shuffle, maxRendered, isAppending]);

  // ── Explicit refresh ──────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setRecycledItems([]);
    sentinelBeforeRef.current = null;
    sentinelInstanceIdRef.current = null;
    await refetch();
    await onRefresh?.();
  }, [refetch, onRefresh]);

  // ── Visible data ──────────────────────────────────────────────────────────
  const visibleData = useMemo(() => {
    if (!isRecycleMode) return sourceItems;
    return recycledItems.length > 0 ? recycledItems : sourceItems.map((item) => ({
      item,
      instanceId: nextInstanceIdRef.current++,
      logicalIndex: nextLogicalIndexRef.current++,
    }));
  }, [isRecycleMode, sourceItems, recycledItems]);

  // ── Scroll Restoration (product‑id based, pre‑paint) ───────────────────────
  const isMounted = useRef(false);
  useEffect(() => { isMounted.current = true; }, []);

  // Persist topmost visible product + offset on every scroll
  useEffect(() => {
    if (!scrollRestorationKey) return;
    let timer: NodeJS.Timeout;

    const savePosition = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const cards = document.querySelectorAll("[data-product-id]");
        for (const card of cards) {
          const rect = card.getBoundingClientRect();
          if (rect.bottom > 0) {
            const productId = card.getAttribute("data-product-id")!;
            const offset = rect.top;
            sessionStorage.setItem(
              scrollRestorationKey,
              JSON.stringify({ productId, offset })
            );
            break;
          }
        }
      }, 200);
    };

    window.addEventListener("scroll", savePosition, { passive: true });
    return () => {
      window.removeEventListener("scroll", savePosition);
      clearTimeout(timer);
    };
  }, [scrollRestorationKey]);

  // Restore scroll before paint using useLayoutEffect
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { setIsLoaded(isMounted.current && !isLoading); }, [isLoading]);

  useLayoutEffect(() => {
    if (!scrollRestorationKey || !isLoaded) return;
    const saved = sessionStorage.getItem(scrollRestorationKey);
    if (!saved) return;

    const { productId, offset } = JSON.parse(saved);
    sessionStorage.removeItem(scrollRestorationKey);

    const el = document.querySelector(`[data-product-id="${productId}"]`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "auto" });
    } else {
      // fallback: try again after a short paint (rare edge case)
      const checkExist = setInterval(() => {
        const el = document.querySelector(`[data-product-id="${productId}"]`);
        if (el) {
          clearInterval(checkExist);
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: "auto" });
        }
      }, 50);
      setTimeout(() => clearInterval(checkExist), 3000);
    }
  }, [scrollRestorationKey, isLoaded]);

  // ── API Pagination Trigger (only while API has more pages) ─────────────────
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
      { rootMargin: "100px", threshold: 0 }
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

  // ── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className={className}>
      {children}

      <div className={gridClassName}>
        {visibleData.map((ri, index) => {
          const item = isRecycleMode ? (ri as RecycledItem<T>).item : (ri as T);
          const instanceId = isRecycleMode ? (ri as RecycledItem<T>).instanceId : undefined;
          const logicalIndex = isRecycleMode ? (ri as RecycledItem<T>).logicalIndex : index;

          const key = isRecycleMode ? `ri-${instanceId!}` : `api-${getItemId(item)}-${index}`;

          return (
            <div
              key={key}
              data-product-id={getItemId(item)}
              ref={(node) => {
                if (isRecycleMode && instanceId !== undefined) {
                  if (node) {
                    itemRefs.current.set(instanceId, node);
                  } else {
                    itemRefs.current.delete(instanceId);
                  }
                }
                // Assign the last‑item ref for the appropriate observer
                if (index === visibleData.length - 1) {
                  if (isRecycleMode) {
                    lastItemRef.current = node;
                  } else {
                    apiLoadMoreRef.current = node;
                  }
                }
              }}
            >
              {renderItem(item, logicalIndex)}
            </div>
          );
        })}

        {isFetchingNextPage && renderSkeletons("fetch")}
        {isAppending && renderSkeletons("append")}
      </div>

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