import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GlobalSettings } from '@/api/webshop-api';
import { ThemePreset } from '@/lib/builder-types';

interface GlobalThemeState {
  // Theme data
  globalSettings: GlobalSettings | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Actions
  setGlobalSettings: (settings: GlobalSettings) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearGlobalSettings: () => void;
  
  // Theme-specific getters
  getCurrentThemePreset: () => ThemePreset;
  getThemeColors: () => Record<string, string> | undefined;
  getDarkThemeColors: () => Record<string, string> | undefined;
  getFontSans: () => string | undefined;
  getFontSerif: () => string | undefined;
  getFontMono: () => string | undefined;
  getRadius: () => string | undefined;
  getSupportsDarkMode: () => boolean;
  getDefaultMode: () => string;
  
  // Utility methods
  isStale: (maxAgeMs?: number) => boolean;
  needsRefresh: () => boolean;
}

const DEFAULT_THEME_PRESET: ThemePreset = 'default';

export const useGlobalThemeStore = create<GlobalThemeState>()(
  persist(
    (set, get) => ({
      // Initial state
      globalSettings: null,
      isLoading: false,
      error: null,
      lastFetched: null,
      
      // Actions
      setGlobalSettings: (settings: GlobalSettings) => {
        set({
          globalSettings: settings,
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
      
      clearGlobalSettings: () => {
        set({
          globalSettings: null,
          error: null,
          lastFetched: null,
          isLoading: false
        });
      },
      
      // Theme-specific getters
      getCurrentThemePreset: () => {
        const { globalSettings } = get();
        return (globalSettings?.theme?.preset as ThemePreset) || DEFAULT_THEME_PRESET;
      },
      
      getThemeColors: () => {
        const { globalSettings } = get();
        return globalSettings?.theme?.colors;
      },
      
      getDarkThemeColors: () => {
        const { globalSettings } = get();
        return globalSettings?.theme?.darkColors;
      },
      
      getFontSans: () => {
        const { globalSettings } = get();
        return globalSettings?.theme?.fontSans;
      },
      
      getFontSerif: () => {
        const { globalSettings } = get();
        return globalSettings?.theme?.fontSerif;
      },
      
      getFontMono: () => {
        const { globalSettings } = get();
        return globalSettings?.theme?.fontMono;
      },
      
      getRadius: () => {
        const { globalSettings } = get();
        return globalSettings?.theme?.radius;
      },
      
      getSupportsDarkMode: () => {
        const { globalSettings } = get();
        return globalSettings?.theme?.supportsDarkMode ?? true;
      },
      
      getDefaultMode: () => {
        const { globalSettings } = get();
        return globalSettings?.theme?.defaultMode || 'light';
      },
      
      // Utility methods
      isStale: (maxAgeMs = 5 * 60 * 1000) => { // Default 5 minutes
        const { lastFetched } = get();
        if (!lastFetched) return true;
        return Date.now() - lastFetched > maxAgeMs;
      },
      
      needsRefresh: () => {
        const { globalSettings, isLoading, error } = get();
        return !globalSettings && !isLoading && !error;
      }
    }),
    {
      name: 'global-theme-storage',
      partialize: (state) => ({
        globalSettings: state.globalSettings,
        lastFetched: state.lastFetched
      }),
    }
  )
);

// Selector hooks for easier usage
export const useCurrentThemePreset = () => useGlobalThemeStore(state => state.getCurrentThemePreset());
export const useThemeColors = () => useGlobalThemeStore(state => state.getThemeColors());
export const useDarkThemeColors = () => useGlobalThemeStore(state => state.getDarkThemeColors());
export const useThemeFonts = () => useGlobalThemeStore(state => ({
  sans: state.getFontSans(),
  serif: state.getFontSerif(),
  mono: state.getFontMono()
}));
export const useThemeRadius = () => useGlobalThemeStore(state => state.getRadius());
export const useThemeDarkModeSupport = () => useGlobalThemeStore(state => ({
  supportsDarkMode: state.getSupportsDarkMode(),
  defaultMode: state.getDefaultMode()
}));

// Combined hook for loading state
export const useGlobalThemeStatus = () => useGlobalThemeStore(state => ({
  isLoading: state.isLoading,
  error: state.error,
  hasSettings: !!state.globalSettings,
  needsRefresh: state.needsRefresh(),
  isStale: state.isStale()
}));
