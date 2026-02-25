"use client";

import { useRef, useState, useEffect } from "react";
import { useSearchStore } from "@/lib/search-store";
import SearchDropdown from "./SearchDropdown";
import { SearchIcon } from "@/components/svgs/SearchIcon";
import { CameraIcon } from "@/components/svgs/CameraIcon";
import { CameraSnap } from "@/components/svgs/CameraSnap";
import { useRouter } from "next/navigation";
const SearchBar = ({ showCam = true }: { showCam?: boolean }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const { query, setQuery, submitSearch } = useSearchStore();
  const router = useRouter();
  // const handleSubmit = () => {
  //   submitSearch();          // ✅ saves to recent + locks search
  //   setOpen(false);          // ✅ close dropdown
  //   inputRef.current?.blur();
  // };
  const handleSubmit = () => {
    if (!query) {
      return;
    }

    submitSearch(); // ✅ still save recent searches in Zustand
    router.push(`/search?q=${encodeURIComponent(query)}`); // 🔹 route-based navigation
    setOpen(false); // ✅ close dropdown
    inputRef.current?.blur();
  }

  const [placeholderClass, setPlaceholderClass] = useState("placeholder:animate-placeholderFromBottom");

  // ✅ click outside to close dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const placeholders = [
    "Super deals 🔥",
    "New stock arrivals",
    "Discounted products ",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % placeholders.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (!placeholders[index]) return;

    // remove & re-add animation to restart it
    setPlaceholderClass("");
    const timeout = setTimeout(() => {
      setPlaceholderClass("placeholder:animate-placeholderFromBottom");
    }, 10); // 10ms is enough to reset

    return () => clearTimeout(timeout);
  }, [index]);


  return (
    <div ref={wrapperRef} className="relative w-full overflow-visible">
      <div className="w-full flex gap-2 items-center border rounded-full h-[40px] px-[14px] focus-within:border-brand_solid_gradient">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}   // 🔹 typing only
          onFocus={() => setOpen(true)}               // 🔹 open dropdown
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={placeholders[index]}
          className={`w-full outline-none bg-transparent text-sm ${placeholderClass}`}
        />

        {/* ✅ CAMERA ICONS (UNCHANGED) */}
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

      {/* Dropdown */}
      {open && <SearchDropdown onClose={() => setOpen(false)} />}
    </div>
  );
};

export default SearchBar;
