import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthStore = {
  isLoggedIn: boolean;
  user: User | null;
  isPushTokenSet: boolean;
  setIsLoggedIn: (logged_in: boolean) => void;
  setUser: (user: User) => void;
  setIsPushTokenSet: (isPushTokenSet: boolean) => void;
  // Admin login lives in AuthContext (React context, scoped to /admin/*),
  // which NotificationWrapper — mounted in the root layout, outside that
  // provider — can't subscribe to. This tick is a provider-agnostic signal
  // AuthContext bumps on login so NotificationWrapper's push-token effect
  // re-runs immediately instead of waiting for the next full page load.
  adminTokenTick: number;
  bumpAdminTokenTick: () => void;
};

interface User {
  name: string;
  email: string;
  id: string;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      setIsLoggedIn: (logged_in: boolean) => set({ isLoggedIn: logged_in }),
      setUser: (user: User) => set({ user }),
      isPushTokenSet: false,
      setIsPushTokenSet: (val: boolean) => set({ isPushTokenSet: val }),
      adminTokenTick: 0,
      bumpAdminTokenTick: () =>
        set((state) => ({ adminTokenTick: state.adminTokenTick + 1 })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        isPushTokenSet: state.isPushTokenSet,
      }), // only persist items — adminTokenTick is an in-memory signal only
    },
  ),
);
