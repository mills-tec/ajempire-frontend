"use client";

import { useProduct } from "@/api/customHooks";
import { useSearchStore } from "@/lib/search-store";
import { Product } from "@/lib/types";
import { X, Trash2 } from "lucide-react"; // ✅ Trash2 icon
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface SearchDropdownProps {
  onClose?: () => void;
  position?: { top: number; left: number; width: number };
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const SearchDropdown = React.forwardRef<HTMLDivElement, SearchDropdownProps>(
  ({ onClose, position, inputRef }, ref) => {
    const {
      recent,
      setQuery,
      removeRecent,
      clearRecent,
      recentImageSearches,
      setSearchByImageProducts,
      addRecentImageSearch,
      removeRecentImageSearch,
    } = useSearchStore();
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const { searchByImage } = useProduct();

    // animate in
    useEffect(() => {
      const timer = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(timer);
    }, []);

    // compute spacing below search bar
    const topPos = (position?.top ?? 0) + 5; // ✅ 8px gap below input

    const dropdownClasses = `
      search-dropdown 
      bg-white rounded-2xl shadow-xl border p-4 py-5 z-[9999] fixed
      transition-all duration-200 ease-out
      transform
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
    `;

    const base64ToFile = (
      base64: string,
      fileName: string,
      lastModified: number,
    ) => {
      // Split "data:image/png;base64,iVBORw0..." into mime type and raw data
      const [meta, data] = base64.split(",");
      const mimeType = meta?.match(/:(.*?);/)?.[1] || "image/jpeg"; // "image/png"

      // Decode base64 string into bytes
      const bytes = atob(data || "");
      const byteArray = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) {
        byteArray[i] = bytes.charCodeAt(i);
      }

      return new File([byteArray], fileName, { type: mimeType, lastModified });
    };

    if (recent.length === 0 && recentImageSearches.length === 0) {
      return (
        <div
          ref={ref}
          className={dropdownClasses}
          style={{
            top: topPos,
            left: position?.left ?? 0,
            width: position?.width ?? 200,
          }}
        >
          <p className="text-sm text-gray-400">No recent searches</p>
        </div>
      );
    }

    const handleImageSearchClick = async (image: {
      base64: string;
      name: string;
      lastModified: number;
    }) => {
      const { base64, name, lastModified } = image;
      const file = base64ToFile(base64, name, lastModified);
      if (!file) return;
      try {
        let data: Product[] = await searchByImage(file);
        setSearchByImageProducts(data);
        addRecentImageSearch(file);
        router.push(`/search?type=image`);
      } catch (err) {
        console.error(err);
      }
    };

    return (
      <div
        ref={ref}
        className={dropdownClasses}
        style={{
          top: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "40%",
        }}
      >
        {/* Header */}
        <div className="flex justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">Recently searched</p>
          <button
            onClick={clearRecent}
            className="text-gray-400 hover:text-black p-1 rounded-full"
            title="Clear recent searches"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Recent text items */}

        {recent.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recent.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-sm cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  setQuery(item);
                  router.push(`/search?q=${encodeURIComponent(item)}`);
                  inputRef?.current?.blur();
                  onClose?.();
                }}
              >
                <span className="truncate max-w-[140px]">{item}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecent(item);
                  }}
                  className="text-gray-400 hover:text-black cursor-pointer"
                >
                  <X size={14} />
                </span>
              </div>
            ))}
          </div>
        )}

        {recentImageSearches.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {recentImageSearches.map((item, idx) => (
              <div key={idx} className="relative">
                <img
                  onClick={() => {
                    handleImageSearchClick(item);
                  }}
                  src={item.base64}
                  alt=""
                  key={idx}
                  className="w-10 h-10 object-cover rounded cursor-pointer"
                />
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecentImageSearch(item.hash);
                  }}
                  className="text-white  cursor-pointer absolute top-0 right-0 bg-black/40 hover:bg-black rounded-full flex items-center justify-center  h-4 w-4"
                >
                  <X size={10} />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

SearchDropdown.displayName = "SearchDropdown";
export default SearchDropdown;
