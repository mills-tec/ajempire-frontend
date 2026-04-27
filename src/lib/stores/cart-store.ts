import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "../types";
import { calcDiscount } from "../utils";
import { addToCart, getBearerToken, removeCartItem } from "../api";
import { toast } from "sonner";

export const areVariantsEqual = (
  v1?: SelectedVariant[] | null,
  v2?: SelectedVariant[] | null,
) => {
  const arr1 = v1 || [];
  const arr2 = v2 || [];
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort((a, b) => a.name.localeCompare(b.name));
  const sorted2 = [...arr2].sort((a, b) => a.name.localeCompare(b.name));
  return JSON.stringify(sorted1) === JSON.stringify(sorted2);
};

export type SelectedVariant = {
  name: string;
  value: string;
};

export type CartItem = Product & {
  quantity: number;
  selectedVariants: SelectedVariant[];
  selected: boolean;
  synced?: boolean;
};
type AppliedCoupon = {
  code: string;
  type: "percent" | "fixed";
  value: number;
};

interface SelectedLogistic {
  courier_id: string;
  courier_name: string;
  courier_image: string;
  delivery_eta_time: string;
  delivery_eta: string;
  total: number;
}

export enum CheckoutStep {
  ADDRESS_FORM,
  PAYMENT_METHOD,
  LOGISTICS,
  ORDER_SUMMARY,
}

type AddToCartPayload = {
  product_id: string;
  quantity: number;
  variants: Record<string, string>;
};

type SyncAction =
  | { type: "add"; item: CartItem }
  | { type: "remove"; id: string }
  | { type: "update"; item: CartItem };

type CartStore = {
  isLogisticsMode: boolean;
  setIsLogisticsMode: (isLogisticsMode: boolean) => void;
  items: CartItem[];
  selectedItem: Product | null; // this stores the product for the product card that has been clicked on for the popup
  syncQueue: SyncAction[]; // item ids pending server sync
  setSelectedItem: (id: Product) => void; // this sets the id for the product card that has been clicked on for the popup
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  removePurchasedItems: (ids: string[]) => void;
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
  setSelectedVariants: (id: string, variants: SelectedVariant[]) => void;
  getSelectedItems: () => CartItem[]; // Should be used for CHECKOUT. It is used to retrieve all items that has been selected in the cart
  /* LOGISTICS */
  selectedLogistic: SelectedLogistic | null;
  setSelectedLogistic: (logistic: SelectedLogistic) => void;
  clearSelectedLogistic: () => void;
  requestToken: string | null;
  setRequestToken: (token: string) => void;
  clearRequestToken: () => void;

  /* COUPON */
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;

  /* CHECKOUT FLOW */
  checkoutStep: CheckoutStep;
  setCheckoutStep: (step: CheckoutStep) => void;
  resetCheckoutFlow: () => void;

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
      isLogisticsMode: true,
      setIsLogisticsMode: (isLogisticsMode: boolean) =>
        set({ isLogisticsMode }),
      items: [],
      selectedItem: null,
      syncQueue: [],
      setSelectedItem: (product: Product) => set({ selectedItem: product }),
      clearSelectedItem: () => set({ selectedItem: null }),
      /* LOGISTICS */
      /* LOGISTICS */
      selectedLogistic: null,
      requestToken: null,

      /* COUPON */
      appliedCoupon: null,

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),

      removeCoupon: () => set({ appliedCoupon: null }),

      /* CHECKOUT FLOW */
      checkoutStep: CheckoutStep.ADDRESS_FORM,

      setCheckoutStep: (step) => set({ checkoutStep: step }),

      resetCheckoutFlow: () =>
        set({
          checkoutStep: CheckoutStep.ADDRESS_FORM,
          selectedLogistic: null,
          requestToken: null,
        }),

      setSelectedLogistic: (logistic) => set({ selectedLogistic: logistic }),

      setRequestToken: (token: string) => set({ requestToken: token }),

      clearSelectedLogistic: () => set({ selectedLogistic: null }),

      clearRequestToken: () => set({ requestToken: null }),
      getSelectedItems: () => get().items.filter((i) => i.selected === true),
      getItem: (id: string) => get().items.find((i) => i._id === id),
      addItem: (item) => {
        // Determine if this item requires variants from either explicit variants or combination variants
        const hasVariants =
          (item.variants && item.variants.length > 0) ||
          (item.variantCombinations && item.variantCombinations.length > 0);

        const requiredVariantCount = item.variants?.length
          ? item.variants.length
          : Array.from(
              new Set(
                (item.variantCombinations ?? []).flatMap((combo) =>
                  combo.options.map((option) => option.name),
                ),
              ),
            ).length;

        if (
          hasVariants &&
          (!item.selectedVariants ||
            item.selectedVariants.length !== requiredVariantCount)
        ) {
          toast.error(
            "Please select all required variants before adding to cart",
          );
          return;
        }

        const existing = get().items.find(
          (i) =>
            i._id === item._id &&
            areVariantsEqual(i.selectedVariants, item.selectedVariants),
        );
        let newItems;

        if (existing) {
          newItems = get().items.map((i) =>
            i._id === item._id &&
            areVariantsEqual(i.selectedVariants, item.selectedVariants)
              ? { ...i, quantity: i.quantity + item.quantity, synced: false }
              : i,
          );
        } else {
          newItems = [...get().items, { ...item, synced: false }];
        }

        // Update local first
        set({ items: newItems });

        const token = getBearerToken();

        // 🚨 If guest user, skip backend sync
        if (!token) return;

        // Try to sync ONLY changed item

        // addToCart([item])
        //   .then(() => {
        //     set({
        //       items: get().items.map((i) =>
        //         i._id === item._id ? { ...i, synced: true } : i,
        //       ),
        //     });
        //   })
        //   .catch(() => {
        //     set({
        //       syncQueue: [...get().syncQueue, { type: "add", item }],
        //     });
        //     toast.error("Couldn't sync cart. Will retry.");
        //   });
        addToCart([item])
          .then((res) => {
            console.log("SYNC SUCCESS:", res);
          })
          .catch((err) => {
            console.log("SYNC ERROR:", err);
            toast.error("Couldn't sync cart. Will retry.");
          });
      },

      setSelectedVariants: (id: string, variants: SelectedVariant[]) => {
        const currentItem = get().items.find((i) => i._id === id);

        // 🚨 PREVENT LOOP: don't update if nothing changed
        const isSame =
          currentItem &&
          areVariantsEqual(currentItem.selectedVariants, variants);

        if (isSame) return;

        const updatedItems = get().items.map((i) =>
          i._id === id
            ? { ...i, selectedVariants: variants, synced: false }
            : i,
        );

        const updatedItem = updatedItems.find((i) => i._id === id);

        // Update local state first
        set({ items: updatedItems as any });
        const token = getBearerToken();

        if (!token) return; // 🚨 skip backend sync for guest users
        // Sync ONLY changed item
        if (updatedItem) {
          setTimeout(() => {
            addToCart([updatedItem as any])
              .then(() => {
                set({
                  items: get().items.map((i) =>
                    i._id === id ? { ...i, synced: true } : i,
                  ),
                });
              })
              .catch(() => {
                set({
                  syncQueue: [
                    ...get().syncQueue,
                    { type: "update", item: updatedItem as any },
                  ],
                });

                toast.error("Couldn't sync cart. Will retry.");
              });
          }, 300);
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
            i._id === id ? { ...i, selected: !i.selected } : i,
          ),
        }),

      setQuantity: (id: string, quantity: number) => {
        const updatedItems = get().items.map((i) =>
          i._id === id ? { ...i, quantity, synced: false } : i,
        );

        const updatedItem = updatedItems.find((i) => i._id === id);

        // Update local state first (instant UI)
        set({ items: updatedItems });

        const token = getBearerToken();

        if (!token) return; // 🚨 skip backend sync for guest users

        // Sync ONLY changed item
        if (updatedItem) {
          setTimeout(() => {
            addToCart([updatedItem])
              .then(() => {
                set({
                  items: get().items.map((i) =>
                    i._id === id ? { ...i, synced: true } : i,
                  ),
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
          }, 300);
        }
      },
      removeItem: async (id) => {
        try {
          set({ items: get().items.filter((i) => i._id !== id) });
          const token = getBearerToken();
          if (!token) return;
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
      removePurchasedItems: (ids: string[]) => {
        set({
          items: get().items.filter((item) => !ids.includes(item._id)),
        });
      },

      clearCart: () =>
        set({
          items: [],
          selectedLogistic: null,
        }),

      increaseQuantity: (id) => {
        const item = get().getItem(id);
        if (!item) return;

        get().setQuantity(
          id,
          Math.min(item.quantity + 1, item.stock || item.quantity + 1),
        );
      },

      decreaseQuantity: (id) => {
        const item = get().getItem(id);
        if (!item) return;

        get().setQuantity(id, Math.max(item.quantity - 1, 1));
      },
      orderSummary: () => {
        const items = get().items.filter((i) => i.selected);

        const itemEffectivePrice = (item: CartItem) => {
          if (!item.variantCombinations || !item.selectedVariants?.length) {
            return item.price;
          }

          const matchedCombo = item.variantCombinations.find((combo) =>
            combo.options.every((option) =>
              item.selectedVariants.some(
                (selected) =>
                  selected.name === option.name &&
                  selected.value === option.value,
              ),
            ),
          );

          return item.price + (matchedCombo?.additionalPrice ?? 0);
        };

        const total = items.reduce(
          (sum, i) => sum + itemEffectivePrice(i) * i.quantity,
          0,
        );

        const discount = items.reduce((sum, i) => {
          const unitPrice = itemEffectivePrice(i);
          const itemDiscount = i.flashSales
            ? calcDiscount(
                unitPrice,
                i.flashSales.discountValue,
                i.flashSales.discountType,
              )
            : 0;
          return sum + itemDiscount * i.quantity;
        }, 0);

        const appliedCoupon = get().appliedCoupon;
        let coupon = 0;

        if (appliedCoupon) {
          const discountedSubtotal = total - discount;

          if (appliedCoupon.type === "percent") {
            coupon = Math.round(
              (appliedCoupon.value / 100) * discountedSubtotal,
            );
          }

          if (appliedCoupon.type === "fixed") {
            coupon = Math.min(appliedCoupon.value, discountedSubtotal);
          }
        }

        // 👇 pull logistics from the global store
        const deliveryFee = get().selectedLogistic?.total ?? 0;

        return {
          total,
          discount,
          coupon,
          deliveryFee,
          finalTotal: total - discount - coupon + deliveryFee,
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
            // If it's a validation error (missing variants), don't retry
            if (err instanceof Error && err.message.includes("requires")) {
              toast.error(`Failed to sync: ${err.message}`);
              // Don't add to newQueue, remove the invalid action
              continue;
            }
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

      syncGuestCartOnLogin: async () => {
        const token = getBearerToken();
        if (!token) return;

        const items = get().items.filter((i) => !i.synced);

        if (items.length === 0) return;

        try {
          await addToCart(items);

          set({
            items: get().items.map((i) => ({ ...i, synced: true })),
            syncQueue: [],
          });
        } catch (error) {
          console.error("Cart merge failed", error);
        }
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
        syncQueue: state.syncQueue,
        selectedLogistic: state.selectedLogistic,
        requestToken: state.requestToken,
        checkoutStep: state.checkoutStep,
      }),
    },
  ),
);

// derived getter instead of in-store `get total()`
export const useCartTotal = () =>
  useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  );
