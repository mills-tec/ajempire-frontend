"use client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function SignOut() {
  const { setIsLoggedIn, setUser } = useAuthStore();
  const { clearCart } = useCartStore()
  const router = useRouter();

  useEffect(() => {

    // Only drop the session credential — see NotificationWrapper's push-token
    // effect: a blanket clear also wiped the persisted isPushTokenSet flag.
    clearCart();
    localStorage.removeItem("ajempire_signin_user");
    sessionStorage.clear();
    setIsLoggedIn(false);
    setUser({ email: "", id: "", name: "" })
    router.push("/");
    toast.success("Signout successful");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <></>;
}
