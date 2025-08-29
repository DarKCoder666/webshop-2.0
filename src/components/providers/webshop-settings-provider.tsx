'use client';

import React, { useEffect } from 'react';
import { useWebshopSettingsWithFallback } from '@/queries/webshop-settings';
import { useWebshopSettingsStore } from '@/lib/stores/webshop-settings-store';
import { getCurrentShopId } from '@/api/webshop-api';

interface WebshopSettingsProviderProps {
  children: React.ReactNode;
  shopId?: string;
}

/**
 * Provider component that loads webshop settings and syncs them with the Zustand store
 */
export function WebshopSettingsProvider({ children, shopId }: WebshopSettingsProviderProps) {
  const currentShopId = shopId || getCurrentShopId();
  const { settings, isLoading, error } = useWebshopSettingsWithFallback(currentShopId);
  
  const {
    setSettings,
    setLoading,
    setError,
    isStale,
    needsRefresh
  } = useWebshopSettingsStore();

  // Sync React Query state with Zustand store
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
    if (settings && !isLoading) {
      setSettings(settings);
    }
  }, [settings, isLoading, setSettings]);

  // Auto-refresh stale data
  useEffect(() => {
    if (needsRefresh() || isStale()) {
      // The useWebshopSettingsWithFallback hook will automatically refetch
      // when the component mounts or when the query becomes stale
    }
  }, [needsRefresh, isStale]);

  return <>{children}</>;
}

/**
 * Hook to get webshop settings from the store with automatic loading
 */
export function useWebshopSettings() {
  const store = useWebshopSettingsStore();
  
  return {
    settings: store.settings,
    isLoading: store.isLoading,
    error: store.error,
    currency: store.getCurrency(),
    webshopName: store.getWebshopName(),
    webshopLogo: store.getWebshopLogo(),
    websitePaymentMethods: store.getWebsitePaymentMethods(),
    isStale: store.isStale(),
    needsRefresh: store.needsRefresh(),
  };
}
