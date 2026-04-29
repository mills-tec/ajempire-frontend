"use client";
import Pusher from "pusher-js";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useNotification } from "@/api/customHooks";
import { generateToken, messaging } from "@/lib/firebase";
import { useNotificationStore } from "@/lib/stores/notification-store";
import { onMessage } from "firebase/messaging";

export default function NotificationWrapper() {
  const { user, isPushTokenSet, setIsPushTokenSet, isLoggedIn } =
    useAuthStore();
  const { updatePushToken } = useNotification();
  const { updateNotifications } = useNotificationStore();
  const pusherRef = useRef<Pusher | null>(null);
  const [isMounted, setIsMounted] = useState(false);

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
        // authEndpoint: "/api/pusher/auth",
      });
    }
    if (!user) return;
    const pusher = pusherRef.current;

    const publicChannel = pusher.subscribe("public-channel");
    const privateChannel = pusher.subscribe(`private-${user.id}`);

    const handler = (data: { message: string }) => {
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
    setIsMounted(true);
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

  // updating user firebase push token if not set
  // Save push token once
  useEffect(() => {
    if (!isMounted) return;
    if (!isPushTokenSet) {
      if (!user) return;
      (async () => {
        const token = await generateToken();

        const req = await updatePushToken(token!);
        if (req) setIsPushTokenSet(true);
      })();
    }
  }, [isMounted]);

  return null;
}
