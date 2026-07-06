"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OrderSummaryPage from "../components/ui/OrderSummaryPage";

import Spinner from "@/app/components/Spinner";
import { getBearerToken } from "@/lib/api";
import { useCartStore } from "@/lib/stores/cart-store"; // adjust path

export default function CheckoutRoute() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const getSelectedItems = useCartStore((state) => state.getSelectedItems);

  useEffect(() => {
    const token = getBearerToken();
    if (!token) {
      router.replace("/");
      return;
    }

    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) {
      router.replace("/pages/cart"); // adjust to your cart route
      return;
    }

    setChecking(false);
  }, [router, getSelectedItems]);

  if (checking) return <Spinner />;

  return <OrderSummaryPage />;
}
