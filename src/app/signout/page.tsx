"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function SignOut() {
  const { setIsLoggedIn } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Only drop the session credential — see NotificationWrapper's push-token
    // effect: a blanket clear also wiped the persisted isPushTokenSet flag.
    localStorage.removeItem("ajempire_signin_user");
    sessionStorage.clear();
    setIsLoggedIn(false);
    router.push("/");
    toast.success("Signout successful");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <></>;
}
