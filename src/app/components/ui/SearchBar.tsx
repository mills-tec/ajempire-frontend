"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchStore } from "@/lib/search-store";
import SearchDropdown from "./SearchDropdown";
import { SearchIcon } from "@/components/svgs/SearchIcon";
import { CameraIcon } from "@/components/svgs/CameraIcon";
import { CameraSnap } from "@/components/svgs/CameraSnap";
import { useRouter } from "next/navigation";

const SearchBar = ({ showCam = true }: { showCam?: boolean }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderClass, setPlaceholderClass] = useState(
    "placeholder:animate-placeholderFromBottom"
  );

  const { query, setQuery, submitSearch } = useSearchStore();
  const router = useRouter();

  const placeholders = ["Super deals 🔥", "New stock arrivals", "Discounted products"];

  // Mount effect
  useEffect(() => setMounted(true), []);

  // Placeholder animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setPlaceholderClass("");
    const timeout = setTimeout(
      () => setPlaceholderClass("placeholder:animate-placeholderFromBottom"),
      10
    );
    return () => clearTimeout(timeout);
  }, [placeholderIndex]);

  // Update dropdown position
  useEffect(() => {
    if (!open || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, [open]);

  // Outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(e.target as Node)) return;
      if (e.target instanceof Element && e.target.closest(".search-dropdown")) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = () => {
    if (!query) return;
    submitSearch();
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={wrapperRef} className="relative w-full overflow-visible">
      <div className="w-full flex gap-2 items-center border rounded-full h-[40px] px-[14px] focus-within:border-brand_solid_gradient">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={placeholders[placeholderIndex]}
          className={`w-full outline-none bg-transparent text-base ${placeholderClass}`}
        />

        {showCam && (
          <div>
            <div className="hidden lg:block">
              <CameraIcon className="w-6" />
            </div>
            <CameraSnap className="w-6 lg:hidden" />
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="bg-brand_gradient_dark w-[50px] h-[30px] rounded-[20px] flex items-center justify-center"
        >
          <SearchIcon className="w-5 text-white" />
        </button>
      </div>

      {/* Dropdown portal */}
      {mounted && open &&
        createPortal(
          <SearchDropdown
            ref={dropdownRef}
            inputRef={inputRef}
            onClose={() => setOpen(false)}
            position={dropdownPos}
          />,
          document.body
        )}
    </div>
  );
};

export default SearchBar;