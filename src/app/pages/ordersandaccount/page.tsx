"use client";
import { useBrowsingHistory } from "@/api/customHooks";
import BrowserHistory from "@/app/components/BrowserHistory";
import { Product } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import MobileAccountLinks from "./components/MobileAccountLinks";
import Profile from "./components/Profile";

export default function OrdersAndAccountPage() {
  const router = useRouter();
  const { getBrowsingHistory } = useBrowsingHistory();
  const [products, setProducts] = useState<Product[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

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

  // Only runs on mobile — prefetch all link destinations and load browsing history
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
    mobileRoutes.forEach((route) => router.prefetch(route));

    getBrowsingHistory("", 10).then((res) => {
      if (res) {
        const browsingHistory = res.browsingHistory.flatMap(
          (item: { products: { product: Product }[] }) =>
            (item.products ?? []).map(
              (product: { product: Product }) => product.product,
            ),
        );
        setProducts(browsingHistory);
      }
      setHistoryLoading(false);
    });
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
