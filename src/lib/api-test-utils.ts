/**
 * API Testing and Debugging Utilities
 * These functions can be called from browser console or used in development
 */

import { 
  loadSiteConfig, 
  saveSiteConfig, 
  getAllLayouts, 
  getLayoutById, 
  createLayout, 
  getCurrentShopId 
} from '@/api/webshop-api';
import { SiteConfig } from './builder-types';

// Global object for browser console debugging
declare global {
  interface Window {
    webshopApiDebug: {
      loadConfig: () => Promise<SiteConfig>;
      saveConfig: (config: SiteConfig) => Promise<SiteConfig>;
      getAllLayouts: () => Promise<unknown[]>;
      getLayout: (id: string) => Promise<unknown>;
      createTestLayout: () => Promise<unknown>;
      getCurrentShopId: () => string;
      testConnection: () => Promise<boolean>;
    };
  }
}

/**
 * Test API connection
 */
export async function testApiConnection(): Promise<boolean> {
  try {
    await getAllLayouts();
    return true;
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
}

/**
 * Create a test layout for debugging
 */
export async function createTestLayout() {
  const testConfig: SiteConfig = {
    id: 'test',
    name: 'Test Configuration',
    blocks: [
      {
        id: 'test-block-1',
        type: 'heroSection',
        props: {
          title: 'Test Hero Section',
          subtitle: 'This is a test configuration',
          description: 'Testing the new API integration',
        },
      },
    ],
    theme: {
      preset: 'default',
      colors: {
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(240 10% 3.9%)',
        card: 'hsl(0 0% 100%)',
        cardForeground: 'hsl(240 10% 3.9%)',
        popover: 'hsl(0 0% 100%)',
        popoverForeground: 'hsl(240 10% 3.9%)',
        primary: 'hsl(240 5.9% 10%)',
        primaryForeground: 'hsl(0 0% 98%)',
        secondary: 'hsl(240 4.8% 95.9%)',
        secondaryForeground: 'hsl(240 5.9% 10%)',
        muted: 'hsl(240 4.8% 95.9%)',
        mutedForeground: 'hsl(240 3.8% 46.1%)',
        accent: 'hsl(240 4.8% 95.9%)',
        accentForeground: 'hsl(240 5.9% 10%)',
        destructive: 'hsl(0 84.2% 60.2%)',
        destructiveForeground: 'hsl(0 0% 98%)',
        border: 'hsl(240 5.9% 90%)',
        input: 'hsl(240 5.9% 90%)',
        ring: 'hsl(240 5.9% 10%)',
        chart1: 'hsl(12 76% 61%)',
        chart2: 'hsl(173 58% 39%)',
        chart3: 'hsl(197 37% 24%)',
        chart4: 'hsl(43 74% 66%)',
        chart5: 'hsl(27 87% 67%)',
        sidebar: 'hsl(0 0% 100%)',
        sidebarForeground: 'hsl(240 5.3% 26.1%)',
        sidebarPrimary: 'hsl(240 5.9% 10%)',
        sidebarPrimaryForeground: 'hsl(0 0% 98%)',
        sidebarAccent: 'hsl(240 4.8% 95.9%)',
        sidebarAccentForeground: 'hsl(240 5.9% 10%)',
        sidebarBorder: 'hsl(220 13% 91%)',
        sidebarRing: 'hsl(217.2 32.6% 17.5%)'
      },
      radius: '0.5rem',
    },
  };

  try {
    const result = await createLayout('home', testConfig);
    return result;
  } catch (error) {
    console.error('❌ Failed to create test layout:', error);
    throw error;
  }
}

/**
 * Log current configuration for debugging
 */
export async function logCurrentConfig() {
  try {
    const config = await loadSiteConfig();
    return config;
  } catch (error) {
    console.error('Failed to load current config:', error);
    throw error;
  }
}

/**
 * Log all layouts for debugging
 */
export async function logAllLayouts() {
  try {
    const layouts = await getAllLayouts();
    return layouts;
  } catch (error) {
    console.error('Failed to load all layouts:', error);
    throw error;
  }
}

/**
 * Initialize debugging tools in browser console
 * Call this in development to access webshop API from browser console
 */
export function initializeDebugTools() {
  if (typeof window !== 'undefined') {
    window.webshopApiDebug = {
      loadConfig: loadSiteConfig,
      saveConfig: saveSiteConfig,
      getAllLayouts: getAllLayouts,
      getLayout: getLayoutById,
      createTestLayout: createTestLayout,
      getCurrentShopId: getCurrentShopId,
      testConnection: testApiConnection,
    };
  }
}

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    initializeDebugTools();
  }
}
