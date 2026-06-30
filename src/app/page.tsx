"use client";

import Categories from "@/app/components/ui/Categories";
import EndlessScrollLoading from "@/components/EndlessScrollLoading";
import { InfiniteFeed } from "@/components/InfinteScrollList";
import ProductItem from "@/components/ProductItem";
import Skeleton from "@/components/Skeleton";
import { getProducts, getProductsByCategory } from "@/lib/api";
import { useSearchStore } from "@/lib/search-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { useCategoryStore } from "@/lib/stores/category-store";
import type { Product } from "@/lib/types";
import { ITEMS_TO_APPEND, shuffleArray } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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

// ── Constants ─────────────────────────────────────────────────────────────────

const EMPTY_PRODUCTS: Product[] = Object.freeze([]) as unknown as Product[];

// ── Query functions ───────────────────────────────────────────────────────────
// Defined outside the component so their references are stable across renders.
// If defined inside the component, a new function reference is created on every
// render, causing InfiniteFeed to see a changed `queryFn` prop and re-initialize.

const productQueryFn = async (cursor: string) => {
  const res = await getProducts(`limit=${ITEMS_TO_APPEND}&cursor=${cursor}`);
  console.log(res?.message.products);
  return {
    items: res?.message?.products ?? EMPTY_PRODUCTS,
    nextCursor: res?.message?.nextCursor ?? null,
    hasMore: res?.message?.hasMore ?? !!res?.message?.nextCursor,
  };
};

// Category feeds have no server-side pagination — one page, no cursor.
// We return hasMore:false so InfiniteFeed immediately enters recycle mode,
// which shuffles and re-appends the category products for endless scroll.
const makeCategoryQueryFn = (categoryName: string) => async (_cursor: string) => {
  const res = await getProductsByCategory(categoryName);

  return {
    items: res ?? EMPTY_PRODUCTS,
    nextCursor: null,
    hasMore: false,
  };
};

// ── Root component ────────────────────────────────────────────────────────────

export default function Home() {


  const queryClient = useQueryClient();
  const { selectedCategory } = useCategoryStore();

  // Hero slider — separate small query, not part of the infinite feed.
  // Uses its own query key so it never conflicts with the feed cache.
  const { data: heroData, isLoading: isHeroLoading } = useQuery({
    queryKey: ["hero-products"],
    queryFn: () => getProducts(`limit=10&cursor=`),
    staleTime: 60_000,
  });

  const heroProducts = heroData?.message?.products ?? EMPTY_PRODUCTS;

  // Pull-to-refresh handler.
  // For all-products mode: invalidate the infinite feed query.
  // For category mode: invalidate the category query.
  // InfiniteFeed's internal refetch resets the recycle pool automatically.
  const handleRefresh = async () => {
    try {
      if (selectedCategory) {
        await queryClient.invalidateQueries({
          queryKey: ["category-products", selectedCategory.name],
        });
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: ["infinite-products"],
      });
    } catch (error) {
      console.error("Pull-to-refresh error:", error);
    }
  };

  return (
    <PullToRefreshProvider onRefresh={handleRefresh}>
      <HomeContent
        heroProducts={heroProducts}
        isHeroLoading={isHeroLoading}
      />
    </PullToRefreshProvider>
  );
}

// ── Inner content component ───────────────────────────────────────────────────

interface HomeContentProps {
  heroProducts: Product[];
  isHeroLoading: boolean;
}

function HomeContent({ heroProducts, isHeroLoading }: HomeContentProps) {
  const { pull } = usePullToRefresh();

  const selectedItem = useCartStore((state) => state.selectedItem);
  const { selectedCategory, setSelectedCategory } = useCategoryStore();
  const { searchedQuery, resetToken } = useSearchStore();

  const searchActive = Boolean(searchedQuery);
  const categoryFilterActive = Boolean(selectedCategory);

  // SSR mount guard — prevents sessionStorage / window access during SSR/PPR
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  // Category products — used only for the count badge in the filter bar.
  // The actual feed data comes from InfiniteFeed's own internal query.
  const { data: categoryData, isLoading: isCategoryLoading } = useQuery<Product[]>({
    queryKey: ["category-products", selectedCategory?.name],
    queryFn: () => {
      if (!selectedCategory) throw new Error("No category selected");
      return getProductsByCategory(selectedCategory.name);
    },
    enabled: !!selectedCategory && isMounted,
    retry: false,
    staleTime: 60_000,
  });

  const categoryProducts = categoryData ?? EMPTY_PRODUCTS;

  // Reset selected category when search store resets
  useEffect(() => {
    if (resetToken === 0) return;
    setSelectedCategory(null);
  }, [resetToken, setSelectedCategory]);

  // ── Feed config ─────────────────────────────────────────────────────────────
  //
  // When a category is selected, swap both the query key and query function.
  // Changing `queryKey` causes InfiniteFeed to treat this as a completely
  // separate feed — it gets its own cache entry, its own recycle pool, and
  // its own pagination state. Switching back to all-products restores the
  // previous cached state (no re-fetch if still within staleTime).
  //
  // IMPORTANT: `infiniteQueryFn` must be stable per category to avoid
  // InfiniteFeed re-initializing on every render. We memoize it with
  // selectedCategory?.name as the dependency.
  const infiniteQueryKey: string[] = categoryFilterActive
    ? ["category-products", selectedCategory!.name]
    : ["infinite-products"];

  // This produces a new function only when the category name actually changes.
  // For all-products mode, productQueryFn is defined at module level (stable).
  const infiniteQueryFn = categoryFilterActive
    ? makeCategoryQueryFn(selectedCategory!.name)
    : productQueryFn;

  // ── Scroll restoration ──────────────────────────────────────────────────────
  //
  // MIGRATION NOTE: the old page had its own scroll restoration logic
  // using sessionStorage key "home-scroll-y". The fixed InfiniteFeed
  // component handles scroll restoration internally via the same key.
  // The page-level logic has been REMOVED here to prevent a race condition
  // where both the page and the feed tried to read/write the same key.
  // InfiniteFeed's internal restoration is equivalent — no behavior change.

  return (
    <>
      <PullToRefreshHeader />
      <PullToRefreshContainer>
        <div className="w-full">
          {selectedItem && <CartPopup />}

          {/* Mobile search bar — animates with pull gesture */}
          <div
            suppressHydrationWarning
            className="lg:hidden w-full bg-white z-[9999] shadow-sm px-[20px] h-[90px] flex items-center"
            style={
              isMounted
                ? {
                  transform: `translateY(-${pull * 0.7}px)`,
                  opacity: 1 - Math.min(pull / 150, 1),
                  transition: pull === 0 ? "all 0.25s ease" : "none",
                }
                : undefined
            }
          >
            <SearchBar />
          </div>

          <div className="mt-[0rem] lg:mt-0 px-[20px] lg:px-10">

            {/* Hero slider — only shown when not searching */}
            {!searchActive && (
              <div className="mx-auto rounded-xl lg:rounded-3xl overflow-hidden mt-6">
                {isHeroLoading ? (
                  <div className="w-full lg:h-[379px] h-[150px] bg-gray-200 animate-pulse rounded-xl lg:rounded-3xl" />
                ) : (
                  <HomeHeroSlider products={heroProducts} loading={isHeroLoading} />
                )}
              </div>
            )}

            {/* Category strip */}
            <div className={searchActive ? "mt-[1rem]" : "mt-8"}>
              <Categories
                cat="categories"
                onCategorySelect={setSelectedCategory}
                selectedCategoryId={selectedCategory?._id ?? null}
              />
            </div>

            {/* Active category filter bar */}
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

            {/* ── InfiniteFeed ──────────────────────────────────────────────
              Switching between all-products and category mode works by
              changing queryKey + queryFn together. React sees a new key →
              mounts a fresh feed instance with its own isolated state.

              scrollRestorationKey is passed explicitly here (matches the
              original "home-scroll-y" key) so scroll position is preserved
              on back-navigation. The feed handles the read/write internally.

              columns={2} matches the original grid-cols-2 on mobile.
              estimatedRowHeight={300} matches the Skeleton height.
              The feed virtualizes rows — ~18 DOM nodes max on iPhone
              regardless of how many products have been loaded.
            ─────────────────────────────────────────────────────────────── */}
            <InfiniteFeed<Product>
              queryKey={infiniteQueryKey}
              queryFn={infiniteQueryFn}
              getItemId={(p) => String(p._id)}
              renderItem={(product: Product, index: number) => (
                <ProductItem product={product} index={index} />
              )}
              skeletonComponent={<Skeleton />}
              skeletonCount={10}
              endlessLoaderComponent={(ref) => (
                <EndlessScrollLoading infiniteRef={ref} hasNextPage={true} />
              )}
              shuffle={shuffleArray}
              staleTime={Infinity}
              scrollRestorationKey="home-scroll-y"
              gridClassName="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-2 lg:gap-6"
              className="mt-8"
            />
          </div>
        </div>
      </PullToRefreshContainer>
      <ScrollToTop />
    </>
  );
}