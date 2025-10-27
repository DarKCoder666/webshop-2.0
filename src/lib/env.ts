import { env } from 'next-runtime-env';

/**
 * Get runtime environment variable (works in both server and client)
 * This function retrieves environment variables at runtime, not build time
 */
export function getEnv(key: string, fallback?: string): string {
  // Try runtime env first (works on client side)
  const runtimeValue = env(key);
  if (runtimeValue) return runtimeValue;
  
  // Fallback to process.env (works on server side)
  if (typeof process !== 'undefined' && process.env[key]) {
    return process.env[key]!;
  }
  
  return fallback || '';
}

/**
 * Get API URL from environment
 */
export function getApiUrl(): string {
  return getEnv('NEXT_PUBLIC_API_URL', 'http://localhost:8080');
}

/**
 * Get Shop ID from environment
 */
export function getShopId(): string {
  return getEnv('NEXT_PUBLIC_SHOP_ID', '60f7b3b3b3b3b3b3b3b3b3b3');
}

/**
 * Get Base URL from environment
 */
export function getBaseUrl(): string {
  return getEnv('NEXT_PUBLIC_BASE_URL', 'https://yourwebsite.com');
}

