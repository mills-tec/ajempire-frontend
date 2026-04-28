"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface PWAInstallPromptProps {
  className?: string;
}

const FIRST_PROMPT_DELAY = 30 * 1000; // 30s
const MIN_INTERACTIONS = 2;

const STORAGE_KEYS = {
  DISMISSED_AT: "pwa_prompt_dismissed_at",
} as const;

export default function PWAInstallPrompt({ className = "" }: PWAInstallPromptProps) {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [userInteractions, setUserInteractions] = useState(0);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('desktop');
  const hasTriggeredRef = useRef(false);

  // Detect platform
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    if (isIOS) setPlatform("ios");
    else if (isAndroid) setPlatform("android");
    else setPlatform("desktop");
  }, []);

  // Detect installed PWA
  useEffect(() => {
    const checkInstalled = () => {
      const standalone = window.matchMedia("(display-mode: standalone)").matches;
      const iosStandalone = (window.navigator as any).standalone === true;
      setIsInstalled(standalone || iosStandalone);
    };

    checkInstalled();
  }, []);

  // Track interactions
  useEffect(() => {
    const handler = () => setUserInteractions((p) => p + 1);

    window.addEventListener("click", handler);
    window.addEventListener("scroll", handler);

    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("scroll", handler);
    };
  }, []);

  // Capture install event (Android / Chrome)
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Trigger logic (SIMPLE + RELIABLE)
  useEffect(() => {
    if (isInstalled) return;
    if (hasTriggeredRef.current) return;

    const timer = setTimeout(() => {
      if (userInteractions >= MIN_INTERACTIONS) {
        hasTriggeredRef.current = true;
        setVisible(true);
      }
    }, FIRST_PROMPT_DELAY);

    return () => clearTimeout(timer);
  }, [userInteractions, isInstalled]);

  const handleInstall = useCallback(async () => {
    // iOS fallback
    if (platform === "ios") {
      setVisible(false);
      return;
    }

    // Desktop fallback
    if (platform === "desktop" && !deferredPrompt) {
      setVisible(false);
      return;
    }

    // Android / Chrome install
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;

      if (result.outcome === "accepted") {
        setVisible(false);
      }

      setDeferredPrompt(null);
    }
  }, [deferredPrompt, platform]);

  const getContent = () => {
    const isIOS = platform === "ios";
    const isDesktopNoPrompt = platform === "desktop" && !deferredPrompt;

    if (isIOS) {
      return {
        title: "Add to Home Screen",
        subtitle: "Tap Share → Add to Home Screen for quick access",
        buttonText: "Got it",
      };
    }

    if (isDesktopNoPrompt) {
      return {
        title: "Install AJ Empire",
        subtitle: "Use your browser menu to install this app",
        buttonText: "Got it",
      };
    }

    return {
      title: "AJ Empire",
      subtitle: "Add to home screen for quick access and offline use",
      buttonText: "Install",
    };
  };

  if (isInstalled || !visible) return null;

  const content = getContent();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ type: "spring", stiffness: 280, damping: 25 }}
          className="fixed top-4 left-0 z-50 w-[95%] lg:w-screen lg:flex lg:flex-col lg:justify-center lg:items-center  lg:mx-0 "
        >
          <div className="backdrop-blur-md bg-white/80 shadow-xl rounded-2xl px-4 py-3 flex items-center justify-between gap-4 border border-white/40">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gray-100  overflow-hidden">
                {/* LOGO HERE */}
                <img src="/promptlogo.png" alt="AJ Empire" className="w-full h-full object-contain" />
              </div>

              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-gray-900 text-sm sm:text-base">
                  {content.title}
                </span>
                <span className="text-gray-600 text-xs sm:text-sm">
                  {content.subtitle}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                className="bg-[#FF008C] text-white text-xs sm:text-sm px-4 py-2 rounded-full font-medium shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                {content.buttonText}
              </button>

              <button
                onClick={() => setVisible(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 transition"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}