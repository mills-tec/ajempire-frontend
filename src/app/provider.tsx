"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useCartStore } from "@/lib/stores/cart-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useState, useEffect } from "react";
import { getBearerToken } from "@/lib/api";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ??
  "97080942381-seubabjh0nq15hdv2nhgj0ij4vjafoh5.apps.googleusercontent.com";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 mins — adjust per query if needed
          },
        },
      }),
  );

  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    }),
  );

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
    if (!getBearerToken()) return;
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
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        {children}
      </PersistQueryClientProvider>
    </GoogleOAuthProvider>
  );
}
