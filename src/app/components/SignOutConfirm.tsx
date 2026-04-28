"use client";

import { useModalStore } from "@/lib/stores/modal-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
export default function SignOutConfirm() {
  const closeModal = useModalStore((s) => s.closeModal);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    closeModal();

    setTimeout(() => {
      // ✅ Remove auth tokens only
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        useAuthStore.setState({
          user: null,
          isLoggedIn: false,
        });
      }

      // ✅ Update auth store
      const { setIsLoggedIn } = useAuthStore.getState();
      setIsLoggedIn(false);

      // ✅ Redirect
      router.push("/");

      toast.success("Sign out successful", { position: "top-right" });
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-poppins">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={closeModal}
      />
      <div className="relative bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl animate-scaleIn">
        <h2 className="text-lg font-semibold mb-2">Sign out?</h2>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to sign out of your account?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-md border hover:scale-105 active:scale-90"
          >
            No
          </button>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-primaryhover text-white hover:scale-105 active:scale-90"
          >
            {loading ? "Signing out..." : "Yes, Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
}
