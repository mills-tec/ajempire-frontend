import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, Variant } from "../types";
import { calcDiscount } from "../utils";
import { addToCart, removeCartItem } from "../api";
import { toast } from "sonner";

export type CartItem = Product & {
  quantity: number;
  selectedVariants: Variant[];
  selected: boolean;
  synced?: boolean;
};

type SyncAction =
  | { type: "add"; item: CartItem }
  | { type: "remove"; id: string }
  | { type: "update"; item: CartItem };

type CartStore = {
  items: CartItem[];
  selectedItem: Product | null; // this stores the product for the product card that has been clicked on for the popup
  syncQueue: SyncAction[]; // item ids pending server sync
  setSelectedItem: (id: Product) => void; // this sets the id for the product card that has been clicked on for the popup
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  resetSelectedItem: () => void;
  clearCart: () => void;
  setQuantity: (id: string, quantity: number) => void;
  clearSelectedItem: () => void; // this clears the id for the product card that has been clicked on for the popup
  deselectAllCartItems: () => void;
  selectAllCartItems: () => void;
  toggleItemSelect: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  getItem: (id: string) => CartItem | undefined;
  setSelectedVariants: (id: string, variants: Variant[]) => void;
  getSelectedItems: () => CartItem[]; // Should be used for CHECKOUT. It is used to retrieve all items that has been selected in the cart
  orderSummary: () => {
    total: number;
    discount: number;
    coupon: number;
    deliveryFee: number;
    finalTotal: number;
  };
  retrySync: () => Promise<void>;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      selectedItem: null,
      syncQueue: [],
      setSelectedItem: (product: Product) => set({ selectedItem: product }),
      clearSelectedItem: () => set({ selectedItem: null }),
      getSelectedItems: () => get().items.filter((i) => i.selected === true),
      getItem: (id: string) => get().items.find((i) => i._id === id),
      addItem: (item) => {
        const existing = get().items.find((i) => i._id === item._id);
        let newItems;

        if (existing) {
          newItems = get().items.map((i) =>
            i._id === item._id
              ? { ...i, quantity: i.quantity + item.quantity, synced: false }
              : i
          );
        } else {
          newItems = [...get().items, { ...item, synced: false }];
        }

        // Update local first
        set({ items: newItems });

        // Try to sync
        addToCart(newItems)
          .then(() => {
            // mark all as synced
            set({
              items: newItems.map((i) => ({ ...i, synced: true })),
              syncQueue: [],
            });
          })
          .catch(() => {
            // add to retry queue
            set({ syncQueue: [...get().syncQueue, { type: "add", item }] });
            toast.error("Couldn't sync cart. Will retry.");
          });
      },
      setSelectedVariants: (id: string, variants: Variant[]) => {
        const updatedItems = get().items.map((i) =>
          i._id === id ? { ...i, selectedVariants: variants, synced: false } : i
        );
        const updatedItem = updatedItems.find((i) => i._id === id);

        set({
          items: updatedItems,
        });

        // Try to sync
        if (updatedItem) {
          addToCart(updatedItems)
            .then(() => {
              set({
                items: updatedItems.map((i) => ({ ...i, synced: true })),
                syncQueue: [],
              });
            })
            .catch(() => {
              set({
                syncQueue: [
                  ...get().syncQueue,
                  { type: "update", item: updatedItem },
                ],
              });
              toast.error("Couldn't sync cart. Will retry.");
            });
        }
      },
      resetSelectedItem: () => set({ selectedItem: null }),
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
      setQuantity: (id: string, quantity: number) => {
        const updatedItems = get().items.map((i) =>
          i._id === id ? { ...i, quantity, synced: false } : i
        );
        const updatedItem = updatedItems.find((i) => i._id === id);
        set({ items: updatedItems });

        // Try to sync
        if (updatedItem) {
          addToCart(updatedItems)
            .then(() => {
              // mark all as synced
              set({
                items: updatedItems.map((i) => ({ ...i, synced: true })),
                syncQueue: [],
              });
            })
            .catch(() => {
              // add to retry queue
              set({
                syncQueue: [
                  ...get().syncQueue,
                  { type: "update", item: updatedItem },
                ],
              });
              toast.error("Couldn't sync cart. Will retry.");
            });
        }
      },
      removeItem: async (id) => {
        try {
          set({ items: get().items.filter((i) => i._id !== id) });

          removeCartItem(id)
            .then(() => {
              // mark all as synced
              set({
                items: get().items.filter((i) => i._id !== id),
                syncQueue: [],
              });
            })
            .catch(() => {
              // add to retry queue
              set({
                syncQueue: [...get().syncQueue, { type: "remove", id }],
              });
              toast.error("Couldn't sync cart. Will retry.");
            });
        } catch (error) {
          toast.error("Couldn't remove item from cart.");
          console.log("err", error);
        }
      },
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
      retrySync: async () => {
        const { syncQueue } = get();
        if (syncQueue.length === 0) return;

        const newQueue: SyncAction[] = [];

        for (const action of syncQueue) {
          try {
            if (action.type === "add") {
              await addToCart([action.item]);
            } else if (action.type === "remove") {
              await removeCartItem(action.id);
            } else if (action.type === "update") {
              await addToCart([action.item]); // reuse API
            }
          } catch (err) {
            // Keep failed actions for next retry
            newQueue.push(action);
          }
        }

        // Replace queue with remaining failed actions
        set({ syncQueue: newQueue });

        if (newQueue.length === 0) {
          toast.success("Cart fully synced!");
        } else {
          toast.warning(`${newQueue.length} cart actions pending`);
        }
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
