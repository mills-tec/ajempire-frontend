"use client";

import { useNotification } from "@/api/customHooks";
import { useSocket } from "@/app/components/providers/SocketProvider";
import { updateAdminPushNotification } from "@/lib/adminapi";
import {
  getExistingPushToken,
  getNotificationPermission,
  messagingReady,
  requestPushPermissionAndToken,
} from "@/lib/firebase";
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
        if (window.Notification?.permission === "granted") {
          new window.Notification(payload.notification?.title || "Notification", {
            body: payload.notification?.body,
            icon: payload.notification?.icon || "/favicon.ico",
          });
        }
      });
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  // Push token registration.
  //
  // `ownerKey` identifies *who* the token would be registered for — the
  // account, not the device. It's null whenever there's no one to register
  // for yet (logged out / no admin session), which is the only thing that
  // should ever fully block an attempt.
  //
  // The user is only ever *prompted* when this device has no live push
  // permission yet ("default"). Once permission is granted the token is
  // re-read silently on each run — no prompt, no UI, but it's still what
  // lets a real token *rotation* be noticed. A hard "denied" stops
  // everything: the browser suppresses the prompt at that point anyway, so
  // asking again would only waste a call. The backend is only ever
  // contacted after comparing the token against what's already stored for
  // this exact owner, which is what makes remounts, route changes, Strict
  // Mode, rehydration, and plain re-renders no-ops rather than duplicate
  // registrations.
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

    const permission = getNotificationPermission();

    // No Notification API here, or the user has explicitly blocked us.
    if (permission === null || permission === "denied") return;

    // "default" means the browser holds no permission for this origin, so
    // there is definitively nothing registered on this device — prompt.
    // Anything we persisted for this owner previously can't still be live,
    // so it deliberately isn't consulted to suppress the prompt here.
    const needsPrompt = permission === "default";

    const registerPushToken = async () => {
      isUpdatingToken.current = true;

      try {
        const token = needsPrompt
          ? await requestPushPermissionAndToken()
          : await getExistingPushToken();

        // Dismissed/blocked the prompt, or the token couldn't be read.
        if (!token) return;

        // Same token, same owner as last time we told the backend — nothing
        // changed, so there's nothing to send.
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
