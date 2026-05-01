"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSearchStore } from "@/lib/search-store";
import SearchDropdown from "./SearchDropdown";
import { SearchIcon } from "@/components/svgs/SearchIcon";
import { CameraIcon } from "@/components/svgs/CameraIcon";
import { CameraSnap } from "@/components/svgs/CameraSnap";
import { useRouter } from "next/navigation";
import { useProduct } from "@/api/customHooks";
import { Product } from "@/lib/types";
import { LoaderCircle } from "lucide-react";

const PLACEHOLDERS = [
  "Super deals 🔥",
  "New stock arrivals",
  "Discounted products",
];

const SearchBar = ({ showCam = true }: { showCam?: boolean }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderClass, setPlaceholderClass] = useState(
    "placeholder:animate-placeholderFromBottom",
  );

  const { searchByImage, searchByImageLoading } = useProduct();
  const {
    query,
    setQuery,
    submitSearch,
    setSearchByImageProducts,
    addRecentImageSearch,
  } = useSearchStore();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setPlaceholderClass("");
    const timeout = setTimeout(
      () => setPlaceholderClass("placeholder:animate-placeholderFromBottom"),
      10,
    );
    return () => clearTimeout(timeout);
  }, [placeholderIndex]);

  // Update dropdown position
  useEffect(() => {
    if (!open || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const newPos = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    };
    setDropdownPos((prev) =>
      prev.top === newPos.top &&
      prev.left === newPos.left &&
      prev.width === newPos.width
        ? prev
        : newPos,
    );
  }, [open]);

  // Outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current?.contains(e.target as Node)) return;
      if (e.target instanceof Element && e.target.closest(".search-dropdown"))
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    setQuery(trimmedQuery);
    submitSearch();
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    setOpen(false);
    inputRef.current?.blur();
  }, [query, setQuery, submitSearch, router]);

  const handleImageSearch = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const data: Product[] = await searchByImage(file);
        setSearchByImageProducts(data);
        addRecentImageSearch(file);
        router.push(`/search?type=image`);
      } catch (err) {
        console.error(err);
      }
    },
    [searchByImage, setSearchByImageProducts, addRecentImageSearch, router],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSubmit();
    },
    [handleSubmit],
  );

  const handleFocus = useCallback(() => setOpen(true), []);

  useEffect(() => {
    if (!searchByImageLoading) {
      setOpen(false);
      inputRef.current?.blur();
    }
  }, [searchByImageLoading]);

  return (
    <div ref={wrapperRef} className="relative w-full overflow-visible">
      <div className="w-full flex gap-2 items-center border rounded-full h-[40px] px-[14px] focus-within:border-brand_solid_gradient">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDERS[placeholderIndex]}
          className={`w-full outline-none bg-transparent text-base ${placeholderClass}`}
          suppressHydrationWarning
        />

        {/* Camera — visible on BOTH mobile and desktop */}
        {showCam && (
          <div className="flex items-center">
            {searchByImageLoading ? (
              <LoaderCircle className="animate-spin text-primaryhover" />
            ) : (
              <>
                {/* Mobile: CameraSnap, Desktop: CameraIcon */}
                <CameraSnap
                  className="w-6 lg:hidden cursor-pointer"
                  onClick={() => fileRef.current?.click()}
                />
                <CameraIcon
                  className="w-6 cursor-pointer hidden lg:block"
                  onClick={() => fileRef.current?.click()}
                />
              </>
            )}
            <input
              type="file"
              className="hidden"
              onChange={handleImageSearch}
              accept="image/*"
              ref={fileRef}
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="bg-brand_gradient_dark w-[50px] h-[30px] rounded-[20px] flex items-center justify-center"
        >
          <SearchIcon className="w-5 text-white" />
        </button>
      </div>

      {mounted &&
        open &&
        createPortal(
          <SearchDropdown
            ref={dropdownRef}
            inputRef={inputRef}
            onClose={() => setOpen(false)}
            position={dropdownPos}
          />,
          document.body,
        )}
    </div>
  );
};

export default SearchBar;
