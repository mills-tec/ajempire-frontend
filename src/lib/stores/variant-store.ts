import { create } from "zustand";
import { persist } from "zustand/middleware";

type VariantState = {
  selections: Record<string, Record<string, string>>;
  // productId -> { color: "red", size: "M" }

  setSelection: (
    productId: string,
    variantName: string,
    value: string,
  ) => void;
  setSelections: (productId: string, selections: Record<string, string>) => void;
  resetSelection: (productId: string) => void;
};

export const useVariantStore = create<VariantState>()(
  persist(
    (set, get) => ({
      selections: {},

      setSelection: (productId, variantName, value) => {
        const current = get().selections[productId] || {};

        set({
          selections: {
            ...get().selections,
            [productId]: {
              ...current,
              [variantName]: value,
            },
          },
        });
      },

      setSelections: (productId, selections) => {
        set({
          selections: {
            ...get().selections,
            [productId]: selections,
          },
        });
      },

      resetSelection: (productId) => {
        const updated = { ...get().selections };
        delete updated[productId];

        set({ selections: updated });
      },
    }),
    {
      name: "variant-storage",
    },
  ),
);
