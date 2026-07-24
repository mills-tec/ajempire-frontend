'use client';

import Spinner from '@/app/components/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!token) {
        router.push('/admin-login');

      }

      if (user) {
        if (user?.role !== "super") {
          if (!user?.permissions.includes("manage_users") && pathname.includes("customers")) {
            router.push('/admin');
            return;
          }
          if (!user?.permissions.includes("manage_orders") && pathname.includes("orders")) {
            router.push('/admin');
            return;
          }
          if (!user.permissions.includes("manage_products") && (pathname.includes("inventory") || pathname.includes("categories"))) {
            router.push('/admin');
            return;
          }
          if (!user.permissions.includes("manage_promo") && pathname.includes("promotions")) {
            router.push('/admin');
            return;
          }
          if (!user.permissions.includes("manage_returns") && pathname.includes("returns")) {
            router.push('/admin');
            return;
          }
          if (!user.permissions.includes("manage_content") && pathname.includes("content-management")) {
            router.push('/admin');
            return;
          }
        }
      }
    }
  }, [token, isLoading, pathname, router, user]);



  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!token || !user) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};

export default ProtectedRoute;
