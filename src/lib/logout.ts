"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "sonner";
export function logout(router: any) {
  if (typeof window !== "undefined") {
    localStorage.clear();
    sessionStorage.clear();
  }

  const { setIsLoggedIn } = useAuthStore.getState(); // ✅ correct way outside component

  setIsLoggedIn(false);

  router.push("/");

  toast.success("Signout successful", { position: "top-right" });
}
