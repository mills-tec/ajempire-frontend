"use client";

import { useNotification } from "@/api/customHooks";
import { useSocket } from "@/app/components/providers/SocketProvider";
import { updateAdminPushNotification } from "@/lib/adminapi";
import { generateToken, messaging } from "@/lib/firebase";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { useNotificationStore } from "@/lib/stores/notification-store";
import type { Notification as AppNotification } from "@/lib/types";
import { onMessage } from "firebase/messaging";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function NotificationWrapper() {
  // Selector subscriptions — the old whole-store destructures re-rendered this
  // wrapper on every auth/cart/notification store mutation anywhere in the app.
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const registeredPushToken = useAuthStore((s) => s.registeredPushToken);
  const setRegisteredPushToken = useAuthStore((s) => s.setRegisteredPushToken);
  // Bumped by AuthContext.login() — admin auth lives in a React context this
  // component isn't nested under, so localStorage.getItem('adminToken') below
  // is otherwise only re-checked on the next mount/full page load.
  const adminTokenTick = useAuthStore((s) => s.adminTokenTick);
  const { updatePushToken } = useNotification();
  // useNotification returns a new function reference on every render; going
  // through a ref keeps the push-token effect from re-running per render.
  const updatePushTokenRef = useRef(updatePushToken);
  updatePushTokenRef.current = updatePushToken;
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const updateNotifications = useNotificationStore((s) => s.updateNotifications);
  const socket = useSocket();
  // Guards against re-entrant registration attempts (e.g. Strict Mode's
  // dev-only double-invoke of a fresh effect, or two dependency changes
  // landing before the previous async attempt has resolved). Set
  // synchronously before the first `await` below, so the second of two
  // back-to-back invocations always sees it and bails immediately.
  const isUpdatingToken = useRef(false);
  const pathname = usePathname();
  const isAdminRoute = pathname.includes("admin");

  // Firebase foreground message handler
  useEffect(() => {
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

  // Push token registration.
  //
  // `ownerKey` identifies *who* the token would be registered for — the
  // account, not the device. It's null whenever there's no one to register
  // for yet (logged out / no admin session), which is the only thing that
  // should ever fully block an attempt. The token itself is intentionally
  // NOT gated on route/mount/render churn: generateToken() is a cheap local
  // read of Firebase's own cached token (no network call to our backend),
  // so calling it often is fine — it's what lets a real token *rotation* be
  // noticed. The backend is only ever contacted after comparing the result
  // against what's already stored for this exact owner.
  useEffect(() => {
    const ownerKey = isAdminRoute
      ? (() => {
        const adminToken = localStorage.getItem("adminToken");
        return adminToken ? `admin:${adminToken}` : null;
      })()
      : isLoggedIn && userId
        ? `user:${userId}`
        : null;

    if (!ownerKey || isUpdatingToken.current) return;

    const registerPushToken = async () => {
      isUpdatingToken.current = true;

      try {
        const token = await generateToken();

        if (!token) {
          console.warn("Failed to generate FCM token");
          return;
        }

        // Same token, same owner as last time we told the backend — nothing
        // changed, so there's nothing to send. This is what makes remounts,
        // route changes, Strict Mode, rehydration, and plain re-renders all
        // no-ops instead of duplicate registrations.
        if (
          registeredPushToken?.token === token &&
          registeredPushToken?.ownerKey === ownerKey
        ) {
          return;
        }

        const success = isAdminRoute
          ? (await updateAdminPushNotification(token)).status
          : await updatePushTokenRef.current(token);

        if (success) {
          setRegisteredPushToken({ token, ownerKey });
        } else {
          console.warn("Server rejected push token update");
        }
      } catch (error) {
        console.error("Push token registration failed:", error);
      } finally {
        isUpdatingToken.current = false;
      }
    };

    registerPushToken();
  }, [
    isLoggedIn,
    userId,
    isAdminRoute,
    registeredPushToken,
    setRegisteredPushToken,
    adminTokenTick,
  ]);

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

  // Cart hydration — runs once per app boot, not on every `user`/route
  // change. This used to be keyed on `[user, ...]` and double as the
  // guest→auth cart-merge trigger, which was the root cause of the cart
  // sync bug: `user` gets a new object identity from several unrelated
  // places across the app (profile edits, other components re-calling
  // setUser with equivalent data, etc.), so this fired far more often than
  // "once per login" and each time blindly overwrote local state with
  // whatever the backend returned — discarding any local item the backend
  // didn't already know about. The actual guest→auth merge now happens
  // exactly once, imperatively, from each login success handler (see
  // useCartStore's hydrateFromBackend, which this also calls). This effect
  // only covers "an already-authenticated session was reopened" — a plain
  // reload with an existing token — and does nothing for guests, leaving
  // their locally persisted cart alone instead of clearing it.
  useEffect(() => {
    if (isAdminRoute) {
      useCartStore.getState().setCartLoaded(true);
      return;
    }
    void useCartStore.getState().hydrateFromBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
