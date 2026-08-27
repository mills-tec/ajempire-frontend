
"use client";

import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import SplashScreen from "./SplashScreen";

export default function SplashScreenWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.includes("admin");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Don't mark the branded shopper splash as "seen" off the back of an
    // admin pageview — someone landing on /admin-login first should still
    // get their real first-visit splash when they later reach the storefront
    // in the same tab. Depends on isAdminRoute rather than running once so
    // that crossing between admin and shop routes re-evaluates this.
    // if (isAdminRoute) return;

    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");

    if (hasSeenSplash) {
      setShowSplash(false);
    } else {
      sessionStorage.setItem("hasSeenSplash", "true");
    }
  }, [isAdminRoute]);

  // Content underneath is no longer display:none'd away (see below), so
  // without this it's scrollable/interactive behind the overlay while the
  // splash is up.


  const handleSplashComplete = () => {
    setShowSplash(false);
  };


  return (
    <>
      {/* SplashScreen is a fixed, full-viewport overlay (z-[99999]) — it
          doesn't need `children` hidden underneath it. Hiding them behind
          display:none used to block the real page from painting (and its
          images from being requested) for the full splash duration on every
          first visit, which is exactly when Lighthouse/CWV measure LCP. */}
      {!isAdminRoute && (
        <SplashScreen onComplete={handleSplashComplete} showSplash={showSplash} />
      )}
      {children}
    </>
  );
}