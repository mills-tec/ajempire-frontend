"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";

interface PWAInstallPromptProps {
  className?: string;
}

const FIRST_PROMPT_DELAY = 15 * 1000;
const REPROMPT_DELAY = 45 * 1000;
const MIN_INTERACTIONS = 3;
const REPROMPT_INTERACTIONS = 5;
const SUCCESS_DISPLAY_DURATION = 3500; // auto-hide success after 3.5s

const STORAGE_KEYS = {
  DISMISSED_AT: "pwa_prompt_dismissed_at",
  PROMPT_COUNT: "pwa_prompt_count",
  INSTALLED: "pwa_installed",
} as const;

const MESSAGES = [
  {
    title: "Shop Faster on AJ Empire 🛍️",
    subtitle: "Add to your home screen for instant access & exclusive deals",
  },
  {
    title: "Never Miss a Deal Again ✨",
    subtitle:
      "Get lightning-fast access to AJ Empire right from your home screen",
  },
];

type PromptState = "idle" | "prompt" | "success";

export default function PWAInstallPrompt({
  className = "",
}: PWAInstallPromptProps) {
  const [state, setState] = useState<PromptState>("idle");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [userInteractions, setUserInteractions] = useState(0);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<"android" | "ios" | "desktop">(
    "desktop",
  );
  const [messageIndex, setMessageIndex] = useState(0);
  const hasTriggeredRef = useRef(false);
  const dismissedAtRef = useRef<number | null>(null);

  // Detect platform
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    if (isIOS) setPlatform("ios");
    else if (isAndroid) setPlatform("android");
    else setPlatform("desktop");
  }, []);

  // Detect if already installed
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone =
      (window.navigator as { standalone?: boolean }).standalone === true;
    const alreadyInstalled =
      localStorage.getItem(STORAGE_KEYS.INSTALLED) === "true";

    if (standalone || iosStandalone) {
      setIsInstalled(true);

      // iOS: if this is first launch in standalone mode — show success briefly
      if (!alreadyInstalled) {
        localStorage.setItem(STORAGE_KEYS.INSTALLED, "true");
        // Small delay so app finishes rendering first
        setTimeout(() => setState("success"), 800);
        setTimeout(() => setState("idle"), 800 + SUCCESS_DISPLAY_DURATION);
      }
    }
  }, []);

  // Load stored state
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.DISMISSED_AT);
    if (stored) dismissedAtRef.current = parseInt(stored);
    const count = localStorage.getItem(STORAGE_KEYS.PROMPT_COUNT);
    if (count) setMessageIndex(parseInt(count) % MESSAGES.length);
  }, []);

  // Track user interactions
  useEffect(() => {
    const handler = () => setUserInteractions((p) => p + 1);
    window.addEventListener("click", handler);
    window.addEventListener("scroll", handler);
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("scroll", handler);
    };
  }, []);

  // Capture Android/Chrome install event
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Listen for appinstalled event (Android — fires after successful install)
  useEffect(() => {
    const handler = () => {
      localStorage.setItem(STORAGE_KEYS.INSTALLED, "true");
      setIsInstalled(true);
      setState("success");
      setTimeout(() => setState("idle"), SUCCESS_DISPLAY_DURATION);
    };
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  // Trigger prompt logic
  useEffect(() => {
    if (platform === "desktop") return;
    if (isInstalled) return;
    if (state !== "idle") return;

    const now = Date.now();
    const dismissedAt = dismissedAtRef.current;
    const isFirstTime = !dismissedAt;
    const enoughTimePassed = dismissedAt
      ? now - dismissedAt >= REPROMPT_DELAY
      : false;
    const enoughInteractions = isFirstTime
      ? userInteractions >= MIN_INTERACTIONS
      : userInteractions >= REPROMPT_INTERACTIONS;

    if (!enoughInteractions) return;
    if (!isFirstTime && !enoughTimePassed) return;
    if (hasTriggeredRef.current) return;

    const timer = setTimeout(() => {
      hasTriggeredRef.current = true;
      setState("prompt");
    }, FIRST_PROMPT_DELAY);

    return () => clearTimeout(timer);
  }, [userInteractions, isInstalled, platform, state]);

  const handleDismiss = useCallback(() => {
    const now = Date.now();
    dismissedAtRef.current = now;
    localStorage.setItem(STORAGE_KEYS.DISMISSED_AT, now.toString());

    const nextCount = (messageIndex + 1) % MESSAGES.length;
    localStorage.setItem(STORAGE_KEYS.PROMPT_COUNT, nextCount.toString());
    setMessageIndex(nextCount);

    hasTriggeredRef.current = false;
    setState("idle");
  }, [messageIndex]);

  const handleInstall = useCallback(async () => {
    if (platform === "ios") {
      // iOS can't auto-install — just dismiss, standalone detection handles success
      handleDismiss();
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      setDeferredPrompt(null);

      if (result.outcome === "accepted") {
        // appinstalled event will fire and show success
        // but set as fallback too
        localStorage.setItem(STORAGE_KEYS.INSTALLED, "true");
        setIsInstalled(true);
        setState("success");
        setTimeout(() => setState("idle"), SUCCESS_DISPLAY_DURATION);
      } else {
        // User declined — treat as dismiss
        handleDismiss();
      }
    }
  }, [deferredPrompt, platform, handleDismiss]);

  // Don't render on desktop or if fully idle after install
  if (platform === "desktop") return null;
  if (isInstalled && state === "idle") return null;
  if (!isInstalled && state === "idle") return null;

  const content = MESSAGES[messageIndex];
  const isIOS = platform === "ios";
  const isSuccess = state === "success";

  return (
    <AnimatePresence>
      {(state === "prompt" || state === "success") && (
        <motion.div
          key={state} // re-animate when switching prompt → success
          initial={{ opacity: 0, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ type: "spring", stiffness: 280, damping: 25 }}
          className={`fixed top-4 left-2 right-2 z-50 ${className}`}
        >
          {isSuccess ? (
            /* ── SUCCESS BANNER ── */
            <div className="backdrop-blur-md bg-white/95 shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 border border-green-100">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={22} className="text-green-500" />
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="font-semibold text-gray-900 text-sm">
                  Successfully Added! 🎉
                </span>
                <span className="text-gray-500 text-xs">
                  AJ Empire is now on your home screen
                </span>
              </div>
            </div>
          ) : (
            /* ── INSTALL PROMPT ── */
            <div className="backdrop-blur-md bg-white/90 shadow-xl rounded-2xl px-4 py-3 flex items-center justify-between gap-4 border border-white/40">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  <img
                    src="/promptlogo.png"
                    alt="AJ Empire"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="font-semibold text-gray-900 text-sm truncate">
                    {content.title}
                  </span>
                  <span className="text-gray-500 text-xs leading-snug line-clamp-2">
                    {isIOS
                      ? 'Tap Share → "Add to Home Screen" for instant access'
                      : content.subtitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleInstall}
                  className="bg-[#FF008C] text-white text-xs px-4 py-2 rounded-full font-semibold shadow-md hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                >
                  {isIOS ? "Got it" : "Install"}
                </button>
                <button
                  onClick={handleDismiss}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition flex-shrink-0"
                >
                  <X size={14} className="text-gray-500" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  }
}
