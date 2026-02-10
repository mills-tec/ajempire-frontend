import { create } from "zustand";

type SearchStore = {
  query: string;
  searchedQuery: string;
  recent: string[];
   minPrice: number | null;
  maxPrice: number | null;  
  resetToken: number;

  setQuery: (q: string) => void;
  submitSearch: () => void;
  clearSearch: () => void;

  // ✅ PRICE ACTIONS
  setPriceRange: (min: number | null, max: number | null) => void;
  clearPriceRange: () => void;

  removeRecent: (q: string) => void;
  clearRecent: () => void;
};


export const useSearchStore = create<SearchStore>((set, get) => ({
  query: "",
  searchedQuery: "",
  recent:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("recentSearches") || "[]")
      : [],

  // 🔥 PRICE FILTER STATE
  minPrice: null,
  maxPrice: null,

  resetToken: 0,

  setQuery: (query) => set({ query }),

  submitSearch: () => {
    const q = get().query.trim();
    if (!q) return;

    set((state) => {
      const updated = [
        q,
        ...state.recent.filter((r) => r !== q),
      ].slice(0, 8);

      localStorage.setItem("recentSearches", JSON.stringify(updated));

      return {
        searchedQuery: q,
        recent: updated,
      };
    });
  },

  clearSearch: () =>
    set((state) => ({
      query: "",
      searchedQuery: "",
      resetToken: state.resetToken + 1,
    })),

  // 🔥 PRICE ACTIONS
  setPriceRange: (min, max) =>
    set({
      minPrice: min,
      maxPrice: max,
    }),

  clearPriceRange: () =>
    set({
      minPrice: null,
      maxPrice: null,
    }),

  removeRecent: (q) =>
    set((state) => {
      const updated = state.recent.filter((r) => r !== q);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return { recent: updated };
    }),

  clearRecent: () => {
    localStorage.removeItem("recentSearches");
    set({ recent: [] });
  },
}));
