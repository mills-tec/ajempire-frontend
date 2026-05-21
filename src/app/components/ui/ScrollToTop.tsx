"use client";

import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 300;

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.dispatchEvent(new CustomEvent("scroll-to-top-start"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={[
        "fixed right-4 lg:right-8 z-50",
        "bottom-24 lg:bottom-8",
        "w-11 h-11 lg:w-13 lg:h-13 rounded-full",
        "flex items-center justify-center",
        "shadow-lg shadow-brand_pink/30",
        "transition-all duration-300 ease-out",
        "hover:scale-110 active:scale-95",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none",
      ].join(" ")}
      style={{
        background: "linear-gradient(135deg, #FF008C, #A600FF)",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}
