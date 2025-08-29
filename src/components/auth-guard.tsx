'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status on mount
    const initAuth = async () => {
      await checkAuth();
      setIsInitialized(true);
    };
    
    initAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Redirect to login if not authenticated and fully initialized
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isInitialized, isLoading, isAuthenticated, router]);

  // Show loading state while checking authentication
  if (!isInitialized || isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      )
    );
  }

  // Show nothing while redirecting to login
  if (!isAuthenticated) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}

interface ServerAuthGuardProps {
  children: React.ReactNode;
}

/**
 * Server-side auth guard that can be used in server components
 * This should be used in combination with server-side auth checking
 */
export async function ServerAuthGuard({ children }: ServerAuthGuardProps) {
  // For server-side auth checking, we'll implement this with server actions
  // For now, we'll just render children and let client-side handle auth
  return <AuthGuard>{children}</AuthGuard>;
}
