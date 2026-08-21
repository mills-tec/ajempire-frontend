"use client";

import { useSocket } from "@/app/components/providers/SocketProvider";
import { useAuth } from "@/contexts/AuthContext";
import type { AdminNotificationRecord } from "@/lib/admin-types";
import { getAdminNotification } from "@/lib/adminapi";
import { useAdminNotificationStore } from "@/lib/stores/admin-notification-store";
import { useEffect } from "react";

// Admin counterpart to src/components/NotificationWrapper.tsx (user side).
// Mounted inside admin/layout.tsx — nested under AuthProvider/ProtectedRoute
// and therefore under the root layout's <SocketProvider> — rather than the
// root layout itself, so useSocket() here resolves to the real shared
// connection instead of SocketContext's default null (which is what
// NotificationWrapper gets, since it's rendered as a sibling of
// <Providers><SocketProvider>, outside that tree).
export default function AdminNotificationWrapper() {
  const { token } = useAuth();
  const setNotifications = useAdminNotificationStore((s) => s.setNotifications);
  const updateNotifications = useAdminNotificationStore((s) => s.updateNotifications);
  const socket = useSocket();

  // Initial fetch — REST counterpart to the user side's
  // useNotification().getNotifications(), called once an admin session exists.
  useEffect(() => {
    if (!token) return;

    (async () => {
      const response = await getAdminNotification();
      if (!response.status) {
        return;
      }
      const notifications = Array.isArray(response.message) ? response.message : null;

      if (response.status && notifications) {
        setNotifications(notifications);
      }
    })();
  }, [token, setNotifications]);

  // Socket.IO — live admin notifications. Mirrors NotificationWrapper's
  // "get:userNotifications" / "userNotifications" / "new-notification" trio
  // with an admin-scoped event namespace (SocketProvider authenticates this
  // same shared connection with the admin token while on admin routes).
  useEffect(() => {
    if (!token || !socket) return;

    // Live push from server (e.g. new order, low stock, pending return).
    // addAdminNotification (backend) emits `{ notification }`, not the bare
    // record — this was the actual bug: the handler used to treat the
    // wrapper object itself as the notification.
    const handleNewNotification = ({ notification }: { notification: AdminNotificationRecord }) => {
      updateNotifications(notification);
    };

    const handleConnectError = (err: Error) => {
      console.error("Admin socket connection error:", err.message);
    };

    socket.on("new-admin-notification", handleNewNotification);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("new-admin-notification", handleNewNotification);
      socket.off("connect_error", handleConnectError);
    };
  }, [token, socket, setNotifications, updateNotifications]);

  return null;
}
