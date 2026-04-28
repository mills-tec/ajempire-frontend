import { create } from "zustand";
import { Product } from "./types";
import { persist } from "zustand/middleware";

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

  // ✅ IMAGE SEARCH STATE
  searchByImageProducts: Product[] | null;
  setSearchByImageProducts: (products: Product[] | null) => void;
  recentImageSearches: {
    id: string;
    name: string;
    base64: string;
    hash: string;
    lastModified: number;
  }[];
  addRecentImageSearch: (image: File) => void;
  removeRecentImageSearch: (hash: string) => void;
  searchByImageLoading: boolean;
  setSearchByImageLoading: (loading: boolean) => void;
};

export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      query: "",
      searchedQuery: "",

      recent: [],

      minPrice: null,
      maxPrice: null,

      resetToken: 0,

      searchByImageLoading: false,
      setSearchByImageLoading: (loading) =>
        set({ searchByImageLoading: loading }),

      setQuery: (query) => set({ query }),

      submitSearch: () => {
        const q = get().query.trim();
        if (!q) return;

        set((state) => ({
          searchedQuery: q,
          recent: [q, ...state.recent.filter((r) => r !== q)].slice(0, 8),
        }));
      },

      clearSearch: () =>
        set((state) => ({
          query: "",
          searchedQuery: "",
          resetToken: state.resetToken + 1,
        })),

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
        set((state) => ({
          recent: state.recent.filter((r) => r !== q),
        })),

      clearRecent: () => set({ recent: [], recentImageSearches: [] }),

      searchByImageProducts: null,
      setSearchByImageProducts: (products) =>
        set({ searchByImageProducts: products }),

      recentImageSearches: [],

      addRecentImageSearch: async (file: File) => {
        const base64 = await fileToBase64(file);
        const hash = await hashBase64(base64);

        // Deduplicate before adding
        const alreadyExists = get().recentImageSearches.some(
          (img) => img.hash === hash,
        );
        if (alreadyExists) return;

        set((state) => ({
          recentImageSearches: [
            {
              id: crypto.randomUUID(),
              name: file.name,
              base64,
              hash,
              lastModified: file.lastModified,
            },
            ...state.recentImageSearches,
          ].slice(0, 10),
        }));
      },
      removeRecentImageSearch: (hash) =>
        set((state) => ({
          recentImageSearches: state.recentImageSearches.filter(
            (img) => img.hash !== hash,
          ),
        })),
    }),
    {
      name: "search-store",

      // 👇 ONLY these survive refresh
      partialize: (state) => ({
        recent: state.recent,
        recentImageSearches: state.recentImageSearches,
        searchByImageProducts: state.searchByImageProducts,
      }),
    },
  ),
);

const hashBase64 = async (base64: string) => {
  const buffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(base64),
  );
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // "a3f1c9..." — short, fast to compare
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string); // "data:image/png;base64,..."
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
