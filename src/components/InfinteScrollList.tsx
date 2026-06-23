// components/InfiniteScrollList.tsx
"use client";

import PullToRefreshContainer from "@/app/components/pull-to-refresh/PullToRefreshContainer";
import PullToRefreshHeader from "@/app/components/pull-to-refresh/PullToRefreshHeader";
import {
    PullToRefreshProvider,
    usePullToRefresh,
} from "@/app/components/pull-to-refresh/PullToRefreshProvider";
import ScrollToTop from "@/app/components/ui/ScrollToTop";
import EndlessScrollLoading from "@/components/EndlessScrollLoading";
import { ITEMS_TO_APPEND, shuffleArray } from "@/lib/utils";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";

// ── Types ──────────────────────────────────────────────────────────────────────

interface PageResponse<T> {
  message: {
    products: T[]; // same key your existing APIs use
    nextCursor?: string;
    hasMore: boolean;
  };
}

const EMPTY_ITEMS = [] as never[];
const makeEmptyResponse = <T,>(): PageResponse<T> => ({
  message: { products: [], nextCursor: undefined, hasMore: false },
});

interface InfiniteScrollListProps<T> {
  /** Unique key used for React Query cache — must be different per usage */
  queryKey: string;
  /** Base API URL — cursor and limit are appended automatically */
  apiUrl: string;
  /** How to fetch a single page. Receives the full query string, returns the page. */
  fetcher: (query: string) => Promise<PageResponse<T>>;
  /** Render a single item. Receives the item and its flat list index. */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Optional skeleton to show while loading. Defaults to built-in <Skeleton /> */
  renderSkeleton?: () => React.ReactNode;
  /** Number of skeleton placeholders to show. Defaults to ITEMS_TO_APPEND */
  skeletonCount?: number;
  /** Extra className on the grid wrapper */
  gridClassName?: string;
  /** Shown when the list is empty and not loading */
  emptyState?: React.ReactNode;
  /** Scroll restoration session key — must differ per page that uses this */
  scrollKey?: string;
}

// ── Inner content (needs PullToRefreshProvider above it) ──────────────────────

function InfiniteScrollContent<T>({
  queryKey,
  apiUrl,
  fetcher,
  renderItem,
  renderSkeleton,
  skeletonCount = ITEMS_TO_APPEND,
  gridClassName = "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-2 lg:gap-6",
  emptyState,
  scrollKey = "infinite-scroll-y",
}: InfiniteScrollListProps<T>) {
  const { pull, refreshing } = usePullToRefresh();
  const queryClient = useQueryClient();

  // ── Infinite query ───────────────────────────────────────────────────────────
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    refetch,
  } = useInfiniteQuery<PageResponse<T>, Error>({
    queryKey: [queryKey],
    queryFn: ({ pageParam = "" }: { pageParam?: string }) =>
      fetcher(`limit=${ITEMS_TO_APPEND}&cursor=${pageParam}&url=${apiUrl}`).then(
        (res) => res ?? makeEmptyResponse<T>()
      ),
    getNextPageParam: (lastPage) =>
      lastPage?.message?.nextCursor ?? undefined,
    staleTime: Infinity,
  });

  const products = useMemo(
    () =>
      data?.pages.flatMap((page) => page.message?.products ?? []) ??
      (EMPTY_ITEMS as T[]),
    [data?.pages]
  );

  const isRefetching = isFetching && !isFetchingNextPage;

  // ── Scroll restoration ───────────────────────────────────────────────────────
  const scrollRestored = useRef(false);
  useEffect(() => {
    return () => {
      sessionStorage.setItem(scrollKey, String(window.scrollY));
    };
  }, [scrollKey]);

  useEffect(() => {
    if (isLoading || scrollRestored.current) return;
    const savedY = sessionStorage.getItem(scrollKey);
    if (!savedY) return;
    scrollRestored.current = true;
    sessionStorage.removeItem(scrollKey);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(savedY, 10));
      });
    });
  }, [isLoading, scrollKey]);

  // ── Block infinite scroll during scroll-to-top ───────────────────────────────
  const blockInfiniteLoadRef = useRef(false);
  useEffect(() => {
    const onScrollToTop = () => {
      blockInfiniteLoadRef.current = true;
      setTimeout(() => {
        blockInfiniteLoadRef.current = false;
      }, 800);
    };
    window.addEventListener("scroll-to-top-start", onScrollToTop);
    return () =>
      window.removeEventListener("scroll-to-top-start", onScrollToTop);
  }, []);

  // ── Recycle-append (infinite mirage when API is exhausted) ───────────────────
  const [recycledProducts, setRecycledProducts] = useState<T[]>([]);
  const [isAppending, setIsAppending] = useState(false);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const recycleObserverActive = useRef(false);

  useEffect(() => {
    if (!hasNextPage && products.length > 0 && recycledProducts.length === 0) {
      setRecycledProducts(products);
    }
  }, [hasNextPage, products, recycledProducts.length]);

  useEffect(() => {
    const shouldObserve = !hasNextPage && recycledProducts.length > 0;
    if (!shouldObserve || recycleObserverActive.current) return;

    const ref = lastItemRef.current;
    if (!ref) return;

    recycleObserverActive.current = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        recycleObserverActive.current = false;

        const next = shuffleArray([...recycledProducts]);
        if (next.length === 0) return;
        setIsAppending(true);
        setRecycledProducts((prev) => [...prev, ...next]);
        setTimeout(() => setIsAppending(false), 0);
      },
      { rootMargin: "300px", threshold: 0 }
    );
    observer.observe(ref);

    return () => {
      observer.unobserve(ref);
      recycleObserverActive.current = false;
    };
  }, [hasNextPage, recycledProducts]);

  // ── useInfiniteScroll hook ───────────────────────────────────────────────────
  const [infiniteRef] = useInfiniteScroll({
    loading: isFetchingNextPage,
    hasNextPage: !!hasNextPage,
    onLoadMore: () => {
      if (blockInfiniteLoadRef.current || refreshing || isRefetching) return;
      fetchNextPage();
    },
    disabled: !hasNextPage || refreshing || isRefetching,
    rootMargin: "100px 0px",
  });

  // ── Pull to refresh ──────────────────────────────────────────────────────────
  // (PullToRefreshProvider wires up the gesture; refetch() resets to page 1)
  // We expose a handleRefresh via the provider's onRefresh prop (see wrapper below)
  // so nothing extra is needed here — refetch is passed to the outer wrapper.

  const visibleProducts = hasNextPage ? products : recycledProducts;

  const skeletons = Array.from({ length: skeletonCount });
  const defaultSkeleton = () => (
    <div className="h-[300px] w-full bg-gray-200 rounded-xl animate-pulse" />
  );
  const skeleton = renderSkeleton ?? defaultSkeleton;

  return (
    <>
      <PullToRefreshHeader />
      <PullToRefreshContainer>
        <div className="w-full">
          <div className="mt-8">
            {isLoading ? (
              <div className={gridClassName}>
                {skeletons.map((_, i) => (
                  <div key={`skeleton-${i}`}>{skeleton()}</div>
                ))}
              </div>
            ) : (
              <>
                {!isLoading && visibleProducts.length === 0 && (
                  <div className="col-span-full">
                    {emptyState ?? (
                      <p className="text-center text-sm text-gray-500 mt-10">
                        No items available right now.
                      </p>
                    )}
                  </div>
                )}

                <div className={gridClassName}>
                  {visibleProducts.map((item, index) => (
                    <div
                      key={index}
                      ref={
                        index === visibleProducts.length - 1
                          ? hasNextPage
                            ? infiniteRef
                            : lastItemRef
                          : null
                      }
                    >
                      {renderItem(item, index)}
                    </div>
                  ))}

                  {isFetchingNextPage &&
                    skeletons.map((_, i) => (
                      <div key={`fetch-skeleton-${i}`}>{skeleton()}</div>
                    ))}

                  {isAppending &&
                    skeletons.map((_, i) => (
                      <div key={`append-skeleton-${i}`}>{skeleton()}</div>
                    ))}
                </div>

                {hasNextPage && (
                  <EndlessScrollLoading
                    infiniteRef={infiniteRef}
                    hasNextPage={!!hasNextPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </PullToRefreshContainer>
      <ScrollToTop />
    </>
  );
}

// ── Public wrapper (wires pull-to-refresh + exposes the component) ────────────

export default function InfiniteScrollList<T>(
  props: InfiniteScrollListProps<T>
) {
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.resetQueries({ queryKey: [props.queryKey] });
  };

  return (
    <PullToRefreshProvider onRefresh={handleRefresh}>
      <InfiniteScrollContent {...props} />
    </PullToRefreshProvider>
  );
}