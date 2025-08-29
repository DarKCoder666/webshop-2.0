import { useQuery } from '@tanstack/react-query';
import { getWebshopSettings, WebshopSettings } from '@/api/webshop-api';

export const WEBSHOP_SETTINGS_QUERY_KEY = 'webshop-settings';

/**
 * Hook to fetch webshop settings
 */
export function useWebshopSettings(shopId?: string) {
  return useQuery({
    queryKey: [WEBSHOP_SETTINGS_QUERY_KEY, shopId],
    queryFn: () => getWebshopSettings(shopId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to get webshop settings with fallback values
 */
export function useWebshopSettingsWithFallback(shopId?: string): {
  settings: WebshopSettings;
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useWebshopSettings(shopId);

  const fallbackSettings: WebshopSettings = {
    currency: 'USD',
    paymentMethods: [
      {
        name: 'Cash',
        availableIn: ['cashbox', 'telegram', 'website'],
        removable: false
      },
      {
        name: 'Card',
        availableIn: ['cashbox', 'telegram', 'website'],
        removable: false
      }
    ],
    webshopName: 'My Online Store',
    webshopLogo: null
  };

  return {
    settings: data || fallbackSettings,
    isLoading,
    error
  };
}
