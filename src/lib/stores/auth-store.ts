import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthStore = {
  isLoggedIn: boolean;
  user: User | null;
  setIsLoggedIn: (logged_in: boolean) => void;
  setUser: (user: User) => void;
};

interface User {
  name: string;
  email: string;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      setIsLoggedIn: (logged_in: boolean) => set({ isLoggedIn: logged_in }),
      setUser: (user: User) => set({ user }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
      }), // only persist items
    }
  )
);
