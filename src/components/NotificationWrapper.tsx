"use client";

import { useNotification } from "@/api/customHooks";
import { Product } from "@/lib/admin-types";
import { updateAdminPushNotification } from "@/lib/adminapi";
import { fetchFromCart, getBearerToken } from "@/lib/api";
import { generateToken, messaging } from "@/lib/firebase";
import { useAuthStore } from "@/lib/stores/auth-store";
import { CartItem, useCartStore } from "@/lib/stores/cart-store";
import { useNotificationStore } from "@/lib/stores/notification-store";
import type { Notification as AppNotification } from "@/lib/types";
import { onMessage } from "firebase/messaging";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function NotificationWrapper() {
  // Selector subscriptions — the old whole-store destructures re-rendered this
  // wrapper on every auth/cart/notification store mutation anywhere in the app.
  const user = useAuthStore((s) => s.user);
  const isPushTokenSet = useAuthStore((s) => s.isPushTokenSet);
  const setIsPushTokenSet = useAuthStore((s) => s.setIsPushTokenSet);
  const { updatePushToken } = useNotification();
  // useNotification returns a new function reference on every render; going
  // through a ref keeps the push-token effect from re-running per render.
  const updatePushTokenRef = useRef(updatePushToken);
  updatePushTokenRef.current = updatePushToken;
  const setCartItems = useCartStore((s) => s.setCartItems);
  const setCartLoaded = useCartStore((s) => s.setCartLoaded);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const updateNotifications = useNotificationStore((s) => s.updateNotifications);
  const socketRef = useRef<Socket | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const isUpdatingToken = useRef(false);
  const pathname = usePathname();
  const isAdminRoute = pathname.includes("admin");

  // Firebase foreground message handler
  useEffect(() => {
    setIsMounted(true);

    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      if (typeof window === "undefined") return;
      if (window.Notification?.permission === "granted") {
        new window.Notification(payload.notification?.title || "Notification", {
          body: payload.notification?.body,
          icon: payload.notification?.icon || "/favicon.ico",
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Push token registration
  useEffect(() => {
    if (!isAdminRoute) {
      if (!isMounted || !user || isPushTokenSet || isUpdatingToken.current) return;
    } else {
      if (isPushTokenSet || !localStorage.getItem('adminToken')) return;
    }

    const registerPushToken = async () => {
      isUpdatingToken.current = true;

      try {
        const token = await generateToken();

        if (!token) {
          console.warn("Failed to generate FCM token");
          return;
        }

        if (!isAdminRoute) {
          const success = await updatePushTokenRef.current(token);
          if (success) {
            setIsPushTokenSet(true);
          } else {
            console.warn("Server rejected push token update");
          }
        } else {
          const updateAdminToken = await updateAdminPushNotification(token);
          if (updateAdminToken.success) {
            setIsPushTokenSet(true);
          } else {
            console.warn("Server rejected push token update");
          }
        }
      } catch (error) {
        console.error("Push token registration failed:", error);
      } finally {
        isUpdatingToken.current = false;
      }
    };

    registerPushToken();
  }, [isMounted, user, isPushTokenSet, isAdminRoute, setIsPushTokenSet]);

  // Socket.IO — user notifications (non-admin routes only)
  useEffect(() => {
    if (isAdminRoute || !user) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ;
    if (!backendUrl) return;

    const token = getBearerToken();
    if (!token) return;

    const socket = io(backendUrl, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("get:userNotifications");
    });

    socket.on("userNotifications", ({ notifications }: { notifications: AppNotification[]; unreadCount: number }) => {
      // console.log(notifications);
      setNotifications(notifications);
    });

    // Live push from server (e.g. new order, flash sale)
    socket.on("new-notification", (notification: AppNotification) => {
      updateNotifications(notification);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, isAdminRoute, setNotifications, updateNotifications]);

  // Cart hydration (non-admin routes only)
  useEffect(() => {
    if (isAdminRoute) return;

    if (!user) {
      setCartItems([]);
      setCartLoaded(true);
      return;
    }

    const loadCart = async () => {
      try {
        const res = await fetchFromCart();
        if (!res?.message?.items) {
          setCartItems([]);
          return;
        }

        const localItems = useCartStore.getState().items;
        const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

        const items: CartItem[] = res.message.items.map(
          (item: {
            product: Product;
            price: number;
            discount: number;
            finalPrice: number;
            qty: number;
            variants?: {
              options: { name: string; value: string }[];
            };
          }) => {
            const localItem = localItems.find((i) => i._id === item.product._id);
            const coverImage = item.product.cover_image?.startsWith("/")
              ? `${backendBase}${item.product.cover_image}`
              : item.product.cover_image;
            return {
              ...(localItem ?? {}),
              ...item.product,
              cover_image: coverImage,
              quantity: item.qty,
              selected: localItem?.selected ?? true,
              name: item.product.name,
              basePrice: item.price,
              discount: item.discount,
              finalPrice: item.finalPrice,
              selectedVariants: item.variants?.options ?? [],
            };
          },
        );

        setCartItems(items);
      } catch (error) {
        console.error("Failed to load cart:", error);
        setCartItems([]);
      } finally {
        setCartLoaded(true);
      }
    };

    loadCart();
  }, [user, isAdminRoute, setCartItems, setCartLoaded]);

  return null;
}
