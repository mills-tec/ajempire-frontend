import { create } from "zustand";
import { AdminNotificationRecord } from "../admin-types";

interface AdminNotificationStore {
  notifications: AdminNotificationRecord[];
  setNotifications: (notifications: AdminNotificationRecord[]) => void;
  updateNotifications: (notification: AdminNotificationRecord) => void;
  markAsRead: (id: string, adminId: string) => void;
  markAllAsRead: (adminId: string) => void;
}

// Admin counterpart to useNotificationStore (src/lib/stores/notification-store.ts) —
// filled by AdminNotificationWrapper's REST fetch and live socket push.
export const useAdminNotificationStore = create<AdminNotificationStore>((set) => ({
  notifications: [],

  setNotifications: (notifications) => set({ notifications }),

  updateNotifications: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),

  // Optimistic — callers pair this with the markAdminNotificationAsRead /
  // markAllAdminNotificationsAsRead API calls that persist it.
  markAsRead: (id, adminId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id && !(n.readBy ?? []).some((r) => r.adminId === adminId)
          ? { ...n, readBy: [...(n.readBy ?? []), { adminId }] }
          : n
      ),
    })),

  markAllAsRead: (adminId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        (n.readBy ?? []).some((r) => r.adminId === adminId)
          ? n
          : { ...n, readBy: [...(n.readBy ?? []), { adminId }] }
      ),
    })),
}));
