"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import Image from "next/image";
import {
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
   * Soft cap on items kept in the DOM. The window may briefly exceed it when
   * trimming would cut too close to the viewport (trims never remove content
   * within TRIM_GUARD_PX of the visible area).
   */
  maxRendered?: number;
  /**
   * Items added to the window per extension: recycled batches, window
   * re-expansion, and top refills all move in steps of this size. Increase for
   * fewer/larger appends, decrease for smaller/more frequent ones.
   */
  batchSize?: number;
  /** Must return a same-length permutation; invalid results fall back to Fisher–Yates. */
  shuffle?: <U>(arr: U[]) => U[];
  scrollRestorationKey?: string;
  disabled?: boolean;
  blockLoadMoreRef?: React.RefObject<boolean>;
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

// Sentinels trigger while still this far outside the viewport.
const PUMP_MARGIN_PX = 600;
// Trims never remove content within this distance of the viewport.
const TRIM_GUARD_PX = 800;
// Recycled-entry descriptors kept above the window for exact scroll-up
// reconstruction. Beyond this, the oldest fold into permanent spacer height.
const EXTRAS_KEEP_MAX = 600;
// Ids barred from reappearing immediately after a shuffle-bag epoch boundary.
const RECENT_GUARD = 4;

interface FeedEntry<T> {
  item: T;
  key: string;
}

// Window over the virtual sequence [apiEntries…, droppedExtras(gone)…, extras…].
// All indices are absolute sequence positions, so dropping old extras from the
// front never renumbers anything (extrasDropped grows to compensate).
interface WindowState<T> {
  extras: FeedEntry<T>[];
  extrasDropped: number;
  winStart: number;
  winEnd: number; // exclusive; 0 = "unset", render derives an initial window
  topSpacerPx: number; // exact pixel height of trimmed content above winStart
  pendingUpInsert: number | null; // entries just inserted at top, awaiting height measurement
}

const INITIAL_WINDOW: WindowState<never> = {
  extras: [],
  extrasDropped: 0,
  winStart: 0,
  winEnd: 0,
  topSpacerPx: 0,
  pendingUpInsert: null,
};

interface ShuffleBag<T> {
  pool: T[];
  cursor: number;
  recent: string[]; // last few served ids, for the epoch boundary guard
}

// ── Component ──────────────────────────────────────────────────────────────────
//
// Architecture — one sequence, one bidirectional sliding window
// ─────────────────────────────────────────────────────────────
// API pages and recycled batches form a single conceptual sequence rendered
// through a bounded window, so the API→recycle transition is just "more
// entries appended" — no remount, no reshuffle, invisible to the user.
//
// Scroll stability comes from exact pixel accounting, NOT CSS Scroll Anchoring
// (which iOS Safari does not implement):
//   • Front trim (scrolling down): the removed block's height is measured
//     BEFORE the commit (both endpoints are in the DOM), then the removal and
//     the spacer growth land in one state update — net-zero layout shift,
//     no scrollTop writes, so iOS momentum scrolling is never interrupted.
//     Trims are column-count multiples so remaining items never change lanes.
//   • Top refill (scrolling up): previous entries are re-inserted, their real
//     height is measured in useLayoutEffect, and the spacer shrinks by exactly
//     that much in the same pre-paint pass.
//   • Teleports into the spacer (iOS status-bar tap, scroll-to-top button)
//     reset the window to the sequence start at scrollY 0.
//
// A single "pump" drives everything: IntersectionObserver, scroll, and
// post-commit effects all funnel into it; it inspects sentinel positions and
// extends/trims/fetches as needed, so missed IO callbacks can never stall the
// feed. Memory is bounded: DOM ≤ ~maxRendered items, recycled descriptors are
// front-capped, and everything else is numbers in refs.

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
  batchSize = 10,
  shuffle = DEFAULT_SHUFFLE,
  scrollRestorationKey = "feed-scroll-y",
  disabled = false,
  blockLoadMoreRef,
  children,
}: InfiniteFeedProps<T>) {
  // ── Infinite Query ───────────────────────────────────────────────────────────
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery<FeedPage<T>, Error, FeedPage<T>>({
    queryKey,
    queryFn: ({ pageParam = "" }) => queryFn(pageParam as string),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore === false ? undefined : lastPage.nextCursor ?? undefined,
    staleTime,
  });

  const sourceItems = useMemo<T[]>(
    () => data?.pages?.flatMap((p) => p.items ?? []) ?? [],
    [data?.pages],
  );

  // ── Prop mirrors (stable access from event callbacks) ────────────────────────
  const getItemIdRef = useRef(getItemId);
  getItemIdRef.current = getItemId;
  const shuffleRef = useRef(shuffle);
  shuffleRef.current = shuffle;
  const maxRenderedRef = useRef(maxRendered);
  maxRenderedRef.current = maxRendered;
  const batchSizeRef = useRef(batchSize);
  batchSizeRef.current = Math.max(1, batchSize);
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  const hasNextPageRef = useRef(hasNextPage);
  hasNextPageRef.current = hasNextPage;
  const isFetchingRef = useRef(isFetchingNextPage);
  isFetchingRef.current = isFetchingNextPage;
  const fetchNextPageRef = useRef(fetchNextPage);
  fetchNextPageRef.current = fetchNextPage;
  const sourceItemsRef = useRef(sourceItems);
  sourceItemsRef.current = sourceItems;

  // ── Sequence: API entries (derived) ──────────────────────────────────────────
  // Keys are item ids, deduped by occurrence so a server that repeats an id
  // across pages can't produce duplicate React keys.
  const apiEntries = useMemo<FeedEntry<T>[]>(() => {
    const seen = new Map<string, number>();
    return sourceItems.map((item) => {
      const id = getItemIdRef.current(item);
      const n = seen.get(id) ?? 0;
      seen.set(id, n + 1);
      return { item, key: n === 0 ? id : `${id}~${n}` };
    });
  }, [sourceItems]);
  const apiEntriesRef = useRef(apiEntries);
  apiEntriesRef.current = apiEntries;

  // ── Window state ─────────────────────────────────────────────────────────────
  const [win, setWin] = useState<WindowState<T>>(INITIAL_WINDOW);

  const seqLen = apiEntries.length + win.extrasDropped + win.extras.length;
  // winEnd === 0 means "unset": derive an initial window so the first success
  // render paints content immediately (no empty-grid frame before the pump runs).
  const effWinEnd =
    win.winEnd > 0 ? Math.min(win.winEnd, seqLen) : Math.min(seqLen, maxRendered);
  const effWinStart = Math.min(win.winStart, effWinEnd);

  const windowRef = useRef<WindowState<T>>(win);
  windowRef.current = { ...win, winStart: effWinStart, winEnd: effWinEnd };

  const renderedEntries = useMemo<FeedEntry<T>[]>(() => {
    const apiLen = apiEntries.length;
    const out: FeedEntry<T>[] = [];
    for (let i = effWinStart; i < effWinEnd; i++) {
      if (i < apiLen) {
        out.push(apiEntries[i]);
      } else {
        const j = i - apiLen - win.extrasDropped;
        if (j >= 0 && j < win.extras.length) out.push(win.extras[j]);
      }
    }
    return out;
  }, [apiEntries, win.extras, win.extrasDropped, effWinStart, effWinEnd]);

  // ── DOM refs ─────────────────────────────────────────────────────────────────
  const gridRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

  // ── Shuffle bag ──────────────────────────────────────────────────────────────
  const bagRef = useRef<ShuffleBag<T>>({ pool: [], cursor: 0, recent: [] });
  const keyCounterRef = useRef(0);
  const warnedShuffleRef = useRef(false);

  // Rebuilds the pool from the LATEST source snapshot each epoch, so background
  // refetches (focus/mount) flow into future batches without ever touching
  // what's already on screen.
  const refillBag = () => {
    const getId = getItemIdRef.current;
    const seen = new Set<string>();
    const fresh: T[] = [];
    for (const item of sourceItemsRef.current) {
      const id = getId(item);
      if (!seen.has(id)) {
        seen.add(id);
        fresh.push(item);
      }
    }
    let pool = shuffleRef.current(fresh.slice());
    if (!Array.isArray(pool) || pool.length !== fresh.length) {
      if (!warnedShuffleRef.current) {
        warnedShuffleRef.current = true;
        console.warn(
          "[InfiniteFeed] shuffle prop must return a same-length permutation; using internal shuffle.",
        );
      }
      pool = DEFAULT_SHUFFLE(fresh);
    }
    // Epoch boundary guard: keep just-served ids out of the first few slots so
    // the same product never appears on both sides of a reshuffle seam.
    const bag = bagRef.current;
    const g = Math.min(RECENT_GUARD, pool.length >> 2);
    if (g > 0 && bag.recent.length > 0) {
      const recent = new Set(bag.recent);
      for (let i = 0; i < g; i++) {
        if (!recent.has(getId(pool[i]))) continue;
        for (let j = pool.length - 1; j >= g; j--) {
          if (!recent.has(getId(pool[j]))) {
            const tmp = pool[i];
            pool[i] = pool[j];
            pool[j] = tmp;
            break;
          }
        }
      }
    }
    bag.pool = pool;
    bag.cursor = 0;
  };

  const drawBatch = (n: number): FeedEntry<T>[] => {
    const bag = bagRef.current;
    const getId = getItemIdRef.current;
    // First draw ever: seed `recent` with the API tail so the recycle seam
    // doesn't immediately repeat what the user just scrolled past.
    if (bag.pool.length === 0 && bag.recent.length === 0) {
      bag.recent = apiEntriesRef.current
        .slice(-RECENT_GUARD)
        .map((e) => getId(e.item));
    }
    const out: FeedEntry<T>[] = [];
    for (let i = 0; i < n; i++) {
      if (bag.cursor >= bag.pool.length) refillBag();
      if (bag.pool.length === 0) break;
      const item = bag.pool[bag.cursor++];
      out.push({ item, key: `r${keyCounterRef.current++}` });
      bag.recent.push(getId(item));
      if (bag.recent.length > RECENT_GUARD) bag.recent.shift();
    }
    return out;
  };

  // ── Window operations ────────────────────────────────────────────────────────

  const columnCount = (grid: HTMLElement): number =>
    getComputedStyle(grid).gridTemplateColumns.split(" ").length || 1;

  const resetToTop = (scroll: boolean) => {
    setWin(INITIAL_WINDOW);
    if (scroll) window.scrollTo(0, 0);
  };

  // Extends the window downward: re-expose existing entries below it, else
  // fetch the next API page, else append a recycled batch. Then front-trims
  // (column-aligned, pre-measured) in the SAME commit. Returns true if it
  // acted, so the pump doesn't run a second operation on stale state.
  const handleBottom = (): boolean => {
    const st = windowRef.current;
    const apiLen = apiEntriesRef.current.length;
    const totalLen = apiLen + st.extrasDropped + st.extras.length;
    const grid = gridRef.current;
    if (!grid) return false;

    // Data shrank under the window (rare refetch edge) — start over.
    if (st.winStart > 0 && st.winStart >= totalLen) {
      resetToTop(true);
      return true;
    }

    let newExtras = st.extras;
    let newWinEnd = st.winEnd;

    if (st.winEnd < totalLen) {
      newWinEnd = Math.min(totalLen, st.winEnd + batchSizeRef.current);
    } else if (hasNextPageRef.current === true) {
      if (!isFetchingRef.current) fetchNextPageRef.current();
      return true;
    } else if (hasNextPageRef.current === false) {
      // The feed never visually ends: with fewer source items than a batch,
      // the bag simply refills mid-batch (duplicates are intentional).
      const batch = drawBatch(batchSizeRef.current);
      if (batch.length === 0) return false;
      newExtras = [...st.extras, ...batch];
      newWinEnd = st.winEnd + batch.length;
    } else {
      return false; // hasNextPage undefined: initial load still settling
    }

    // Front trim. Both measurement endpoints are in the current DOM, so the
    // removal and the spacer growth commit together — net-zero layout shift
    // above the viewport, no scroll compensation needed on any browser.
    let newWinStart = st.winStart;
    let newSpacer = st.topSpacerPx;
    let newDropped = st.extrasDropped;
    const excess = newWinEnd - st.winStart - maxRenderedRef.current;
    if (excess > 0) {
      const kids = grid.children;
      const renderedCount = st.winEnd - st.winStart;
      let safe = 0;
      while (
        safe < renderedCount &&
        safe < kids.length &&
        kids[safe].getBoundingClientRect().bottom < -TRIM_GUARD_PX
      ) {
        safe++;
      }
      const cols = columnCount(grid);
      const k = Math.floor(Math.min(excess, safe) / cols) * cols;
      if (k > 0 && k < kids.length) {
        const h =
          (kids[k] as HTMLElement).offsetTop -
          (kids[0] as HTMLElement).offsetTop;
        newWinStart = st.winStart + k;
        newSpacer = st.topSpacerPx + h;
      }
    }

    // Cap retained recycled descriptors above the window; the oldest fold into
    // permanent spacer height. Keeps the JS heap constant on endless sessions.
    if (newWinStart > apiLen) {
      const keptAbove = newWinStart - apiLen - newDropped;
      if (keptAbove > EXTRAS_KEEP_MAX) {
        const drop = keptAbove - EXTRAS_KEEP_MAX;
        newExtras = newExtras.slice(drop);
        newDropped += drop;
      }
    }

    if (
      newWinEnd === st.winEnd &&
      newWinStart === st.winStart &&
      newExtras === st.extras
    ) {
      return false;
    }
    setWin({
      extras: newExtras,
      extrasDropped: newDropped,
      winStart: newWinStart,
      winEnd: newWinEnd,
      topSpacerPx: newSpacer,
      pendingUpInsert: null,
    });
    return true;
  };

  // Extends the window upward by re-inserting the entries the user scrolled
  // past (exact same content). Height is unknown until rendered, so the commit
  // sets pendingUpInsert and the layout effect below settles the spacer before
  // paint. Bottom rows far below the viewport are trimmed in the same commit
  // (bottom removal needs no compensation).
  const handleTop = () => {
    const st = windowRef.current;
    const apiLen = apiEntriesRef.current.length;
    const grid = gridRef.current;
    if (!grid || st.winStart <= 0) return;

    const recoverableStart =
      st.winStart <= apiLen ? 0 : apiLen + st.extrasDropped;
    let k = Math.min(batchSizeRef.current, st.winStart - recoverableStart);
    if (k <= 0) return; // only permanently-dropped extras above; teleport reset covers it
    const cols = columnCount(grid);
    const aligned = Math.floor(k / cols) * cols;
    // Column-aligned so existing items keep their lanes; the sub-column
    // remainder only occurs at the very top of the sequence, where the final
    // layout is the feed's true start anyway.
    if (aligned > 0) k = aligned;

    let bottomTrim = 0;
    const kids = grid.children;
    const renderedCount = st.winEnd - st.winStart;
    const excess = renderedCount + k - maxRenderedRef.current;
    if (excess > 0) {
      const viewportBottom = window.innerHeight + TRIM_GUARD_PX;
      while (bottomTrim < excess) {
        const idx = renderedCount - 1 - bottomTrim;
        if (idx < 0 || idx >= kids.length) break;
        if (kids[idx].getBoundingClientRect().top > viewportBottom) bottomTrim++;
        else break;
      }
    }

    setWin({
      ...st,
      winStart: st.winStart - k,
      winEnd: st.winEnd - bottomTrim,
      pendingUpInsert: k,
    });
  };

  // Settles a top refill: measure the inserted block's real height and shrink
  // the spacer by exactly that much. Runs pre-paint, so the user never sees an
  // intermediate frame. If the spacer can't absorb it all (measurement drift),
  // the remainder is compensated with a one-off scrollBy.
  useLayoutEffect(() => {
    const k = win.pendingUpInsert;
    if (!k) return;
    const grid = gridRef.current;
    if (!grid || grid.children.length <= k) {
      setWin((prev) => ({ ...prev, pendingUpInsert: null }));
      return;
    }
    const h =
      (grid.children[k] as HTMLElement).offsetTop -
      (grid.children[0] as HTMLElement).offsetTop;
    const deficit = h - win.topSpacerPx;
    setWin((prev) => ({
      ...prev,
      topSpacerPx: Math.max(0, prev.topSpacerPx - h),
      pendingUpInsert: null,
    }));
    if (deficit > 0) window.scrollBy(0, deficit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.pendingUpInsert]);

  // ── The pump ─────────────────────────────────────────────────────────────────
  // Single driver for all window movement. Anything that might leave a sentinel
  // in range calls it; it checks real DOM positions, so a missed IO callback
  // (e.g. a sentinel that stays intersecting) can never stall the feed.
  const pump = () => {
    if (disabledRef.current || blockLoadMoreRef?.current) return;
    if (windowRef.current.pendingUpInsert) return;
    const viewportH = window.innerHeight;

    const bottom = bottomSentinelRef.current;
    if (bottom) {
      const r = bottom.getBoundingClientRect();
      if (r.top < viewportH + PUMP_MARGIN_PX && handleBottom()) return;
    }
    const top = topSentinelRef.current;
    if (top && windowRef.current.winStart > 0) {
      const r = top.getBoundingClientRect();
      if (r.bottom > -PUMP_MARGIN_PX) handleTop();
    }
  };
  const pumpRef = useRef(pump);
  pumpRef.current = pump;

  const showFeed = !isLoading && !error && sourceItems.length > 0;

  // Wake the pump on sentinel proximity (scroll-driven).
  useEffect(() => {
    if (!showFeed) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) pumpRef.current();
      },
      { rootMargin: `${PUMP_MARGIN_PX}px 0px`, threshold: 0 },
    );
    if (topSentinelRef.current) observer.observe(topSentinelRef.current);
    if (bottomSentinelRef.current) observer.observe(bottomSentinelRef.current);
    return () => observer.disconnect();
  }, [showFeed]);

  // Wake the pump after every commit that could leave a sentinel in range
  // (new page landed, window moved, fetch settled, block released).
  useEffect(() => {
    if (!showFeed) return;
    pumpRef.current();
  }, [showFeed, win, apiEntries.length, hasNextPage, isFetchingNextPage, disabled]);

  // ── Reset when the feed identity changes (e.g. category switch) ──────────────
  const queryKeyStr = queryKey.join("|");
  const prevKeyRef = useRef(queryKeyStr);
  useEffect(() => {
    if (prevKeyRef.current === queryKeyStr) return;
    prevKeyRef.current = queryKeyStr;
    bagRef.current = { pool: [], cursor: 0, recent: [] };
    keyCounterRef.current = 0;
    setWin(INITIAL_WINDOW);
  }, [queryKeyStr]);

  // ── Scroll: restoration save + teleport recovery + pump wake ─────────────────
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (scrollRestorationKey) {
          sessionStorage.setItem(scrollRestorationKey, String(window.scrollY));
        }
        // Teleport into the spacer (iOS status-bar tap, scroll-to-top button):
        // the viewport sits entirely above the grid → land at the true start.
        const st = windowRef.current;
        if (st.topSpacerPx > 0 && gridRef.current) {
          if (gridRef.current.getBoundingClientRect().top > window.innerHeight) {
            resetToTop(true);
            return;
          }
        }
        pumpRef.current();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
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

  // ── Feed ──────────────────────────────────────────────────────────────────────
  // overflow-anchor: none — the window does its own exact pixel accounting;
  // native scroll anchoring (absent on iOS anyway) must not double-compensate.
  return (
    <div className={className} style={{ overflowAnchor: "none" }}>
      {children}

      <div style={{ height: win.topSpacerPx }} aria-hidden="true" />
      <div ref={topSentinelRef} style={{ height: 1 }} aria-hidden="true" />

      <div className={gridClassName} ref={gridRef}>
        {renderedEntries.map(({ item, key }, i) => (
          <div key={key} data-product-id={getItemId(item)}>
            {renderItem(item, effWinStart + i)}
          </div>
        ))}
        {isFetchingNextPage && renderSkeletons("fetch")}
      </div>

      <div ref={bottomSentinelRef} style={{ height: 1 }} aria-hidden="true" />

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
  >,
) {
  return options;
}
