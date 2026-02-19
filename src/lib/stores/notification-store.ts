import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Notification } from "../types";
import { getUser } from "../api";

interface NotificationStore {
    notifications: Notification[];
    setNotifications: (notifications: Notification[]) => void;
    getUnreadNotifications: (userId: string) => number;
    markAsRead: (userId: string) => void;
    deleteNotification: (id: string) => void;
    updateNotifications: (notification: Notification) => void;
}


export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],

    setNotifications: (notifications) =>
        set({ notifications }),

    updateNotifications: (notification: Notification) =>
        set((state) => ({ notifications: [notification, ...state.notifications] })),


    markAsRead: (userId: string) => {
        set((state) => {
            let changed = false;

            const updated = state.notifications.map((n) => {
                const alreadyRead = n.readBy.some(
                    (r) => r.userId.toString() === userId
                );

                if (alreadyRead) return n;

                changed = true;

                return {
                    ...n,
                    readBy: [...n.readBy, { userId }],
                };
            });

            if (!changed) return state; // 🚨 Prevent unnecessary update

            return { notifications: updated };
        });
    },


    deleteNotification: (id: string) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n._id !== id),
        })),

    getUnreadNotifications: (userId: string) =>
        get().notifications.filter((n) => !n.readBy.find((r) => r.userId === userId)).length,
}));
