'use client';

import { AdminProfile } from '@/lib/admin-types';
import { fetchAdminProfile } from '@/lib/adminapi';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useRouter } from 'next/navigation';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';




interface AuthContextType {
  user: AdminProfile | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  getProfile: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getProfile = useCallback(async () => {
    const response = await fetchAdminProfile();
    const profile = response.data || (typeof response.message !== 'string' ? response.message : undefined);
    if (!profile) return;
    setUser((prevUser) => {
      const newUser: AdminProfile = {
        id: prevUser?.id ?? (profile as any)._id,
        name: profile.name!,
        email: profile.email,
        role: profile.role!,
        permissions: profile.permissions,
        active: profile.active

      };

      localStorage.setItem('adminUser', JSON.stringify(newUser));
      return newUser;
    });

  }, []);

  const login = useCallback((newToken: string) => {
    setToken(newToken);
    localStorage.setItem('adminToken', newToken);
    // NotificationWrapper can't see this context (it's mounted outside
    // AuthProvider, in the root layout) — this nudges its push-token effect
    // to re-check localStorage immediately instead of only on next reload.
    useAuthStore.getState().bumpAdminTokenTick();
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin-login');
  }, [router]);

  useEffect(() => {
    // Check for existing auth on mount
    const storedToken = localStorage.getItem('adminToken');

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    getProfile()
      .catch((error) => {
        console.error('Error fetching admin profile:', error);
        logout();
      })
      .finally(() => setIsLoading(false));
  }, [getProfile]);

  const value = useMemo(
    () => ({ user, token, login, logout, getProfile, isLoading }),
    [user, token, login, logout, getProfile, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
