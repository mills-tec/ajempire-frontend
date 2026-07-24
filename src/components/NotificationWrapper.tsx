"use client";

import { useNotification } from "@/api/customHooks";
import { useSocket } from "@/app/components/providers/SocketProvider";
import { Product } from "@/lib/admin-types";
import { updateAdminPushNotification } from "@/lib/adminapi";
import { fetchFromCart } from "@/lib/api";
import { generateToken, messaging } from "@/lib/firebase";
import { useAuthStore } from "@/lib/stores/auth-store";
import { CartItem, useCartStore } from "@/lib/stores/cart-store";
import { useNotificationStore } from "@/lib/stores/notification-store";
import type { Notification as AppNotification } from "@/lib/types";
import { onMessage } from "firebase/messaging";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const socket = useSocket();
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
          if (updateAdminToken.status) {
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
  // Consumes the single shared connection from SocketProvider instead of
  // opening its own — the provider re-authenticates that same socket
  // whenever `user` changes, which is what triggers the "connect" below.
  useEffect(() => {
    if (isAdminRoute || !user || !socket) return;

    const requestNotifications = () => {
      socket.emit("get:userNotifications");
    };

    const handleUserNotifications = ({ notifications }: { notifications: AppNotification[]; unreadCount: number }) => {
      setNotifications(notifications);
    };

    // Live push from server (e.g. new order, flash sale)
    const handleNewNotification = (notification: AppNotification) => {
      updateNotifications(notification);
    };

    const handleConnectError = (err: Error) => {
      console.error("Socket connection error:", err.message);
    };

    if (socket.connected) requestNotifications();
    socket.on("connect", requestNotifications);
    socket.on("userNotifications", handleUserNotifications);
    socket.on("new-notification", handleNewNotification);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", requestNotifications);
      socket.off("userNotifications", handleUserNotifications);
      socket.off("new-notification", handleNewNotification);
      socket.off("connect_error", handleConnectError);
    };
  }, [user, isAdminRoute, socket, setNotifications, updateNotifications]);

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
