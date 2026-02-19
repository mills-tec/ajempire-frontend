"use client";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { useAuthStore } from "./stores/auth-store";
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
  measurementId: "G-TXVDN58E4F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export let messaging: any = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}
export const generateToken = async () => {
  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    const token = await getToken(messaging, { vapidKey: "BOiu5BhVBfLOqYVGwldGoURG45XxqmB2ttp0K90dXleQxFANcqfzDvLjqEJ23ROExB9Xd7Z4ljAvrs5kY9EyjVg" });
    // useAuthStore.getState().setPushToken(token);
    return token;
  }
}