import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWebshopGlobalSettings, updateWebshopGlobalSettings, GlobalSettings } from '@/api/webshop-api';

export const GLOBAL_SETTINGS_QUERY_KEY = 'global-settings';

/**
 * Hook to fetch webshop global settings
 */
export function useGlobalSettings(shopId?: string) {
  return useQuery({
    queryKey: [GLOBAL_SETTINGS_QUERY_KEY, shopId],
    queryFn: () => getWebshopGlobalSettings(shopId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to update webshop global settings
 */
export function useUpdateGlobalSettings(shopId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: GlobalSettings) => updateWebshopGlobalSettings(updates, shopId),
    onSuccess: (data) => {
      // Update the cache with the new data
      queryClient.setQueryData([GLOBAL_SETTINGS_QUERY_KEY, shopId], data);
      
      // Invalidate to ensure fresh data on next fetch
      queryClient.invalidateQueries({ 
        queryKey: [GLOBAL_SETTINGS_QUERY_KEY, shopId] 
      });
    },
    onError: (error) => {
      console.error('Failed to update global settings:', error);
    },
  });
}

/**
 * Hook to get global settings with fallback values
 */
export function useGlobalSettingsWithFallback(shopId?: string): {
  settings: GlobalSettings;
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useGlobalSettings(shopId);

  const fallbackSettings: GlobalSettings = {
    theme: {
      preset: 'default',
      supportsDarkMode: true,
      defaultMode: 'light',
    }
  };

  return {
    settings: data || fallbackSettings,
    isLoading,
    error
  };
}
