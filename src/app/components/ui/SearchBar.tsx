"use client";

import { useProduct } from "@/api/customHooks";
import { CameraIcon } from "@/components/svgs/CameraIcon";
import { CameraSnap } from "@/components/svgs/CameraSnap";
import { SearchIcon } from "@/components/svgs/SearchIcon";
import { useSearchStore } from "@/lib/search-store";
import { Product } from "@/lib/types";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SearchDropdown from "./SearchDropdown";

const PLACEHOLDERS = [
  "Super deals 🔥",
  "New stock arrivals",
  "Discounted products",
];

const SearchBar = ({ showCam = true }: { showCam?: boolean }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // Bumped on every submit/image-search so a slow response can detect it's
  // been superseded and skip applying its (now stale) result.
  const searchGenerationRef = useRef(0);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderClass, setPlaceholderClass] = useState(
    "placeholder:animate-placeholderFromBottom",
  );

  const { searchByImage, searchByImageLoading } = useProduct();

  // Selected individually rather than destructuring the whole store, so this
  // component only re-renders when these specific fields change — not on
  // every unrelated search-store update (recent list, price range, etc.)
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const submitSearch = useSearchStore((s) => s.submitSearch);
  const setSearchByImageProducts = useSearchStore((s) => s.setSearchByImageProducts);
  const addRecentImageSearch = useSearchStore((s) => s.addRecentImageSearch);

  const router = useRouter();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let t2: ReturnType<typeof setTimeout>;
    const t1 = setTimeout(() => {
      setPlaceholderClass("");
      t2 = setTimeout(() => {
        setPlaceholderClass("placeholder:animate-placeholderFromBottom");
      }, 10);
    }, 0);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [placeholderIndex]);

  // Update dropdown position. The dropdown is `position: fixed`, so it needs
  // viewport-relative coordinates (getBoundingClientRect already gives us
  // that) — recomputed on resize/scroll too, since otherwise it stays glued
  // to wherever the search bar was when the dropdown first opened.
  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const newPos = { top: rect.bottom, left: rect.left, width: rect.width };
      setDropdownPos((prev) =>
        prev.top === newPos.top &&
        prev.left === newPos.left &&
        prev.width === newPos.width
          ? prev
          : newPos,
      );
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
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

  const handleSubmit = () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    searchGenerationRef.current += 1; // invalidate any in-flight image search
    setQuery(trimmedQuery);
    submitSearch();
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleImageSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const generation = ++searchGenerationRef.current;
    try {
      const data: Product[] | undefined = await searchByImage(file);
      // A newer search (another image upload, or a text search) started
      // while this request was in flight, or the request itself failed —
      // either way, this result is stale and shouldn't be applied.
      if (searchGenerationRef.current !== generation || !data) return;
      setSearchByImageProducts(data);
      addRecentImageSearch(file);
      router.push(`/search?type=image`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

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
          onFocus={() => setOpen(true)}
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
