'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/app/components/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!token || !user) {
        router.push('/admin-login');
      } else if (user.role?.toLowerCase() === 'junior') {
        const isAllowed = pathname === '/admin' || pathname.startsWith('/admin/inventory') || pathname.startsWith('/admin/add-product');
        if (!isAllowed) {
          router.push('/admin');
        }
      }
    }
  }, [token, user, isLoading, pathname, router]);

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
