'use client';

import React, { useEffect } from 'react';
import { useGlobalSettings } from '@/queries/global-settings';
import { useGlobalThemeStore } from '@/lib/stores/global-theme-store';
import { getCurrentShopId } from '@/api/webshop-api';

interface GlobalThemeProviderProps {
  children: React.ReactNode;
}

export function GlobalThemeProvider({ children }: GlobalThemeProviderProps) {
  const shopId = getCurrentShopId();
  const { data: globalSettings, isLoading, error } = useGlobalSettings(shopId);
  
  const { 
    setGlobalSettings, 
    setLoading, 
    setError, 
    needsRefresh,
    isStale 
  } = useGlobalThemeStore();

  // Sync React Query data with Zustand store
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (error) {
      setError(error.message);
    } else {
      setError(null);
    }
  }, [error, setError]);

  useEffect(() => {
    if (globalSettings) {
      setGlobalSettings(globalSettings);
    }
  }, [globalSettings, setGlobalSettings]);

  // Auto-refresh stale data
  useEffect(() => {
    if (needsRefresh() || isStale()) {
      // React Query will handle the refetch automatically
    }
  }, [needsRefresh, isStale]);

  return <>{children}</>;
}
