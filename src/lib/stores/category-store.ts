import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Category } from "../types";

interface CategoryStore {
  selectedCategory: Category | null;
  setSelectedCategory: (category: Category | null) => void;
  clearSelectedCategory: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      selectedCategory: null,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      clearSelectedCategory: () => set({ selectedCategory: null }),
    }),
    {
      name: "category-store",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    },
  ),
);
