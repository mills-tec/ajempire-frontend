"use client";

import { useEffect, useState } from "react";

/**
 * False on the server and on the very first client render, true from the
 * first effect onward.
 *
 * Gate anything whose value can differ between the server render and the
 * client's first render — most often state restored from a persisted Zustand
 * store. Those stores rehydrate from localStorage *synchronously* as the
 * module loads, so by the time React hydrates the client already knows things
 * the server's HTML could not, the two renders disagree, and React reports a
 * hydration mismatch.
 *
 * Note that zustand's own `persist.hasHydrated()` does NOT solve this: with
 * synchronous storage it is already true during the first client render, so
 * it never yields a pass that matches the server's output. Only waiting for
 * an effect guarantees that.
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => setHasMounted(true), []);

  return hasMounted;
}
