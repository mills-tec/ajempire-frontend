"use client";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  Messaging,
} from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDCob-leU6BtYdfjR0CoAYHdo1Dl-bIQQM",
  authDomain: "aj-empire-project-1ff70.firebaseapp.com",
  projectId: "aj-empire-project-1ff70",
  storageBucket: "aj-empire-project-1ff70.firebasestorage.app",
  messagingSenderId: "979966867892",
  appId: "1:979966867892:web:f253c0209786c1348c5ae1",
  measurementId: "G-TXVDN58E4F",
};

const VAPID_KEY =
  "BOiu5BhVBfLOqYVGwldGoURG45XxqmB2ttp0K90dXleQxFANcqfzDvLjqEJ23ROExB9Xd7Z4ljAvrs5kY9EyjVg";

const app = initializeApp(firebaseConfig);
export let messaging: Messaging | null = null;

// Exported so callers can await FCM support being resolved instead of
// reading the `messaging` binding above synchronously — on a cold load
// that binding is still null while isSupported() is in flight.
export const messagingReady: Promise<Messaging | null> =
  typeof window !== "undefined"
    ? isSupported().then((supported) => {
      if (supported) {
        messaging = getMessaging(app);
      }
      return messaging;
    })
    : Promise.resolve(null);

/**
 * The browser's current permission, or null when the Notification API
 * isn't available at all (SSR, insecure origin, unsupported browser).
 *
 * "default" means the browser holds no permission for this origin — so
 * there is no live push subscription on this device, whatever we may have
 * recorded server-side previously.
 */
export const getNotificationPermission = (): NotificationPermission | null => {
  if (typeof window === "undefined" || !("Notification" in window)) return null;
  return window.Notification.permission;
};

/**
 * Reads the FCM token WITHOUT ever showing a permission prompt.
 *
 * Returns null unless permission is already granted, so this is the safe
 * call to make on every mount: it's a local read of Firebase's cached
 * token, which is what lets a token *rotation* be noticed without
 * bothering the user. Asking for permission is the other function's job.
 */
export const getExistingPushToken = async (): Promise<string | null> => {
  if (getNotificationPermission() !== "granted") return null;

  const m = await messagingReady;
  if (!m) return null;

  try {
    return await getToken(m, { vapidKey: VAPID_KEY });
  } catch (err) {
    console.error("Failed to read FCM token:", err);
    return null;
  }
};

/**
 * Shows the browser's permission prompt, then returns the token if granted.
 *
 * Only call this when the device has nothing registered yet — it is the one
 * path that can put a prompt in front of the user. FCM support is confirmed
 * *before* prompting, so we never ask for a permission this browser can't
 * actually deliver on (the previous version prompted first and only then
 * discovered messaging was unsupported).
 */
export const requestPushPermissionAndToken = async (): Promise<string | null> => {
  if (getNotificationPermission() === null) return null;

  const m = await messagingReady;
  if (!m) {
    console.warn("Firebase messaging not supported in this browser");
    return null;
  }

  const permission = await window.Notification.requestPermission();
  if (permission !== "granted") return null;

  try {
    return await getToken(m, { vapidKey: VAPID_KEY });
  } catch (err) {
    console.error("Failed to get FCM token:", err);
    return null;
  }
};
