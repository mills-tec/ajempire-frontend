"use client";

import { useCartStore } from "@/lib/stores/cart-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const retrySync = useCartStore.getState().retrySync;

    // Retry when connection is restored
    window.addEventListener("online", retrySync);
    // Retry periodically (e.g., every 1 minute)
    const interval = setInterval(retrySync, 60000);

    return () => {
      window.removeEventListener("online", retrySync);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const initWishlist = useWishlistStore.getState().initWishlist;

    initWishlist();
  }, []);

  useEffect(() => {
    const retrySync = useWishlistStore.getState().retrySync;

    // Retry when connection is restored
    window.addEventListener("online", retrySync);
    // Retry periodically (e.g., every 1 minute)
    const interval = setInterval(retrySync, 60000);

    return () => {
      window.removeEventListener("online", retrySync);
      clearInterval(interval);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
