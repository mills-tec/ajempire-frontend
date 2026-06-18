"use client";
export const dynamic = "force-dynamic";

import Categories from "@/app/components/ui/Categories";
import EndlessScrollLoading from "@/components/EndlessScrollLoading";
import ProductItem from "@/components/ProductItem";
import Skeleton from "@/components/Skeleton";
import { getProducts, getProductsByCategory } from "@/lib/api";
import { useSearchStore } from "@/lib/search-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { useCategoryStore } from "@/lib/stores/category-store";
import type { Product, ProductsResponse } from "@/lib/types";
import { ITEMS_TO_APPEND, shuffleArray } from "@/lib/utils";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import CartPopup from "./components/CartPopup";
import HomeHeroSlider from "./components/HomeHeroSlider";
import PullToRefreshContainer from "./components/pull-to-refresh/PullToRefreshContainer";
import PullToRefreshHeader from "./components/pull-to-refresh/PullToRefreshHeader";
import {
  PullToRefreshProvider,
  usePullToRefresh,
} from "./components/pull-to-refresh/PullToRefreshProvider";
import ScrollToTop from "./components/ui/ScrollToTop";
import SearchBar from "./components/ui/SearchBar";

const EMPTY_PRODUCTS: Product[] = [];

const EMPTY_RESPONSE: ProductsResponse = {
  message: {
    products: [],
    shippingFees: [],
    nextCursor: undefined,
    hasMore: false,
  },
};

export default function Home() {
  const queryClient = useQueryClient();
  const { selectedCategory } = useCategoryStore();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    refetch,
  } = useInfiniteQuery<ProductsResponse, Error>({
    queryKey: ["products"],
    queryFn: ({ pageParam = "" }: { pageParam?: string }) =>
      getProducts(`limit=${ITEMS_TO_APPEND}&cursor=${pageParam}`).then(
        (res) => res ?? EMPTY_RESPONSE,
      ),
    getNextPageParam: (lastPage: ProductsResponse) =>
      lastPage?.message?.nextCursor ?? undefined,
    staleTime: Infinity,
  });

  // Flatten all pages into a single product array
  const products = useMemo(() => {
    return (
      data?.pages.flatMap((page) => page.message?.products ?? []) ??
      EMPTY_PRODUCTS
    );
  }, [data?.pages]);

  const handleRefresh = async () => {
    try {
      if (selectedCategory) {
        const currentCategoryData = queryClient.getQueryData<Product[]>([
          "home-category-products",
          selectedCategory.name,
        ]);
        if (currentCategoryData?.length) {
          queryClient.setQueryData(
            ["home-category-products", selectedCategory.name],
            shuffleArray([...currentCategoryData]),
          );
        }
        return;
      }
      // useInfiniteQuery refetch resets to page 1 automatically — no manual
      // cache manipulation needed, no cursor/pagination state to reset manually
      await refetch();
    } catch (error) {
      console.error("Pull-to-refresh error:", error);
    }
  };

  return (
    <PullToRefreshProvider onRefresh={handleRefresh}>
      <HomeContent
        products={products}
        isLoading={isLoading}
        isRefetching={isFetching && !isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </PullToRefreshProvider>
  );
}

interface HomeContentProps {
  products: Product[];
  isLoading: boolean;
  isRefetching: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

function HomeContent({
  products,
  isLoading,
  isRefetching,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: HomeContentProps) {
  const { pull, refreshing } = usePullToRefresh();

  const selectedItem = useCartStore((state) => state.selectedItem);
  const { selectedCategory, setSelectedCategory, _hasHydrated } =
    useCategoryStore();
  const { searchedQuery, resetToken } = useSearchStore();
  const queryClient = useQueryClient();

  const searchActive = Boolean(searchedQuery);
  const categoryFilterActive = Boolean(selectedCategory);

  // ── Category query ──────────────────────────────────────────────────────────
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const categoryQuery = useQuery<Product[]>({
    queryKey: ["home-category-products", selectedCategory?.name],
    queryFn: () => getProductsByCategory(selectedCategory!.name),
    enabled: !!selectedCategory && isMounted,
    retry: false,
  });
  const categoryProducts = categoryQuery.data ?? EMPTY_PRODUCTS;
  const isCategoryLoading = categoryQuery.isLoading;
  const categoryError = categoryQuery.error as Error | null;
  const hasCategoryError = Boolean(categoryError);

  useEffect(() => {
    if (_hasHydrated && selectedCategory && isMounted) {
      queryClient.invalidateQueries({
        queryKey: ["home-category-products", selectedCategory.name],
      });
    }
  }, [_hasHydrated, isMounted, selectedCategory, queryClient]);

  useEffect(() => {
    if (resetToken === 0) return;
    setSelectedCategory(null);
  }, [resetToken, setSelectedCategory]);

  // ── Scroll restoration ───────────────────────────────────────────────────────
  const scrollRestored = useRef(false);
  useEffect(() => {
    return () => {
      sessionStorage.setItem("home-scroll-y", String(window.scrollY));
    };
  }, []);
  useEffect(() => {
    if (isLoading || scrollRestored.current) return;
    const savedY = sessionStorage.getItem("home-scroll-y");
    if (!savedY) return;
    scrollRestored.current = true;
    sessionStorage.removeItem("home-scroll-y");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(savedY, 10));
      });
    });
  }, [isLoading]);

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

  // ── Recycle-append state (the "infinite mirage" when API is exhausted) ───────
  // When hasNextPage is false, useInfiniteQuery has no more pages to fetch.
  // We restore the old behaviour: watch the last product card with an
  // IntersectionObserver, and when it enters the viewport we shuffle the already-
  // fetched products and append them to a local recycled list, giving the
  // appearance of endless scrolling.
  //
  // For categories we do the same but against categoryVisibleProducts instead.
  //
  // This is completely separate from fetchNextPage — it only activates when the
  // API is exhausted OR a category filter is active (categories never paginate).
  const [recycledProducts, setRecycledProducts] = useState<Product[]>([]);
  const [isAppending, setIsAppending] = useState(false);
  const [categoryVisibleProducts, setCategoryVisibleProducts] = useState<
    Product[]
  >([]);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const recycleObserverActive = useRef(false);

  // Seed recycledProducts with the initial fetched set once API is exhausted
  useEffect(() => {
    if (!hasNextPage && products.length > 0 && recycledProducts.length === 0) {
      setRecycledProducts(products);
    }
  }, [hasNextPage, products, recycledProducts.length]);

  // Keep category visible products in sync
  useEffect(() => {
    if (categoryFilterActive) {
      setCategoryVisibleProducts(categoryProducts);
    } else {
      setCategoryVisibleProducts([]);
    }
  }, [categoryFilterActive, categoryProducts]);

  // IntersectionObserver for recycle-append — only active when:
  //   - API exhausted (!hasNextPage) and not in category mode, OR
  //   - Category mode (categoryFilterActive)
  useEffect(() => {
    // useInfiniteScroll hook handles scrolling while hasNextPage is true
    const shouldObserve = categoryFilterActive
      ? categoryVisibleProducts.length > 0
      : !hasNextPage && recycledProducts.length > 0;

    if (!shouldObserve || recycleObserverActive.current) return;

    const ref = lastItemRef.current;
    if (!ref) return;

    recycleObserverActive.current = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        recycleObserverActive.current = false;

        if (categoryFilterActive) {
          // Append a shuffled copy of category products
          const next = shuffleArray([...categoryProducts]);
          if (next.length === 0) return;
          setIsAppending(true);
          setCategoryVisibleProducts((prev) => [...prev, ...next]);
          setTimeout(() => setIsAppending(false), 0);
        } else {
          // Append a shuffled copy of all fetched products
          const next = shuffleArray([...recycledProducts]);
          if (next.length === 0) return;
          setIsAppending(true);
          setRecycledProducts((prev) => [...prev, ...next]);
          setTimeout(() => setIsAppending(false), 0);
        }
      },
      { rootMargin: "300px", threshold: 0 },
    );
    observer.observe(ref);

    return () => {
      observer.unobserve(ref);
      recycleObserverActive.current = false;
    };
  }, [
    categoryFilterActive,
    categoryProducts,
    categoryVisibleProducts.length,
    hasNextPage,
    recycledProducts,
  ]);

  // ── useInfiniteScroll hook — real API pagination while hasNextPage is true ───
  const [infiniteRef] = useInfiniteScroll({
    loading: isFetchingNextPage,
    hasNextPage: !categoryFilterActive && hasNextPage,
    onLoadMore: () => {
      if (blockInfiniteLoadRef.current || refreshing || isRefetching) return;
      fetchNextPage();
    },
    disabled:
      categoryFilterActive || !hasNextPage || refreshing || isRefetching,
    rootMargin: "300px 0px",
  });

  // ── What to actually render ──────────────────────────────────────────────────
  // - Category active  → categoryVisibleProducts (seeded from API, recycled on scroll)
  // - API not exhausted → products (flat from useInfiniteQuery pages)
  // - API exhausted     → recycledProducts (products + shuffled appends)
  const visibleProducts = categoryFilterActive
    ? categoryVisibleProducts
    : hasNextPage
      ? products
      : recycledProducts;

  const isProductGridLoading =
    isLoading || (categoryFilterActive ? isCategoryLoading : false);

  const categoriesMarginClass = searchActive ? "mt-[1rem]" : "mt-8";

  return (
    <>
      <PullToRefreshHeader />
      <PullToRefreshContainer>
        <div className="w-full">
          {selectedItem && <CartPopup />}

          <div
            suppressHydrationWarning
            className="lg:hidden w-full bg-white z-[9999] shadow-sm px-[20px] h-[90px] flex items-center"
            style={{
              transform: `translateY(-${pull * 0.7}px)`,
              opacity: 1 - Math.min(pull / 150, 1),
              transition: pull === 0 ? "all 0.25s ease" : "none",
            }}
          >
            <SearchBar />
          </div>

          <div className="mt-[0rem] lg:mt-0 px-[20px] lg:px-10">
            {!searchActive && (
              <div className="mx-auto rounded-xl lg:rounded-3xl overflow-hidden mt-6">
                {isLoading ? (
                  <div className="w-full lg:h-[379px] h-[150px] bg-gray-200 animate-pulse rounded-xl lg:rounded-3xl" />
                ) : (
                  <HomeHeroSlider products={products} loading={isLoading} />
                )}
              </div>
            )}

            <div className={categoriesMarginClass}>
              <Categories
                cat="categories"
                onCategorySelect={setSelectedCategory}
                selectedCategoryId={selectedCategory?._id ?? null}
              />
            </div>

            {categoryFilterActive && (
              <div className="mt-6 px-4 lg:px-[30px] flex flex-wrap items-center gap-3 font-poppins">
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm">
                  <span className="text-black/60">Showing</span>
                  <span className="font-medium text-brand_pink capitalize">
                    {selectedCategory?.name}
                  </span>
                  {!isCategoryLoading && (
                    <span className="text-black/50">
                      ({categoryProducts.length})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-black underline underline-offset-4"
                  onClick={() => setSelectedCategory(null)}
                >
                  Show all products
                </button>
              </div>
            )}

            {!isProductGridLoading &&
              (visibleProducts.length === 0 || hasCategoryError) && (
                <div className="col-span-full">
                  <Image
                    src="https://i.pinimg.com/1200x/b4/00/f1/b400f13f56058fc7cd35b778d1953d83.jpg"
                    alt="No results"
                    width={150}
                    height={150}
                    className="mx-auto mt-10"
                  />
                  <p className="text-center text-sm text-gray-500 mt-10">
                    {categoryFilterActive
                      ? hasCategoryError
                        ? `Unable to load products for ${selectedCategory?.name}. Please try again.`
                        : `No products found in ${selectedCategory?.name}.`
                      : "No products are available right now."}
                  </p>
                </div>
              )}

            <div className="mt-8">
              {isProductGridLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="h-[300px] w-full bg-gray-200 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-2 lg:gap-6">
                    {visibleProducts.map((product, index) => (
                      <div
                        key={`${product._id}-${index}`}
                        ref={
                          index === visibleProducts.length - 1
                            ? // When API still has pages: useInfiniteScroll owns the ref
                              // When exhausted or in category mode: our recycle observer owns it
                              !categoryFilterActive && hasNextPage
                              ? infiniteRef
                              : lastItemRef
                            : null
                        }
                      >
                        <ProductItem product={product} index={index} />
                      </div>
                    ))}

                    {/* Skeletons during real API pagination */}
                    {isFetchingNextPage &&
                      [...Array(ITEMS_TO_APPEND)].map((_, i) => (
                        <div key={`fetch-skeleton-${i}`}>
                          <Skeleton />
                        </div>
                      ))}

                    {/* Skeletons during recycle-append */}
                    {isAppending &&
                      [...Array(ITEMS_TO_APPEND)].map((_, i) => (
                        <div key={`append-skeleton-${i}`}>
                          <Skeleton />
                        </div>
                      ))}
                  </div>

                  {/* EndlessScrollLoading spinner — only shown during real pagination */}
                  {!categoryFilterActive && hasNextPage && (
                    <EndlessScrollLoading
                      infiniteRef={infiniteRef}
                      hasNextPage={hasNextPage}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </PullToRefreshContainer>
      <ScrollToTop />
    </>
  );
}
