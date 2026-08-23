"use client";

import { postData } from "@/api/api";
import { updateAdminPushNotification } from "@/lib/adminapi";
import { getBearerToken } from "@/lib/api";
import {
  getExistingPushToken,
  getNotificationPermission,
  requestPushPermissionAndToken,
} from "@/lib/firebase";
import { useAuthStore } from "@/lib/stores/auth-store";

// The ONE place push notifications get turned on. Asking for browser
// permission, obtaining the FCM token, saving it to the backend, and recording
// what we saved are a single indivisible operation — split across call sites
// they drift, and you end up prompting people who are already registered or
// re-POSTing a token the server already has.
//
// Every entry point (the automatic one in NotificationWrapper, the manual
// "Notifications" button in the account sidebar, anything added later) goes
// through registerPushToken below.

export type PushRegistrationOutcome =
  /** Token obtained and saved to the backend. */
  | "registered"
  /** Backend already holds this exact token for this account — no-op. */
  | "already-current"
  /** Blocked, either just now or previously. The browser won't re-prompt. */
  | "denied"
  /** Prompt was shown and closed without a choice. */
  | "dismissed"
  /** No Notification API, or FCM can't run here (insecure origin, iOS Safari tab). */
  | "unsupported"
  /** Nobody is signed in, so there's no account to attach the token to. */
  | "no-owner"
  /** Token obtained but the backend refused to store it. */
  | "failed";

type RegisterOptions = {
  /** Register against the admin account + admin endpoint instead of the shopper one. */
  isAdmin?: boolean;
  /**
   * "if-needed" (default) asks only when this device has no permission yet.
   * "always" goes through the permission request every time — for an explicit
   * user action like tapping "Notifications", where doing nothing visible
   * would feel broken. "never" registers silently only if permission already
   * exists, for background callers that shouldn't interrupt anyone.
   *
   * Worth knowing: the browser decides whether a prompt is actually drawn.
   * requestPermission() only renders UI while permission is "default" — once
   * someone has granted or blocked, it resolves instantly with their existing
   * answer and no site can re-ask. "always" therefore guarantees the request
   * is *made*, not that a dialog appears.
   */
  prompt?: "if-needed" | "always" | "never";
};

/**
 * Identifies WHO the token is for — the account, not the device. Null when
 * there's nobody to register for, which is the only hard blocker.
 */
const getOwnerKey = (isAdmin: boolean): string | null => {
  if (typeof window === "undefined") return null;

  if (isAdmin) {
    const adminToken = localStorage.getItem("adminToken");
    return adminToken ? `admin:${adminToken}` : null;
  }

  const { isLoggedIn, user } = useAuthStore.getState();
  return isLoggedIn && user?.id ? `user:${user.id}` : null;
};

const saveShopperPushToken = async (token: string): Promise<boolean> => {
  const bearer = getBearerToken();
  if (!bearer) return false;

  try {
    await postData(
      "/notification/savePushToken",
      { token },
      { headers: { Authorization: `Bearer ${bearer}` } },
    );
    return true;
  } catch (error) {
    console.error("Failed to save push token:", error);
    return false;
  }
};

// Serialises every caller onto one attempt. Without this the sidebar button
// and NotificationWrapper's effect could run concurrently and put two prompts
// (or two POSTs of the same token) in flight.
let inFlight: Promise<PushRegistrationOutcome> | null = null;

export async function registerPushToken({
  isAdmin = false,
  prompt = "if-needed",
}: RegisterOptions = {}): Promise<PushRegistrationOutcome> {
  if (inFlight) return inFlight;

  inFlight = (async (): Promise<PushRegistrationOutcome> => {
    const ownerKey = getOwnerKey(isAdmin);
    if (!ownerKey) return "no-owner";

    const permission = getNotificationPermission();
    if (permission === null) return "unsupported";
    if (permission === "denied") return "denied";

    // "default" means the browser holds no permission for this origin, so
    // nothing is actually registered on this device no matter what we may
    // have persisted previously.
    const undecided = permission === "default";
    if (undecided && prompt === "never") return "dismissed";

    // Go through the permission request whenever the caller asked to, or
    // whenever there's genuinely no decision on file yet. Otherwise read the
    // token silently — no UI, but still what catches a token rotation.
    const askForPermission = prompt === "always" || undecided;

    const token = askForPermission
      ? await requestPushPermissionAndToken()
      : await getExistingPushToken();

    if (!token) {
      // Distinguish "they said no" from "this browser can't do it" by
      // re-reading permission, which requestPermission() has now settled.
      const settled = getNotificationPermission();
      if (settled === "denied") return "denied";
      if (settled === "default") return "dismissed";
      return "unsupported";
    }

    const { registeredPushToken, setRegisteredPushToken } =
      useAuthStore.getState();

    // Same token, same owner as the last successful save — the backend is
    // already correct, so there is nothing to send.
    if (
      registeredPushToken?.token === token &&
      registeredPushToken?.ownerKey === ownerKey
    ) {
      return "already-current";
    }

    const saved = isAdmin
      ? (await updateAdminPushNotification(token)).status
      : await saveShopperPushToken(token);

    if (!saved) return "failed";

    setRegisteredPushToken({ token, ownerKey });
    return "registered";
  })();

  try {
    return await inFlight;
  } catch (error) {
    console.error("Push token registration failed:", error);
    return "failed";
  } finally {
    inFlight = null;
  }
}

/** User-facing copy for an outcome, or null when it warrants no message. */
export const describePushOutcome = (
  outcome: PushRegistrationOutcome,
): { type: "success" | "error" | "info"; message: string } | null => {
  switch (outcome) {
    case "registered":
      return { type: "success", message: "Notifications enabled" };
    case "already-current":
      return { type: "info", message: "Notifications are already enabled" };
    case "denied":
      return {
        type: "error",
        message:
          "Notifications are blocked. Enable them for this site in your browser settings.",
      };
    case "unsupported":
      return {
        type: "error",
        message: "This browser can't receive push notifications",
      };
    case "no-owner":
      return { type: "error", message: "Please sign in to enable notifications" };
    case "failed":
      return { type: "error", message: "Couldn't enable notifications. Please try again." };
    case "dismissed":
      // They closed the prompt without choosing — nagging adds nothing.
      return null;
  }
};
