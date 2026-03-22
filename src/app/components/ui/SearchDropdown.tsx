"use client";

import { useSearchStore } from "@/lib/search-store";
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
        const { recent, setQuery, removeRecent, clearRecent } = useSearchStore();
        const router = useRouter();
        const [visible, setVisible] = useState(false);

        // animate in
        useEffect(() => {
            const timer = setTimeout(() => setVisible(true), 10);
            return () => clearTimeout(timer);
        }, []);

        // compute spacing below search bar
        const topPos = (position?.top ?? 0) + 5; // ✅ 8px gap below input

        const dropdownClasses = `
      search-dropdown 
      bg-white rounded-2xl shadow-xl border p-4 py-5 z-[9999] absolute
      transition-all duration-200 ease-out
      transform
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
    `;

        if (recent.length === 0) {
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

                {/* Recent items */}
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
            </div>
        );
    }
);

SearchDropdown.displayName = "SearchDropdown";
export default SearchDropdown;