"use client";

import Pusher from "pusher-js";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useNotification } from "@/api/customHooks";
import { generateToken, messaging } from "@/lib/firebase";
import { useNotificationStore } from "@/lib/stores/notification-store";
import { onMessage } from "firebase/messaging";
import { CartItem, useCartStore } from "@/lib/stores/cart-store";
import { Product } from "@/lib/admin-types";
import { fetchFromCart } from "@/lib/api";
import type { Notification as AppNotification } from "@/lib/types";

export default function NotificationWrapper() {
  const { user, isPushTokenSet, setIsPushTokenSet } = useAuthStore();
  const { updatePushToken } = useNotification();
  const { setCartItems } = useCartStore();
  const { updateNotifications } = useNotificationStore();
  const pusherRef = useRef<Pusher | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const isUpdatingToken = useRef(false);

  // Pusher setup
  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER;

    if (!pusherKey || !pusherCluster) {
      console.warn(
        "Pusher keys missing: set NEXT_PUBLIC_PUSHER_APP_KEY and NEXT_PUBLIC_PUSHER_APP_CLUSTER",
      );
      return;
    }

    if (!pusherRef.current) {
      pusherRef.current = new Pusher(pusherKey, {
        cluster: pusherCluster,
        forceTLS: true,
      });
    }

    if (!user) return;
    const pusher = pusherRef.current;

    const publicChannel = pusher.subscribe("public-channel");
    const privateChannel = pusher.subscribe(`private-${user.id}`);

    const handler = (data: { message: AppNotification }) => {
      updateNotifications(data.message);
    };

    publicChannel.bind("new-notification", handler);
    privateChannel.bind("new-notification", handler);

    return () => {
      publicChannel.unbind("new-notification", handler);
      privateChannel.unbind("new-notification", handler);
      pusher.unsubscribe("public-channel");
      pusher.unsubscribe(`private-${user.id}`);
    };
  }, [user, updateNotifications]);

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
    if (!isMounted || !user || isPushTokenSet || isUpdatingToken.current) return;

    const registerPushToken = async () => {
      isUpdatingToken.current = true;

      try {
        const token = await generateToken();
        if (!token) {
          console.warn("Failed to generate FCM token");
          return;
        }

        const success = await updatePushToken(token);
        
        // Only mark as set if server confirms it
        if (success) {
          setIsPushTokenSet(true);
        } else {
          console.warn("Server rejected push token update");
          // Token will be retried on next mount since isPushTokenSet remains false
        }
      } catch (error) {
        console.error("Push token registration failed:", error);
        // Don't set isPushTokenSet — allows retry on next mount/session
      } finally {
        isUpdatingToken.current = false;
      }
    };

    registerPushToken();
  }, [isMounted, user, isPushTokenSet, setIsPushTokenSet, updatePushToken]);

  // Cart hydration — only when user is available
  useEffect(() => {
    if (!user) {
      setCartItems([]);
      return;
    }

    const loadCart = async () => {
      try {
        const res = await fetchFromCart();
        if (!res?.message?.items) {
          setCartItems([]);
          return;
        }

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
          }) => ({
            ...item.product,
            quantity: item.qty,
            selected: true,
            name: item.product.name,
            basePrice: item.price,
            discount: item.discount,
            finalPrice: item.finalPrice,
            selectedVariants: item.variants?.options ?? [],
          }),
        );

        setCartItems(items);
      } catch (error) {
        console.error("Failed to load cart:", error);
        setCartItems([]);
      }
    };

    loadCart();
  }, [user, setCartItems]);

  return null;
}