"use client";

import OrderSummaryPage from "../components/ui/OrderSummaryPage";

import Spinner from "@/app/components/Spinner";
import { useCartStore } from "@/lib/stores/cart-store";

export default function CheckoutRoute() {
  // Boolean selector: this route re-renders only when the cart flips between
  // empty and non-empty, not on every cart mutation. Items arrive via
  // persisted-store rehydration, so gate rendering on their presence.
  const hasItems = useCartStore((s) => s.items.length > 0);

  if (!hasItems) return <Spinner />;

  return <OrderSummaryPage />;
}
