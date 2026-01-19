import { create } from "zustand";

type SearchStore = {
  query: string;
  searchedQuery: string;
  recent: string[];
  resetToken: number;

  setQuery: (q: string) => void;
  submitSearch: () => void;
  clearSearch: () => void;
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
      resetToken: state.resetToken + 1, // 🔥 trigger
    })),

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
