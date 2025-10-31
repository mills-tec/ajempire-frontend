import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "../types";
import { calcDiscount } from "../utils";

export type CartItem = Product & {
  quantity: number;
  selected: boolean;
};

type CartStore = {
  items: CartItem[];
  selectedItem: Product | null; // this stores the product for the product card that has been clicked on for the popup
  setSelectedItem: (id: Product) => void; // this sets the id for the product card that has been clicked on for the popup
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setQuantity: (id: string, quantity: number) => void;
  clearSelectedItem: () => void; // this clears the id for the product card that has been clicked on for the popup
  deselectAllCartItems: () => void;
  selectAllCartItems: () => void;
  toggleItemSelect: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  getItem: (id: string) => CartItem | undefined;
  getSelectedItems: () => CartItem[]; // Should be used for CHECKOUT. It is used to retrieve all items that has been selected in the cart
  orderSummary: () => {
    total: number;
    discount: number;
    coupon: number;
    deliveryFee: number;
    finalTotal: number;
  };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      selectedItem: null,
      setSelectedItem: (product: Product) => set({ selectedItem: product }),
      clearSelectedItem: () => set({ selectedItem: null }),
      getSelectedItems: () => get().items.filter((i) => i.selected === true),
      getItem: (id: string) => get().items.find((i) => i._id === id),
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
      selectAllCartItems: () =>
        set({
          items: get().items.map((i) => ({ ...i, selected: true })),
        }),
      deselectAllCartItems: () =>
        set({
          items: get().items.map((i) => ({ ...i, selected: false })),
        }),
      toggleItemSelect: (id: string) =>
        set({
          items: get().items.map((i) =>
            i._id === id ? { ...i, selected: !i.selected } : i
          ),
        }),
      setQuantity: (id: string, quantity: number) =>
        set({
          items: get().items.map((i) =>
            i._id === id ? { ...i, quantity } : i
          ),
        }),
      removeItem: (id) =>
        set({ items: get().items.filter((i) => i._id !== id) }),
      clearCart: () => set({ items: [] }),
      increaseQuantity: (id) =>
        set({
          items: get().items.map((i) =>
            i._id === id
              ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
              : i
          ),
        }),
      decreaseQuantity: (id) =>
        set({
          items: get()
            .items.map((i) =>
              i._id === id ? { ...i, quantity: Math.max(i.quantity - 1, 1) } : i
            )
            .filter((i) => i.quantity > 0),
        }),
      orderSummary: () => {
        const items = get().items.filter((i) => i.selected);
        const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const discount = items.reduce(
          (sum, i) =>
            sum + calcDiscount(i.price, i.discountedPrice) * i.quantity,
          0
        );
        const coupon = 0;
        const deliveryFee = 0;
        return {
          total,
          discount,
          coupon,
          deliveryFee,
          finalTotal: total - (discount + coupon + deliveryFee),
        };
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }), // only persist items
    }
  )
);

// derived getter instead of in-store `get total()`
export const useCartTotal = () =>
  useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  );
