"use client";
import { useSearchStore } from "@/lib/search-store";
import { X } from "lucide-react";


const SearchDropdown = ({ onClose }: { onClose?: () => void }) => {
    const { recent, setQuery, removeRecent, clearRecent } = useSearchStore();
    console.log("recent inside dropdown: ", recent);

    if (recent.length === 0) {
        return (
            <div className="absolute z-50 top-[48px] w-full bg-white p-4 rounded-xl shadow">
                <p className="text-sm text-gray-400">No recent searches</p>
            </div>
        );
    }
    return (
        <div className="absolute top-[48px] left-0 w-full bg-white rounded-2xl shadow-xl border z-[9999] p-4">

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
                    <div
                        key={item}
                        className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-sm cursor-pointer hover:bg-gray-200"
                        onClick={() => {
                            setQuery(item);
                            onClose?.();
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
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchDropdown;
