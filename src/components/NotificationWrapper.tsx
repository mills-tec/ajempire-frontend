"use client";

import { useSocket } from "@/app/components/providers/SocketProvider";
import { messagingReady } from "@/lib/firebase";
import { registerPushToken } from "@/lib/pushNotifications";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { useNotificationStore } from "@/lib/stores/notification-store";
import type { Notification as AppNotification } from "@/lib/types";
import { onMessage } from "firebase/messaging";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function NotificationWrapper() {
  // Selector subscriptions — the old whole-store destructures re-rendered this
  // wrapper on every auth/cart/notification store mutation anywhere in the app.
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  // Read only to re-run the registration effect once a save lands; the token
  // itself is compared inside registerPushToken.
  const registeredPushToken = useAuthStore((s) => s.registeredPushToken);
  // Bumped by AuthContext.login() — admin auth lives in a React context this
  // component isn't nested under, so the admin token is otherwise only
  // re-checked on the next mount/full page load.
  const adminTokenTick = useAuthStore((s) => s.adminTokenTick);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const updateNotifications = useNotificationStore((s) => s.updateNotifications);
  const socket = useSocket();
  const pathname = usePathname();
  const isAdminRoute = pathname.includes("admin");

  // Firebase foreground message handler.
  //
  // Awaits messagingReady rather than reading the module-level `messaging`
  // binding synchronously: that binding is only assigned once the async
  // isSupported() check resolves, so on a cold load this effect used to see
  // null, bail, and — with its empty dep array — never attach the handler
  // at all. Foreground pushes were silently dropped as a result.
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    void messagingReady.then((m) => {
      if (!m || cancelled) return;

      unsubscribe = onMessage(m, (payload) => {
        if (typeof window === "undefined") return;
        if (window.Notification?.permission !== "granted") return;

        // Read both shapes: the backend currently sends a `notification`
        // payload, but data-only is what the service worker prefers (see
        // firebase-messaging-sw.js) and this keeps working through that
        // switch instead of silently rendering "Notification" with no body.
        const data = payload.data ?? {};

        new window.Notification(
          payload.notification?.title ?? data.title ?? "Notification",
          {
            body: payload.notification?.body ?? data.body,
            // /favicon.ico doesn't exist in this project — only favicon.png.
            icon: payload.notification?.icon ?? data.icon ?? "/favicon.png",
            // FCM delivers a foreground message to EVERY visible tab, so
            // without a shared tag someone with three tabs open gets three
            // copies of it. Same tag replaces rather than stacks.
            tag: data.tag ?? data.notificationId ?? "ajempire-notification",
          },
        );
      });
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  // Automatic push registration on load. All of the actual work — permission,
  // token, backend save, recording what was saved — lives in
  // registerPushToken (src/lib/pushNotifications.ts), shared with the manual
  // "Notifications" control in the account sidebar. It no-ops cheaply when
  // there's nobody signed in, when permission is blocked, or when the backend
  // already holds this exact token, so re-running it on these dependencies is
  // safe; it also serialises internally, so this can't race the sidebar
  // button into showing two prompts.
  useEffect(() => {
    void registerPushToken({ isAdmin: isAdminRoute });
  }, [isLoggedIn, userId, isAdminRoute, registeredPushToken, adminTokenTick]);

  // Socket.IO — user notifications (non-admin routes only).
  //
  // Consumes the single shared connection from SocketProvider instead of
  // opening its own — the provider re-authenticates that same socket
  // whenever `user` changes, which is what triggers the "connect" below.
  //
  // Mirrors the backend contract: the client emits `get:userNotifications`
  // and the server replies on `userNotifications` with the full list, then
  // pushes individual new ones on `new-notification`. The emit is wired to
  // "connect" (not just fired once) because the provider disconnects and
  // reconnects the socket to re-auth on login, so at effect time it is
  // usually still connecting — the `socket.connected` call below only
  // covers the already-connected case.
  useEffect(() => {
    if (isAdminRoute || !user || !socket) return;


    // Live push from server (e.g. new order, flash sale)
    const handleNewNotification = (notification: AppNotification) => {
      // console.log(notification.message);
      updateNotifications(notification);
    };

    const handleConnectError = (err: Error) => {
      console.error("Socket connection error:", err.message);
    };


    // socket.on("userNotifications", handleUserNotifications);
    socket.on("get:userNotifications", handleNewNotification);
    socket.on("connect_error", handleConnectError);

    return () => {
      // socket.off("userNotifications", handleUserNotifications);
      socket.off("get:userNotifications", handleNewNotification);
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
