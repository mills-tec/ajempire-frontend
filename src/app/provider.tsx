"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useState } from "react";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ??
  "97080942381-seubabjh0nq15hdv2nhgj0ij4vjafoh5.apps.googleusercontent.com";

// Query keys that are safe to restore from localStorage on page load — low
// volatility, not affected by admin CRUD actions taken in another tab/device.
// Everything else (products, search, feeds) must always be fetched fresh, since
// an admin deleting a product elsewhere has no way to reach into a customer's
// localStorage to invalidate a persisted snapshot.
const PERSISTABLE_QUERY_KEYS = new Set(["home-banner"]);

// Bump this string whenever the shape of a persisted query changes (or on a
// deploy where you want to force everyone's persisted cache to drop).
const PERSIST_BUSTER = "v1";

// Single staleTime for all catalog/browse data (products, categories,
// banners, feeds) — the one knob to turn if data feels stale or the
// backend is getting hit too often. Short enough that an admin edit
// (product, category, banner) shows up on the customer side the next time
// that query's component mounts or the tab regains focus, without
// refetching on literally every render. Individual queries should only
// deviate from this when they have a genuinely different freshness need
// (e.g. Gallery's one-time seed query, which intentionally never refetches)
// — not as an arbitrary per-page choice.
export const DEFAULT_STALE_TIME = 30 * 1000; // 30s

export function Providers({ children }: { children: React.ReactNode }) {



  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: DEFAULT_STALE_TIME,
            refetchOnMount: true,
            refetchOnWindowFocus: true
          },
        },
      }),
  );

  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    }),
  );







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
