"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { QueryClient, useQueryClient } from "@tanstack/react-query";

export function logout(router: any) {
  const queryClient = useQueryClient();
  // clear storage
  localStorage.clear();

  // update auth store
  useAuthStore.getState().setIsLoggedIn(false);
// ✅ real instance
    queryClient.clear();
  // navigate AFTER state settles
  router.push("/");
}