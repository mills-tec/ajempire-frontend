"use client";
import { useBrowsingHistory } from "@/api/customHooks";
import BrowserHistory from "@/app/components/BrowserHistory";
import Spinner from "@/app/components/Spinner";
import { Product } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MobileAccountLinks from "./components/MobileAccountLinks";
import Profile from "./components/Profile";

export default function OrdersAndAccountPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  // start with spinner showing
  const { getBrowsingHistory } = useBrowsingHistory();
  const [products, setProducts] = useState<Product[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;

    if (pathname === "/pages/ordersandaccount") {
      if (isDesktop) {
        router.replace("/pages/ordersandaccount/orders/all");
        return;
      } else {
        // mobile → just stop loading
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
        return;
      }
    }

    setIsLoading(false);
  }, [pathname, router]);

  useEffect(() => {
    (async () => {
      const res = await getBrowsingHistory("", 10);

      if (!res) {
        setHistoryLoading(false);
        return;
      }

      const browsingHistory = res.browsingHistory.flatMap(
        (item: { products: { product: Product }[] }) =>
          (item.products ?? []).map(
            (product: { product: Product }) => product.product,
          ),
      );

      setProducts(browsingHistory);
      setHistoryLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If loading, show spinner only
  if (isLoading) {
    return <Spinner />;
  }

  // Once loaded or redirected (for mobile)
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
