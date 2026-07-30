
"use client";

import React, { useState, useEffect } from "react";
import SplashScreen from "./SplashScreen";

export default function SplashScreenWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");

    if (hasSeenSplash) {
      setShowSplash(false);
    } else {
      sessionStorage.setItem("hasSeenSplash", "true");
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <>
      {/* SplashScreen is a fixed, full-viewport overlay (z-50) — it doesn't
          need `children` hidden underneath it. Hiding them behind
          display:none used to block the real page from painting (and its
          images from being requested) for the full splash duration on every
          first visit, which is exactly when Lighthouse/CWV measure LCP. */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {children}
    </>
  );
}