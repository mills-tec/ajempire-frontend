// "use client";

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { X, CheckCircle2 } from "lucide-react";

// interface PWAInstallPromptProps {
//   className?: string;
// }

// const FIRST_PROMPT_DELAY = 15 * 1000;
// const REPROMPT_DELAY = 45 * 1000;
// const MIN_INTERACTIONS = 3;
// const REPROMPT_INTERACTIONS = 5;
// const SUCCESS_DISPLAY_DURATION = 3500; // auto-hide success after 3.5s

// const STORAGE_KEYS = {
//   DISMISSED_AT: "pwa_prompt_dismissed_at",
//   PROMPT_COUNT: "pwa_prompt_count",
//   INSTALLED: "pwa_installed",
// } as const;

// const MESSAGES = [
//   {
//     title: "Shop Faster on AJ Empire 🛍️",
//     subtitle: "Add to your home screen for instant access & exclusive deals",
//   },
//   {
//     title: "Never Miss a Deal Again ✨",
//     subtitle:
//       "Get lightning-fast access to AJ Empire right from your home screen",
//   },
// ];

// type PromptState = "idle" | "prompt" | "success";

// export default function PWAInstallPrompt({
//   className = "",
// }: PWAInstallPromptProps) {
//   const [state, setState] = useState<PromptState>("idle");
//   const [deferredPrompt, setDeferredPrompt] =
//     useState<BeforeInstallPromptEvent | null>(null);
//   const [userInteractions, setUserInteractions] = useState(0);
//   const [isInstalled, setIsInstalled] = useState(false);
//   const [platform, setPlatform] = useState<"android" | "ios" | "desktop">(
//     "desktop",
//   );
//   const [messageIndex, setMessageIndex] = useState(0);
//   const hasTriggeredRef = useRef(false);
//   const dismissedAtRef = useRef<number | null>(null);

//   // Detect platform
//   useEffect(() => {
//     const ua = navigator.userAgent.toLowerCase();
//     const isIOS = /iphone|ipad|ipod/.test(ua);
//     const isAndroid = /android/.test(ua);
//     if (isIOS) setPlatform("ios");
//     else if (isAndroid) setPlatform("android");
//     else setPlatform("desktop");
//   }, []);

//   // Detect if already installed
//   useEffect(() => {
//     const standalone = window.matchMedia("(display-mode: standalone)").matches;
//     const iosStandalone =
//       (window.navigator as { standalone?: boolean }).standalone === true;
//     const alreadyInstalled =
//       localStorage.getItem(STORAGE_KEYS.INSTALLED) === "true";

//     if (standalone || iosStandalone) {
//       setIsInstalled(true);

//       // iOS: if this is first launch in standalone mode — show success briefly
//       if (!alreadyInstalled) {
//         localStorage.setItem(STORAGE_KEYS.INSTALLED, "true");
//         // Small delay so app finishes rendering first
//         setTimeout(() => setState("success"), 800);
//         setTimeout(() => setState("idle"), 800 + SUCCESS_DISPLAY_DURATION);
//       }
//     }
//   }, []);

//   // Load stored state
//   useEffect(() => {
//     const stored = localStorage.getItem(STORAGE_KEYS.DISMISSED_AT);
//     if (stored) dismissedAtRef.current = parseInt(stored);
//     const count = localStorage.getItem(STORAGE_KEYS.PROMPT_COUNT);
//     if (count) setMessageIndex(parseInt(count) % MESSAGES.length);
//   }, []);

//   // Track user interactions
//   useEffect(() => {
//     const handler = () => setUserInteractions((p) => p + 1);
//     window.addEventListener("click", handler);
//     window.addEventListener("scroll", handler);
//     return () => {
//       window.removeEventListener("click", handler);
//       window.removeEventListener("scroll", handler);
//     };
//   }, []);

//   // Capture Android/Chrome install event
//   useEffect(() => {
//     const handler = (e: Event) => {
//       e.preventDefault();
//       setDeferredPrompt(e as BeforeInstallPromptEvent);
//     };
//     window.addEventListener("beforeinstallprompt", handler);
//     return () => window.removeEventListener("beforeinstallprompt", handler);
//   }, []);

//   // Listen for appinstalled event (Android — fires after successful install)
//   useEffect(() => {
//     const handler = () => {
//       localStorage.setItem(STORAGE_KEYS.INSTALLED, "true");
//       setIsInstalled(true);
//       setState("success");
//       setTimeout(() => setState("idle"), SUCCESS_DISPLAY_DURATION);
//     };
//     window.addEventListener("appinstalled", handler);
//     return () => window.removeEventListener("appinstalled", handler);
//   }, []);

//   // Trigger prompt logic
//   useEffect(() => {
//     if (platform === "desktop") return;
//     if (isInstalled) return;
//     if (state !== "idle") return;

//     const now = Date.now();
//     const dismissedAt = dismissedAtRef.current;
//     const isFirstTime = !dismissedAt;
//     const enoughTimePassed = dismissedAt
//       ? now - dismissedAt >= REPROMPT_DELAY
//       : false;
//     const enoughInteractions = isFirstTime
//       ? userInteractions >= MIN_INTERACTIONS
//       : userInteractions >= REPROMPT_INTERACTIONS;

//     if (!enoughInteractions) return;
//     if (!isFirstTime && !enoughTimePassed) return;
//     if (hasTriggeredRef.current) return;

//     const timer = setTimeout(() => {
//       hasTriggeredRef.current = true;
//       setState("prompt");
//     }, FIRST_PROMPT_DELAY);

//     return () => clearTimeout(timer);
//   }, [userInteractions, isInstalled, platform, state]);

//   const handleDismiss = useCallback(() => {
//     const now = Date.now();
//     dismissedAtRef.current = now;
//     localStorage.setItem(STORAGE_KEYS.DISMISSED_AT, now.toString());

//     const nextCount = (messageIndex + 1) % MESSAGES.length;
//     localStorage.setItem(STORAGE_KEYS.PROMPT_COUNT, nextCount.toString());
//     setMessageIndex(nextCount);

//     hasTriggeredRef.current = false;
//     setState("idle");
//   }, [messageIndex]);

//   const handleInstall = useCallback(async () => {
//     if (platform === "ios") {
//       // iOS can't auto-install — just dismiss, standalone detection handles success
//       handleDismiss();
//       return;
//     }

//     if (deferredPrompt) {
//       deferredPrompt.prompt();
//       const result = await deferredPrompt.userChoice;
//       setDeferredPrompt(null);

//       if (result.outcome === "accepted") {
//         // appinstalled event will fire and show success
//         // but set as fallback too
//         localStorage.setItem(STORAGE_KEYS.INSTALLED, "true");
//         setIsInstalled(true);
//         setState("success");
//         setTimeout(() => setState("idle"), SUCCESS_DISPLAY_DURATION);
//       } else {
//         // User declined — treat as dismiss
//         handleDismiss();
//       }
//     }
//   }, [deferredPrompt, platform, handleDismiss]);

//   // Don't render on desktop or if fully idle after install
//   if (platform === "desktop") return null;
//   if (isInstalled && state === "idle") return null;
//   if (!isInstalled && state === "idle") return null;

//   const content = MESSAGES[messageIndex];
//   const isIOS = platform === "ios";
//   const isSuccess = state === "success";

//   return (
//     <AnimatePresence>
//       {(state === "prompt" || state === "success") && (
//         <motion.div
//           key={state} // re-animate when switching prompt → success
//           initial={{ opacity: 0, y: -80 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -80 }}
//           transition={{ type: "spring", stiffness: 280, damping: 25 }}
//           className={`fixed top-4 left-2 right-2 z-50 ${className}`}
//         >
//           {isSuccess ? (
//             /* ── SUCCESS BANNER ── */
//             <div className="backdrop-blur-md bg-white/95 shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 border border-green-100">
//               <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
//                 <CheckCircle2 size={22} className="text-green-500" />
//               </div>
//               <div className="flex flex-col leading-tight min-w-0">
//                 <span className="font-semibold text-gray-900 text-sm">
//                   Successfully Added! 🎉
//                 </span>
//                 <span className="text-gray-500 text-xs">
//                   AJ Empire is now on your home screen
//                 </span>
//               </div>
//             </div>
//           ) : (
//             /* ── INSTALL PROMPT ── */
//             <div className="backdrop-blur-md bg-white/90 shadow-xl rounded-2xl px-4 py-3 flex items-center justify-between gap-4 border border-white/40">
//               <div className="flex items-center gap-3 flex-1 min-w-0">
//                 <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
//                   <img
//                     src="/promptlogo.png"
//                     alt="AJ Empire"
//                     className="w-full h-full object-contain"
//                   />
//                 </div>
//                 <div className="flex flex-col leading-tight min-w-0">
//                   <span className="font-semibold text-gray-900 text-sm truncate">
//                     {content.title}
//                   </span>
//                   <span className="text-gray-500 text-xs leading-snug line-clamp-2">
//                     {isIOS
//                       ? 'Tap Share → "Add to Home Screen" for instant access'
//                       : content.subtitle}
//                   </span>
//                 </div>
//               </div>

//               <div className="flex items-center gap-2 flex-shrink-0">
//                 <button
//                   onClick={handleInstall}
//                   className="bg-[#FF008C] text-white text-xs px-4 py-2 rounded-full font-semibold shadow-md hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
//                 >
//                   {isIOS ? "Got it" : "Install"}
//                 </button>
//                 <button
//                   onClick={handleDismiss}
//                   className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition flex-shrink-0"
//                 >
//                   <X size={14} className="text-gray-500" />
//                 </button>
//               </div>
//             </div>
//           )}
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }

// declare global {
//   interface BeforeInstallPromptEvent extends Event {
//     prompt(): Promise<void>;
//     userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
//   }
// }
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  }
  interface Navigator {
    standalone?: boolean;
  }
}

interface PWAInstallPromptProps {
  /** Optional extra className on the root wrapper */
  className?: string;
  /**
   * The deep-link / start_url of your PWA.
   * Used in the "Open in App" banner so installed users are routed to the PWA.
   * Defaults to window.location.origin + "/".
   */
  appStartUrl?: string;
  /** Brand accent colour for the CTA button. Defaults to AJ Empire pink. */
  accentColor?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const _FIRST_PROMPT_DELAY    = 5_000;    // ms before first prompt appears
const REPROMPT_DELAY        = 45_000;   // ms user must wait before seeing prompt again
const REPROMPT_INTERACTIONS = 3;        // interactions required before re-prompting after dismiss
const SUCCESS_DURATION      = 3_500;    // ms success banner is visible
const OPEN_APP_SNOOZE       = 24 * 60 * 60_000; // 24h before "Open in App" re-shows

const STORAGE = {
  DISMISSED_AT:    "pwa_prompt_dismissed_at",
  PROMPT_COUNT:    "pwa_prompt_count",
  INSTALLED:       "pwa_installed",
  OPEN_APP_SNOOZED:"pwa_open_app_snoozed_at",
} as const;

const MESSAGES = [
  {
    title:    "Shop Faster on AJ Empire 🛍️",
    subtitle: "Add to your home screen for instant access & exclusive deals",
  },
  {
    title:    "Never Miss a Deal Again ✨",
    subtitle: "Lightning-fast access to AJ Empire right from your home screen",
  },
];

type PromptState = "idle" | "prompt" | "success" | "open-app";

// iOS share arrow
const ShareArrow = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline", verticalAlign: "middle" }}
  >
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function getStoredNumber(key: string): number | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(key);
  return v ? parseInt(v, 10) : null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PWAInstallPrompt({
  className    = "",
  appStartUrl,
  accentColor  = "#FF008C",
}: PWAInstallPromptProps) {
  const [state,          setState]          = useState<PromptState>("idle");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled,    setIsInstalled]    = useState(false);
  const [platform,       setPlatform]       = useState<"android" | "ios" | "desktop">("desktop");
  const [messageIndex,   setMessageIndex]   = useState(0);
  // repromptGate flips true once the user hits REPROMPT_INTERACTIONS after a dismiss.
  // Using a gate state (instead of raw interaction count) means the countdown effect
  // only re-runs once when the threshold is crossed, not on every scroll/click.
  const [repromptGate,   setRepromptGate]   = useState(false);

  const hasTriggeredRef  = useRef(false);
  const dismissedAtRef   = useRef<number | null>(null);
  const interactionsRef  = useRef(0);  // raw count — ref avoids re-renders on every event
  const startUrl         = appStartUrl ?? (typeof window !== "undefined" ? `${window.location.origin}/` : "/");

  // ── Platform detection ──────────────────────────────────────────────────────
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua))  setPlatform("ios");
    else if (/android/.test(ua))       setPlatform("android");
    else                               setPlatform("desktop");
  }, []);

  // ── Installed state bootstrap ───────────────────────────────────────────────
  useEffect(() => {
    const standalone      = isStandalone();
    const flaggedInstalled = localStorage.getItem(STORAGE.INSTALLED) === "true";

    if (standalone) {
      // Running inside the PWA shell — never show install prompts
      setIsInstalled(true);

      if (!flaggedInstalled) {
        // Very first launch as a PWA → celebrate
        localStorage.setItem(STORAGE.INSTALLED, "true");
        setTimeout(() => setState("success"),         800);
        setTimeout(() => setState("idle"),  800 + SUCCESS_DURATION);
      }
      return;
    }

    // Not in standalone → user is on the website in a browser.
    // If we know they previously installed, show the "Open in App" banner.
    if (flaggedInstalled) {
      const snoozedAt = getStoredNumber(STORAGE.OPEN_APP_SNOOZED);
      const snoozed   = snoozedAt ? Date.now() - snoozedAt < OPEN_APP_SNOOZE : false;
      if (!snoozed) {
        // Small delay so the page finishes rendering
        setTimeout(() => setState("open-app"), 1_200);
      }
    }
  }, []);

  // ── Load persisted prompt state ─────────────────────────────────────────────
  useEffect(() => {
    const stored = getStoredNumber(STORAGE.DISMISSED_AT);
    if (stored) dismissedAtRef.current = stored;

    const count = getStoredNumber(STORAGE.PROMPT_COUNT);
    if (count !== null) setMessageIndex(count % MESSAGES.length);
  }, []);

  // ── Interaction tracking (ref only — no re-renders per event) ─────────────
  useEffect(() => {
    const inc = () => {
      interactionsRef.current++;
      if (
        !repromptGate &&
        dismissedAtRef.current &&
        interactionsRef.current >= REPROMPT_INTERACTIONS
      ) {
        setRepromptGate(true);
      }
    };
    window.addEventListener("click",  inc);
    window.addEventListener("scroll", inc);
    return () => {
      window.removeEventListener("click",  inc);
      window.removeEventListener("scroll", inc);
    };
  }, [repromptGate]);

  // ── Capture Android install event ───────────────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // ── Listen for successful install (Android) ─────────────────────────────────
  useEffect(() => {
    const handler = () => {
      localStorage.setItem(STORAGE.INSTALLED, "true");
      setIsInstalled(true);
      setState("success");
      setTimeout(() => setState("idle"), SUCCESS_DURATION);
    };
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  // ── 5-second countdown ──────────────────────────────────────────────────────
  useEffect(() => {
    if (platform === "desktop")           return;
    if (isInstalled)                      return;
    if (state !== "idle")                 return;
    if (hasTriggeredRef.current)          return;
    if (platform === "android" && !deferredPrompt) return;

    const dismissedAt = dismissedAtRef.current;
    if (dismissedAt) {
      const enoughTime = Date.now() - dismissedAt >= REPROMPT_DELAY;
      if (!enoughTime || !repromptGate) return;
    }
    let CHECK_INTERVAL = 1000;
    const timer = setTimeout(() => {
      hasTriggeredRef.current = true;
      setState("prompt");
    }, CHECK_INTERVAL);

    return () => clearTimeout(timer);
  }, [platform, isInstalled, state, repromptGate, deferredPrompt]);

  // ── Dismiss install prompt ──────────────────────────────────────────────────
  const handleDismiss = useCallback(() => {
    const now = Date.now();
    dismissedAtRef.current = now;
    localStorage.setItem(STORAGE.DISMISSED_AT, now.toString());

    const next = (messageIndex + 1) % MESSAGES.length;
    localStorage.setItem(STORAGE.PROMPT_COUNT, next.toString());
    setMessageIndex(next);

    hasTriggeredRef.current = false;
    interactionsRef.current = 0;
    setRepromptGate(false);
    setState("idle");
  }, [messageIndex]);

  // ── Dismiss "Open in App" banner ────────────────────────────────────────────
  const handleSnoozeOpenApp = useCallback(() => {
    localStorage.setItem(STORAGE.OPEN_APP_SNOOZED, Date.now().toString());
    setState("idle");
  }, []);

  // ── Open the installed PWA ──────────────────────────────────────────────────
  const handleOpenApp = useCallback(() => {
    // Navigate to the start URL — the OS will open the installed PWA
    window.location.href = startUrl;
  }, [startUrl]);

  // ── Android install tap ─────────────────────────────────────────────────────
  const handleInstall = useCallback(async () => {
    if (platform === "ios") {
      hasTriggeredRef.current = false;
      setState("idle");
      return;
    }

    if (!deferredPrompt) return; // guard — shouldn't be reachable but keeps TS happy

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    if (outcome === "accepted") {
      localStorage.setItem(STORAGE.INSTALLED, "true");
      setIsInstalled(true);
      setState("success");
      setTimeout(() => setState("idle"), SUCCESS_DURATION);
    } else {
      handleDismiss();
    }
  }, [deferredPrompt, platform, handleDismiss]);

  // ── Render guards ───────────────────────────────────────────────────────────
  if (platform === "desktop")              return null;
  if (isInstalled && state === "idle")     return null;
  if (!isInstalled && state === "idle")    return null;

  const msg    = MESSAGES[messageIndex];
  const isIOS  = platform === "ios";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence mode="wait">
      {state === "open-app" && (
        /* ── "OPEN IN APP" BANNER ─────────────────────────────────────────── */
        <motion.div
          key="open-app"
          initial={{ opacity: 0, y: -72 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -72 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className={`fixed top-4 left-2 right-2 z-50 ${className}`}
        >
          <div
            style={{ background: accentColor }}
            className="rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-2xl"
          >
            {/* App icon */}
            <div className="w-9 h-9 rounded-xl bg-white/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/promptlogo.png"
                alt="AJ Empire"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight truncate">
                AJ Empire App is Installed!
              </p>
              <p className="text-white/80 text-xs mt-0.5 leading-snug">
                Get the full experience — faster, smoother, offline-ready.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={handleOpenApp}
              className="bg-white text-sm font-bold px-4 py-2 rounded-full flex-shrink-0 hover:scale-105 active:scale-95 transition-transform"
              style={{ color: accentColor }}
            >
              Open App
            </button>

            {/* Dismiss */}
            <button
              onClick={handleSnoozeOpenApp}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition flex-shrink-0"
            >
              <X size={13} className="text-white" />
            </button>
          </div>
        </motion.div>
      )}

      {state === "success" && (
        /* ── SUCCESS BANNER ───────────────────────────────────────────────── */
        <motion.div
          key="success"
          initial={{ opacity: 0, y: -72 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -72 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className={`fixed top-4 left-2 right-2 z-50 ${className}`}
        >
          <div className="backdrop-blur-md bg-white/95 shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 border border-green-100">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={22} className="text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">
                Successfully Added! 🎉
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                AJ Empire is now on your home screen
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {state === "prompt" && (
        /* ── INSTALL PROMPT ───────────────────────────────────────────────── */
        <motion.div
          key="prompt"
          initial={{ opacity: 0, y: -72 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -72 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className={`fixed top-4 left-2 right-2 z-50 ${className}`}
        >
          <div className="backdrop-blur-md bg-white/95 shadow-xl rounded-2xl px-4 py-3 border border-white/40">
            {/* Main row */}
            <div className="flex items-center gap-3">
              {/* App icon */}
              <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/promptlogo.png"
                  alt="AJ Empire"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {msg.title}
                </p>
                <p className="text-gray-500 text-xs leading-snug mt-0.5 line-clamp-2">
                  {isIOS ? (
                    <>
                      Tap{" "}
                      <span className="inline-flex items-center gap-0.5 font-medium text-gray-700">
                        <ShareArrow /> Share
                      </span>
                      {" "}then{" "}
                      <span className="font-medium text-gray-700">
                        &quot;Add to Home Screen&quot;
                      </span>
                    </>
                  ) : (
                    msg.subtitle
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleInstall}
                  style={{ background: accentColor }}
                  className="text-white text-xs px-4 py-2 rounded-full font-semibold shadow-md hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                >
                  {isIOS ? "Got it" : "Install"}
                </button>
                <button
                  onClick={handleDismiss}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
                >
                  <X size={14} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* iOS — visual step guide */}
            {isIOS && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-4">
                {[
                  { icon: "↑", label: "Tap Share" },
                  { icon: "→", label: "" },
                  { icon: "+", label: "Add to Home Screen" },
                  { icon: "→", label: "" },
                  { icon: "✓", label: "Done!" },
                ].map((step, i) =>
                  step.label ? (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: `${accentColor}18`, color: accentColor }}
                      >
                        {step.icon}
                      </div>
                      <span className="text-gray-400 text-[10px] text-center leading-tight max-w-[52px]">
                        {step.label}
                      </span>
                    </div>
                  ) : (
                    <span key={i} className="text-gray-300 text-xs mb-3">›</span>
                  )
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}