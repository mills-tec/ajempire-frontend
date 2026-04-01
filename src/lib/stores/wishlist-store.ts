import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { Product } from "../types";
import {
  addToWishlistAPI,
  getBearerToken,
  getUsersWishlist,
  removeFromWishlistAPI,
} from "../api";
import { useModalStore } from "./modal-store";

type WishlistItem = Product;

type WishlistStore = {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
  retrySync: () => Promise<void>;
  initWishlist: () => Promise<void>;
};

type WishlistSyncOperation = {
  type: "add" | "remove";
  id: string;
};

const getWishlistSyncQueue = (): WishlistSyncOperation[] =>
  JSON.parse(localStorage.getItem("wishlist-sync") || "[]");

const setWishlistSyncQueue = (queue: WishlistSyncOperation[]) => {
  localStorage.setItem("wishlist-sync", JSON.stringify(queue));
};

const promptWishlistAuth = () => {
  toast.error("Please sign in to use your wishlist");
  useModalStore.getState().openModal("authwrapper");
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      // 🔥 Fetch wishlist from server ONCE
      initWishlist: async () => {
        const token = getBearerToken();
        if (!token) {
          set({ items: [] });
          return;
        }

        try {
          const data = await getUsersWishlist();
          if (!data) return;

          const products = data.message.map((item) => item.product);

          // data.items should be an array of products
          set({ items: products || [] });
        } catch (err) {
          console.error("Failed to load wishlist:", err);
        }
      },

      addItem: async (item) => {
        if (!getBearerToken()) {
          promptWishlistAuth();
          return;
        }

        if (get().isInWishlist(item._id)) {
          toast.info("Already in wishlist");
          
          return;
        }

        const updated = [...get().items, item];
        set({ items: updated });

        try {
          await addToWishlistAPI(item._id);
          toast.success("Added to wishlist");
        } catch (err) {
          toast.error("Couldn't sync wishlist");
          console.error("addItem error:", err);

          const queue = getWishlistSyncQueue();
          queue.push({ type: "add", id: item._id });
          setWishlistSyncQueue(queue);
        }
      },

      removeItem: async (id) => {
        if (!getBearerToken()) {
          promptWishlistAuth();
          return;
        }

        set({ items: get().items.filter((i) => i._id !== id) });

        try {
          await removeFromWishlistAPI(id);
          toast.success("Removed from wishlist");
        } catch (err) {
          toast.error("Couldn't sync removal");
          console.error("removeItem error:", err);

          const queue = getWishlistSyncQueue();
          queue.push({ type: "remove", id });
          setWishlistSyncQueue(queue);
        }
      },

      isInWishlist: (id) => get().items.some((i) => i._id === id),

      clearWishlist: () => set({ items: [] }),

      retrySync: async () => {
        if (!getBearerToken()) return;

        const queue = getWishlistSyncQueue();
        if (!queue.length) return;

        const remaining: WishlistSyncOperation[] = [];
        for (const op of queue) {
          try {
            if (op.type === "add") await addToWishlistAPI(op.id);
            if (op.type === "remove") await removeFromWishlistAPI(op.id);
          } catch {
            remaining.push(op);
          }
        }

        setWishlistSyncQueue(remaining);
      },
    }),
    {
      name: "wishlist-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
