import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addToCart, fetchFromCart, getBearerToken, removeCartItem } from "../api";
import { buildCartItem, type AddCartItemInput } from "../cart/buildCartItem";
import { Product } from "../types";
import { calcDiscount } from "../utils";

export const areVariantsEqual = (
  v1?: SelectedVariant[] | null,
  v2?: SelectedVariant[] | null,
): boolean => {
  const arr1 = v1 ?? [];
  const arr2 = v2 ?? [];
  if (arr1.length !== arr2.length) return false;
  const map = new Map(arr1.map((v) => [v.name, v.value]));
  return arr2.every((v) => map.get(v.name) === v.value);
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
  basePrice: number; 
  discount: number; 
  finalPrice: number
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
  delivery_eta_time?: string;
  delivery_eta: string;
  total: number;
}

export enum CheckoutStep {
  ADDRESS_FORM,
  PAYMENT_METHOD,
  LOGISTICS,
  ORDER_SUMMARY,
}

type SyncAction =
  | { type: "add"; item: CartItem }
  | { type: "remove"; id: string }
  | { type: "update"; item: CartItem };

// Tracks pending debounced sync timeouts per item — cleared before each new schedule
const pendingSyncTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

type BackendCartItem = {
  product: Product;
  price: number;
  discount: number;
  finalPrice: number;
  qty: number;
  variants?: { options: SelectedVariant[] };
};

// Single in-flight guard shared across every caller (login handlers, the
// one-time app-boot check) — whichever calls first actually hits the
// network; anyone else calling while it's running gets the same promise
// back instead of racing it with a second fetch/upload sequence.
let hydrateInFlight: Promise<void> | null = null;

function backendItemToCartItem(
  backendItem: BackendCartItem,
  localMatch: CartItem | undefined,
): CartItem {
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
  const coverImage = backendItem.product.cover_image?.startsWith("/")
    ? `${backendBase}${backendItem.product.cover_image}`
    : backendItem.product.cover_image;

  return {
    ...(localMatch ?? {}),
    ...backendItem.product,
    cover_image: coverImage,
    quantity: backendItem.qty,
    selected: localMatch?.selected ?? true,
    basePrice: backendItem.price,
    discount: backendItem.discount,
    finalPrice: backendItem.finalPrice,
    selectedVariants: backendItem.variants?.options ?? [],
    synced: true,
  } as CartItem;
}

type CartStore = {
  isLogisticsMode: boolean;
  setIsLogisticsMode: (isLogisticsMode: boolean) => void;
  items: CartItem[];
  selectedItem: Product | null; // this stores the product for the product card that has been clicked on for the popup
  syncQueue: SyncAction[]; // item ids pending server sync
  setSelectedItem: (id: Product) => void; // this sets the id for the product card that has been clicked on for the popup
  addItem: (items: AddCartItemInput[]) => void;
  setCartItems: (items: CartItem[]) => void;
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
  // Fetches the backend cart and reconciles it with whatever's currently
  // local. Local items already marked `synced` are assumed to already be
  // reflected on the backend and are left alone; only unsynced items (the
  // guest-cart case) get merged in — matching backend quantities summed,
  // not duplicated — and uploaded. Idempotent and safe to call from
  // multiple places (see `hydrateInFlight` above): call it once per login,
  // plus once on app boot for an already-authenticated session.
  hydrateFromBackend: () => Promise<void>;
  cartLoaded: boolean;
  setCartLoaded: (v: boolean) => void;
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
      setCartItems: (items: CartItem[]) => set({ items }),
      addItem: (incoming) => {
        const validItems: CartItem[] = [];

        for (const input of incoming) {
          const result = buildCartItem(input);
          if (!result.ok) {
            toast.error(result.error);
            continue;
          }
          validItems.push(result.item);
        }

        if (validItems.length === 0) return;

        let current = get().items;

        for (const item of validItems) {
          const existing = current.find(
            (i) =>
              i._id === item._id &&
              areVariantsEqual(i.selectedVariants, item.selectedVariants),
          );

          current = existing
            ? current.map((i) =>
                i._id === item._id &&
                areVariantsEqual(i.selectedVariants, item.selectedVariants)
                  ? { ...i, quantity: i.quantity + item.quantity, synced: false }
                  : i,
              )
            // New cart entries always start selected — matches every
            // add-to-cart / buy-again / buy-now call site in the app.
            : [...current, { ...item, selected: true, synced: false }];
        }

        set({ items: current });

        if (!getBearerToken()) return;
        console.log(validItems);
        addToCart(validItems).catch(() => {
          toast.error("Couldn't sync cart. Will retry.");
        });
      },


      setSelectedVariants: (id: string, variants: SelectedVariant[]) => {
        const items = get().items;
        const currentItem = items.find((i) => i._id === id);

        if (
          currentItem &&
          areVariantsEqual(currentItem.selectedVariants, variants)
        )
          return;

        const updatedItems = items.map((i) =>
          i._id === id
            ? { ...i, selectedVariants: variants, synced: false }
            : i,
        );
        const updatedItem = updatedItems.find((i) => i._id === id);

        // Update local state first
        set({ items: updatedItems });

        if (!getBearerToken() || !updatedItem) return;

        clearTimeout(pendingSyncTimeouts.get(`variant:${id}`));
        pendingSyncTimeouts.set(
          `variant:${id}`,
          setTimeout(() => {
            pendingSyncTimeouts.delete(`variant:${id}`);
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
          }, 300),
        );
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

        set({ items: updatedItems });

        if (!getBearerToken() || !updatedItem) return;

        clearTimeout(pendingSyncTimeouts.get(`qty:${id}`));
        pendingSyncTimeouts.set(
          `qty:${id}`,
          setTimeout(() => {
            pendingSyncTimeouts.delete(`qty:${id}`);
            addToCart([updatedItem])
              .then(() => {
                set({
                  items: get().items.map((i) =>
                    i._id === id ? { ...i, synced: true } : i,
                  ),
                });
              })
              .catch((err: Error) => {
                if (err.message.includes("null")) {
                  set({ items: get().items.filter((i) => i._id !== id) });
                  toast.error("An item was removed from your cart because it no longer exists.");
                  return;
                }
                set({
                  syncQueue: [
                    ...get().syncQueue,
                    { type: "update", item: updatedItem },
                  ],
                });
                toast.error("Couldn't sync cart. Will retry.");
              });
          }, 300),
        );
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i._id !== id) });
        if (!getBearerToken()) return;
        removeCartItem(id).catch(() => {
          set({ syncQueue: [...get().syncQueue, { type: "remove", id }] });
          toast.error("Couldn't sync cart. Will retry.");
        });
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
        const itemEffectivePrice = (item: CartItem) => item.basePrice;

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

      cartLoaded: false,
      setCartLoaded: (v) => set({ cartLoaded: v }),

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
            if (err instanceof Error && err.message.includes("null")) {
              const itemId = action.type === "remove" ? action.id : action.item._id;
              set({ items: get().items.filter((i) => i._id !== itemId) });
              toast.error("An item was removed from your cart because it no longer exists.");
              continue;
            }
            // If it's a validation error (missing variants), don't retry
            if (err instanceof Error && err.message.includes("requires")) {
              toast.error(`Failed to sync: ${err.message}`);
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

      hydrateFromBackend: async () => {
        if (hydrateInFlight) return hydrateInFlight;

        const token = getBearerToken();
        if (!token) {
          // Guest: nothing to fetch — leave whatever's persisted locally
          // alone rather than clearing it.
          set({ cartLoaded: true });
          return;
        }

        hydrateInFlight = (async () => {
          set({ cartLoaded: false });

          try {
            const initialRes = await fetchFromCart();
            const backendItems: BackendCartItem[] =
              initialRes?.message?.items ?? [];
            const localItems = get().items;
            const unsynced = localItems.filter((i) => !i.synced);

            let finalItems = backendItems;

            if (unsynced.length > 0) {
              const toUpload = unsynced.map((local) => {
                const match = backendItems.find(
                  (bi) =>
                    bi.product._id === local._id &&
                    areVariantsEqual(
                      bi.variants?.options,
                      local.selectedVariants,
                    ),
                );
                const summedQty = match
                  ? match.qty + local.quantity
                  : local.quantity;
                const cap = local.stock || match?.product.stock;
                return {
                  ...local,
                  quantity: cap ? Math.min(summedQty, cap) : summedQty,
                };
              });

              await addToCart(toUpload);
              // Re-fetch rather than assume the upload response mirrors the
              // full cart shape — the backend is the single source of truth
              // for the post-merge state (price/discount/finalPrice, etc.).
              const refreshed = await fetchFromCart();
              finalItems = refreshed?.message?.items ?? backendItems;
            }

            const merged = finalItems.map((bi) =>
              backendItemToCartItem(
                bi,
                localItems.find(
                  (li) =>
                    li._id === bi.product._id &&
                    areVariantsEqual(li.selectedVariants, bi.variants?.options),
                ),
              ),
            );

            // syncQueue is deliberately left untouched — it holds actions
            // that failed to reach the backend (e.g. a removeItem dropped
            // by a network blip) and is already retried independently via
            // retrySync (see provider.tsx: on `online` + a 60s interval).
            // Clearing it here would silently discard a pending action that
            // never actually landed, just because we happened to re-fetch.
            set({ items: merged });
          } catch (error) {
            console.error("Cart sync failed:", error);
            toast.error("Couldn't sync your cart. It'll retry automatically.");
          } finally {
            set({ cartLoaded: true });
            hydrateInFlight = null;
          }
        })();

        return hydrateInFlight;
      },
    }),
    {
      name: "cart-storage",
      // checkoutStep is deliberately NOT persisted: the modal flow always
      // starts from the address step, and rehydrating a stale ORDER_SUMMARY
      // step caused an instant redirect the moment the modal opened.
      partialize: (state) => ({
        items: state.items,
        syncQueue: state.syncQueue,
        selectedLogistic: state.selectedLogistic,
        requestToken: state.requestToken,
      }),
    },
  ),
);

// derived getter instead of in-store `get total()`
export const useCartTotal = () =>
  useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  );
