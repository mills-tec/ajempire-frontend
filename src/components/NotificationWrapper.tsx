"use client";
import Pusher from "pusher-js";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useNotification } from "@/api/customHooks";
import { generateToken, messaging } from "@/lib/firebase";
import { useNotificationStore } from "@/lib/stores/notification-store";
import { onMessage } from "firebase/messaging";

export default function NotificationWrapper() {
  const { user, isPushTokenSet, setIsPushTokenSet } = useAuthStore();
  const { updatePushToken } = useNotification();
  const { updateNotifications } = useNotificationStore();
  const pusherRef = useRef<Pusher | null>(null);

  // Save push token once
  useEffect(() => {
    (async () => {
      const token = await generateToken();
      if (!user || !isPushTokenSet) return;
      const req = await updatePushToken(token!);
      if (req) setIsPushTokenSet(true);
    })();

    if (!pusherRef.current) {
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
        forceTLS: true,
        // authEndpoint: "/api/pusher/auth",
      });
    }
    if (!user) return;
    const pusher = pusherRef.current;

    const publicChannel = pusher.subscribe("public-channel");
    const privateChannel = pusher.subscribe(`private-${user.id}`);

    const handler = (data: any) => {
      updateNotifications(data.message);
    };

    publicChannel.bind("new-notification", handler);
    privateChannel.bind("new-notification", handler);

    return () => {
      pusher.unsubscribe("public-channel");
      pusher.unsubscribe(`private-${user.id}`);
    };
  }, [user]);

  useEffect(() => {
    if (!messaging) return; // ✅ prevent crash

    const unsubscribe = onMessage(messaging, (payload) => {
      if (Notification.permission === "granted") {
        new Notification(payload.notification?.title || "Notification", {
          body: payload.notification?.body,
          icon: payload.notification?.icon || "/favicon.ico",
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
