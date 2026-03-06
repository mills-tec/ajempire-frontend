"use client";
import { useSearchStore } from "@/lib/search-store";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface SearchDropdownProps {
    onClose?: () => void;
    position?: { top: number; left: number; width: number };
}

const SearchDropdown = ({ onClose, position }: SearchDropdownProps) => {
    const router = useRouter();
    const { recent, setQuery, removeRecent, clearRecent } = useSearchStore();
    // console.log("recent inside dropdown: ", recent);

    // debug click propagation
    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            console.log('document click target:', e.target);
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    if (recent.length === 0) {
        return (
            <div
                className="fixed z-[9999] bg-white p-4 rounded-xl shadow border"
                style={{
                    top: `${position?.top || 0}px`,
                    left: `${position?.left || 0}px`,
                    width: `${position?.width || '100%'}px`,
                }}
            >
                <p className="text-sm text-gray-400">No recent searches</p>
            </div>
        );
    }
    return (
        <div
            className="search-dropdown fixed z-[9999] bg-white rounded-2xl shadow-xl border p-4 py-5 mt-1"
            style={{
                top: `${position?.top || 0}px`,
                left: `${position?.left || 0}px`,
                width: `${position?.width || '100%'}px`,
            }}
        >

            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">
                    Recently searched
                </p>
                <button
                    onClick={clearRecent}
                    className="text-xs text-gray-400 hover:text-black"
                >
                    Done
                </button>
            </div>
            {/* Search chips */}
            <div className="flex flex-wrap gap-2">
                {recent.map((item) => (
                    <button
                        key={item}
                        type="button"
                        className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-sm cursor-pointer hover:bg-gray-200"
                        onClick={() => {
                            // show visual feedback so mobile user can see action fired
                            console.log("SearchDropdown clicked item:", item);
                            setQuery(item);
                            // keep the dropdown open until outside click
                            router.push(`/search?q=${encodeURIComponent(item)}`);
                        }}
                        onTouchStart={() => {
                            console.log("touch start on item", item);
                        }}
                    >
                        <span className="truncate max-w-[140px]">{item}</span>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeRecent(item);
                            }}
                            className="text-gray-400 hover:text-black"
                        >
                            <X size={14} />
                        </button>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SearchDropdown;
