'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthActions } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  readonly children: React.ReactNode;
  readonly redirectTo?: string;
  readonly requireAuth?: boolean;
}

export function ProtectedRoute({ children, redirectTo = '/auth/login', requireAuth = true }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthActions();
  const { isLoading } = useAuthActions();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
      } else if (!requireAuth && isAuthenticated) {
        // Redirect authenticated users away from auth pages
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router, redirectTo]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render children if auth requirements aren't met
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}