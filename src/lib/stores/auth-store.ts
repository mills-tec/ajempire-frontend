import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthStore = {
  isLoggedIn: boolean;
  user: User | null;
  isPushTokenSet: boolean;
  setIsLoggedIn: (logged_in: boolean) => void;
  setUser: (user: User) => void;
  setIsPushTokenSet: (isPushTokenSet: boolean) => void;
};

interface User {
  name: string;
  email: string;
  id: string;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      setIsLoggedIn: (logged_in: boolean) => set({ isLoggedIn: logged_in }),
      setUser: (user: User) => set({ user }),
      isPushTokenSet: false,
      setIsPushTokenSet: (isPushTokenSet: boolean) => set({ isPushTokenSet }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        isPushTokenSet: state.isPushTokenSet,
      }), // only persist items
    }
  )
);
