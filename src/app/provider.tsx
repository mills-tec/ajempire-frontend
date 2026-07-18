"use client";

import { getBearerToken } from "@/lib/api";
import { useCartStore } from "@/lib/stores/cart-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useEffect, useState } from "react";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ??
  "97080942381-seubabjh0nq15hdv2nhgj0ij4vjafoh5.apps.googleusercontent.com";

// Query keys that are safe to restore from localStorage on page load — low
// volatility, not affected by admin CRUD actions taken in another tab/device.
// Everything else (products, search, feeds) must always be fetched fresh, since
// an admin deleting a product elsewhere has no way to reach into a customer's
// localStorage to invalidate a persisted snapshot.
const PERSISTABLE_QUERY_KEYS = new Set(["categories", "home-banner"]);

// Bump this string whenever the shape of a persisted query changes (or on a
// deploy where you want to force everyone's persisted cache to drop).
const PERSIST_BUSTER = "v1";

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



  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          buster: PERSIST_BUSTER,
          maxAge: 1000 * 60 * 60 * 12, // 12h — persisted snapshots older than this are discarded outright
          dehydrateOptions: {
            shouldDehydrateQuery: (query) =>
              query.state.status === "success" &&
              PERSISTABLE_QUERY_KEYS.has(query.queryKey[0] as string),
          },
        }}
      >
        {children}
      </PersistQueryClientProvider>
    </GoogleOAuthProvider>
  );
}
