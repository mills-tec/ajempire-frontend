import { create } from "zustand";
import { persist } from "zustand/middleware";

// The FCM token itself is tied to the browser/device, not the account —
// the same device can (and does) register it for different accounts, e.g.
// a shared browser used by a regular user and later an admin, or one user
// logging out and a different one logging in without a full page reload.
// A bare boolean ("have we ever registered anything?") can't express that,
// so instead of `isPushTokenSet` we record *which token* was last sent to
// the backend and *for whom* — "user:<id>" or "admin:<adminAuthToken>" —
// and only call the backend again when either half of that pair changes.
type RegisteredPushToken = {
  token: string;
  ownerKey: string;
};

type AuthStore = {
  isLoggedIn: boolean;
  user: User | null;
  registeredPushToken: RegisteredPushToken | null;
  setIsLoggedIn: (logged_in: boolean) => void;
  setUser: (user: User) => void;
  setRegisteredPushToken: (value: RegisteredPushToken | null) => void;
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
      registeredPushToken: null,
      setRegisteredPushToken: (value: RegisteredPushToken | null) =>
        set({ registeredPushToken: value }),
      adminTokenTick: 0,
      bumpAdminTokenTick: () =>
        set((state) => ({ adminTokenTick: state.adminTokenTick + 1 })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        registeredPushToken: state.registeredPushToken,
      }), // only persist items — adminTokenTick is an in-memory signal only
    },
  ),
);
