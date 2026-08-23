"use client";
import { getBrowsingHistoryPreview } from "@/api/customHooks";
import BrowserHistory from "@/app/components/BrowserHistory";
import { Product } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import MobileAccountLinks from "./components/MobileAccountLinks";
import Profile from "./components/Profile";

export default function OrdersAndAccountPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  // Cached in the app-wide QueryClient (lives above the router, survives
  // remounts/back-navigation) instead of component state — so returning to
  // this page serves the last-known history instantly with no fetch, no
  // skeleton flash, and no <Image> remount-from-empty.
  const { data: products = [], isLoading: historyLoading } = useQuery<Product[]>({
    queryKey: ["browsing-history-preview"],
    queryFn: () => getBrowsingHistoryPreview(10),
    enabled: isMobile === true,
    staleTime: 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });

  // useLayoutEffect fires synchronously before the browser paints — desktop users
  // are redirected immediately with no blank-screen flash
  useLayoutEffect(() => {
    if (window.innerWidth >= 1024) {
      router.replace("/pages/ordersandaccount/orders/all");
    } else {
      setIsMobile(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only runs on mobile — prefetch all link destinations. Deferred to idle
  // time so it doesn't compete with the browsing-history fetch/hydration for
  // network and main-thread time during the critical first-render window.
  useEffect(() => {
    if (!isMobile) return;

    const mobileRoutes = [
      "/pages/ordersandaccount/orders/all",
      "/pages/ordersandaccount/orders/processing",
      "/pages/ordersandaccount/orders/shipping",
      "/pages/ordersandaccount/orders/delivered",
      "/pages/ordersandaccount/returns",
      "/pages/ordersandaccount/address",
      "/pages/ordersandaccount/coupoonsandoffers",
      "/pages/ordersandaccount/orders/reviews",
      "/pages/ordersandaccount/myuseage",
      "/pages/ordersandaccount/wishlist",
      "/pages/ordersandaccount/notifications/all",
      "/pages/ordersandaccount/settings",
      "/pages/ordersandaccount/settings/profile",
      "/pages/support",
    ];

    const prefetchAll = () => mobileRoutes.forEach((route) => router.prefetch(route));

    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(prefetchAll);
      return () => cancelIdleCallback(id);
    }
    const timeoutId = setTimeout(prefetchAll, 1);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  if (!isMobile) return null;

  return (
    <div className="w-full flex flex-col gap-[20px] px-[20px]">
      <div>
        <Profile />
      </div>
      <div>
        <MobileAccountLinks />
      </div>
      <div>
        <BrowserHistory products={products} isLoading={historyLoading} />
      </div>
    </div>
  );
}
