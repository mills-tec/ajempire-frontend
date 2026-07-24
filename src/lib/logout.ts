"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "sonner";
export function logout(router: { push: (path: string) => void }) {
  if (typeof window !== "undefined") {
    // Only drop the session credential. A blanket localStorage.clear() also
    // wiped isPushTokenSet (persisted under "auth-storage"), which made every
    // logout+login cycle look like a brand-new device and re-register a push
    // token with the backend even though this device already had one.
    localStorage.removeItem("ajempire_signin_user");
    sessionStorage.clear();
  }

  const { setIsLoggedIn } = useAuthStore.getState(); // ✅ correct way outside component

  setIsLoggedIn(false);

  router.push("/");

  toast.success("Signout successful", { position: "top-right" });
}
