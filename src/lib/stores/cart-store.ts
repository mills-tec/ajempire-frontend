import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "../types";

export type CartItem = Product & {
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  total: number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find((i) => i._id === item._id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i._id === item._id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },
      removeItem: (id) =>
        set({ items: get().items.filter((i) => i._id !== id) }),
      clearCart: () => set({ items: [] }),
      increaseQuantity: (id) =>
        set({
          items: get().items.map((i) =>
            i._id === id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }),
      decreaseQuantity: (id) =>
        set({
          items: get()
            .items.map((i) =>
              i._id === id ? { ...i, quantity: i.quantity - 1 } : i
            )
            .filter((i) => i.quantity > 0),
        }),
      get total() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
    }),
    {
      name: "cart-storage", // name in localStorage
    }
  )
);
