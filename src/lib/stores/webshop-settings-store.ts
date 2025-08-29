import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WebshopSettings, PaymentMethod } from '@/api/webshop-api';

interface WebshopSettingsState {
  // Settings data
  settings: WebshopSettings | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Actions
  setSettings: (settings: WebshopSettings) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSettings: () => void;
  
  // Computed getters
  getCurrency: () => string;
  getWebsitePaymentMethods: () => PaymentMethod[];
  getWebshopName: () => string;
  getWebshopLogo: () => string | null;
  
  // Utility methods
  isStale: (maxAgeMs?: number) => boolean;
  needsRefresh: () => boolean;
}

const DEFAULT_SETTINGS: WebshopSettings = {
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

export const useWebshopSettingsStore = create<WebshopSettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: null,
      isLoading: false,
      error: null,
      lastFetched: null,
      
      // Actions
      setSettings: (settings: WebshopSettings) => {
        set({
          settings,
          error: null,
          lastFetched: Date.now(),
          isLoading: false
        });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },
      
      clearSettings: () => {
        set({
          settings: null,
          error: null,
          lastFetched: null,
          isLoading: false
        });
      },
      
      // Computed getters
      getCurrency: () => {
        const { settings } = get();
        return settings?.currency || DEFAULT_SETTINGS.currency;
      },
      
      getWebsitePaymentMethods: () => {
        const { settings } = get();
        const paymentMethods = settings?.paymentMethods || DEFAULT_SETTINGS.paymentMethods;
        return paymentMethods.filter(method => method.availableIn.includes('website'));
      },
      
      getWebshopName: () => {
        const { settings } = get();
        return settings?.webshopName || DEFAULT_SETTINGS.webshopName;
      },
      
      getWebshopLogo: () => {
        const { settings } = get();
        return settings?.webshopLogo?.url || null;
      },
      
      // Utility methods
      isStale: (maxAgeMs = 5 * 60 * 1000) => { // Default 5 minutes
        const { lastFetched } = get();
        if (!lastFetched) return true;
        return Date.now() - lastFetched > maxAgeMs;
      },
      
      needsRefresh: () => {
        const { settings, isLoading, error } = get();
        return !settings && !isLoading && !error;
      }
    }),
    {
      name: 'webshop-settings-storage',
      partialize: (state) => ({
        settings: state.settings,
        lastFetched: state.lastFetched
      }),
    }
  )
);

// Selector hooks for easier usage
export const useWebshopCurrency = () => useWebshopSettingsStore(state => state.getCurrency());
export const useWebshopName = () => useWebshopSettingsStore(state => state.getWebshopName());
export const useWebshopLogo = () => useWebshopSettingsStore(state => state.getWebshopLogo());
export const useWebsitePaymentMethods = () => useWebshopSettingsStore(state => state.getWebsitePaymentMethods());

// Combined hook for loading state
export const useWebshopSettingsStatus = () => useWebshopSettingsStore(state => ({
  isLoading: state.isLoading,
  error: state.error,
  hasSettings: !!state.settings,
  needsRefresh: state.needsRefresh(),
  isStale: state.isStale()
}));
