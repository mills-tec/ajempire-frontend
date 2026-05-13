"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";

interface PWAInstallPromptProps {
  className?: string;
}

const FIRST_PROMPT_DELAY = 15 * 1000;
const REPROMPT_DELAY = 45 * 1000;
const MIN_INTERACTIONS = 3;
const REPROMPT_INTERACTIONS = 5;
const SUCCESS_DISPLAY_DURATION = 3500;
const CHECK_INTERVAL = 2000; // poll every 2s instead of reacting to every event

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
    subtitle: "Get lightning-fast access to AJ Empire right from your home screen",
  },
];

type PromptState = "idle" | "prompt" | "success";

export default function PWAInstallPrompt({ className = "" }: PWAInstallPromptProps) {
  const [state, setState] = useState<PromptState>("idle");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<"android" | "ios" | "desktop">("desktop");
  const [messageIndex, setMessageIndex] = useState(0);

  // Refs — changes here don't trigger re-renders
  const hasTriggeredRef = useRef(false);
  const dismissedAtRef = useRef<number | null>(null);
  const interactionsRef = useRef(0);         // ← was useState, now a ref
  const firstInteractionTimeRef = useRef<number | null>(null);
  const stateRef = useRef<PromptState>("idle");

  // Keep stateRef in sync so the interval closure always sees fresh state
  useEffect(() => { stateRef.current = state; }, [state]);

  // Detect platform
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setPlatform("ios");
    else if (/android/.test(ua)) setPlatform("android");
    else setPlatform("desktop");
  }, []);

  // Detect if already installed
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone = (window.navigator as { standalone?: boolean }).standalone === true;
    const alreadyInstalled = localStorage.getItem(STORAGE_KEYS.INSTALLED) === "true";

    if (standalone || iosStandalone) {
      setIsInstalled(true);
      if (!alreadyInstalled) {
        localStorage.setItem(STORAGE_KEYS.INSTALLED, "true");
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

  // Track interactions — write to ref only, no setState
  useEffect(() => {
    const handler = () => {
      interactionsRef.current += 1;
      if (!firstInteractionTimeRef.current) {
        firstInteractionTimeRef.current = Date.now();
      }
    };
    window.addEventListener("click", handler, { passive: true });
    window.addEventListener("scroll", handler, { passive: true });
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("scroll", handler);
    };
  }, []); // ← empty deps: registers once, never re-registers

  // Capture Android/Chrome install event
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // appinstalled event
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

  // Polling interval — checks trigger conditions without reacting to every interaction
  useEffect(() => {
    if (platform === "desktop") return;

    const interval = setInterval(() => {
      if (isInstalled) return;
      if (stateRef.current !== "idle") return;
      if (hasTriggeredRef.current) return;

      const now = Date.now();
      const interactions = interactionsRef.current;
      const dismissedAt = dismissedAtRef.current;
      const isFirstTime = !dismissedAt;

      const enoughInteractions = isFirstTime
        ? interactions >= MIN_INTERACTIONS
        : interactions >= REPROMPT_INTERACTIONS;

      if (!enoughInteractions) return;

      const enoughTimePassed = isFirstTime
        ? (firstInteractionTimeRef.current !== null &&
           now - firstInteractionTimeRef.current >= FIRST_PROMPT_DELAY)
        : now - dismissedAt! >= REPROMPT_DELAY;

      if (!enoughTimePassed) return;

      hasTriggeredRef.current = true;
      setState("prompt");
    }, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [platform, isInstalled]); // ← only depends on stable values

  const handleDismiss = useCallback(() => {
    const now = Date.now();
    dismissedAtRef.current = now;
    localStorage.setItem(STORAGE_KEYS.DISMISSED_AT, now.toString());

    setMessageIndex((prev) => {
      const next = (prev + 1) % MESSAGES.length;
      localStorage.setItem(STORAGE_KEYS.PROMPT_COUNT, next.toString());
      return next;
    });

    // Reset interaction count for reprompt threshold
    interactionsRef.current = 0;
    hasTriggeredRef.current = false;
    setState("idle");
  }, []);

  const handleInstall = useCallback(async () => {
    if (platform === "ios") {
      handleDismiss();
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (result.outcome === "accepted") {
        localStorage.setItem(STORAGE_KEYS.INSTALLED, "true");
        setIsInstalled(true);
        setState("success");
        setTimeout(() => setState("idle"), SUCCESS_DISPLAY_DURATION);
      } else {
        handleDismiss();
      }
    }
  }, [deferredPrompt, platform, handleDismiss]);

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
          key={state}
          initial={{ opacity: 0, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ type: "spring", stiffness: 280, damping: 25 }}
          className={`fixed top-4 left-2 right-2 z-50 ${className}`}
        >
          {isSuccess ? (
            <div className="backdrop-blur-md bg-white/95 shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 border border-green-100">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={22} className="text-green-500" />
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="font-semibold text-gray-900 text-sm">Successfully Added! 🎉</span>
                <span className="text-gray-500 text-xs">AJ Empire is now on your home screen</span>
              </div>
            </div>
          ) : (
            <div className="backdrop-blur-md bg-white/90 shadow-xl rounded-2xl px-4 py-3 flex items-center justify-between gap-4 border border-white/40">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  <img src="/promptlogo.png" alt="AJ Empire" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="font-semibold text-gray-900 text-sm truncate">{content.title}</span>
                  <span className="text-gray-500 text-xs leading-snug line-clamp-2">
                    {isIOS ? 'Tap Share → "Add to Home Screen" for instant access' : content.subtitle}
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