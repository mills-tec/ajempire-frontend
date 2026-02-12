import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Notification } from "../types";
import { getUser } from "../api";

interface NotificationStore {
    notifications: Notification[];
    setNotifications: (notifications: Notification[]) => void;
    getUnreadNotifications: (userId: string) => number;
    updateNotification: (id: string, updates: any) => void;
    markAsRead: () => void;
    deleteNotification: (id: string) => void;
}


export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],

    setNotifications: (notifications) =>
        set({ notifications }),



    updateNotification: (id: string, updates: any) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n._id === id ? { ...n, ...updates } : n
            ),
        })),

    markAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
            ({
                ...n,
                readBy: [getUser()!._id]
            })
            ),
        })),

    deleteNotification: (id: string) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n._id !== id),
        })),

    getUnreadNotifications: (userId: string) =>
        get().notifications.filter((n) => !n.readBy.includes(userId)).length,
}));
