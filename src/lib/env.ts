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
 * Validate that a required environment variable is set
 */
function validateEnv(key: string, value: string, defaultValue: string): void {
  const isServerSide = typeof window === 'undefined';
  
  // Only warn in production if using default values
  if (value === defaultValue && process.env.NODE_ENV === 'production' && isServerSide) {
    console.warn(
      `⚠️  Warning: Environment variable ${key} is not set. Using default value: ${defaultValue}\n` +
      `   This may cause issues in production. Please set ${key} in your environment.\n` +
      `   See RUNTIME_ENV.md for more information.`
    );
  }
}

/**
 * Get API URL from environment
 * Falls back to localhost in development
 * 
 * On server-side (SSR), uses BACKEND_KUBE_URL if available (for Kubernetes internal networking)
 * On client-side (browser), always uses NEXT_PUBLIC_API_URL
 */
export function getApiUrl(): string {
  const isServerSide = typeof window === 'undefined';
  
  // For server-side requests in Kubernetes, use internal cluster URL if available
  if (isServerSide) {
    const kubeUrl = process.env.BACKEND_KUBE_URL;
    if (kubeUrl) {
      console.log('Using internal Kubernetes URL for server-side API calls:', kubeUrl);
      return kubeUrl;
    }
  }
  
  // For client-side or when BACKEND_KUBE_URL is not set, use public URL
  const defaultValue = process.env.NODE_ENV === 'production' 
    ? '' // No default in production - force explicit configuration
    : 'http://localhost:8080';
  
  const apiUrl = getEnv('NEXT_PUBLIC_API_URL', defaultValue);
  
  // Validate in production
  if (process.env.NODE_ENV === 'production' && !apiUrl) {
    const errorMsg = 
      '❌ CRITICAL: NEXT_PUBLIC_API_URL is not set in production!\n' +
      '   Your application will not be able to communicate with the backend.\n' +
      '   Please set NEXT_PUBLIC_API_URL environment variable.\n' +
      '   See RUNTIME_ENV.md for configuration instructions.';
    
    if (isServerSide) {
      console.error(errorMsg);
    }
    
    // Return localhost as last resort to prevent crashes
    return 'http://localhost:8080';
  }
  
  validateEnv('NEXT_PUBLIC_API_URL', apiUrl, defaultValue);
  return apiUrl;
}

/**
 * Get the backend Kubernetes internal URL (server-side only)
 * This should only be used for internal cluster communication
 */
export function getBackendKubeUrl(): string | undefined {
  if (typeof window !== 'undefined') {
    console.warn('getBackendKubeUrl() should only be called on the server-side');
    return undefined;
  }
  
  return process.env.BACKEND_KUBE_URL;
}

/**
 * Get Shop ID from environment
 * Falls back to a placeholder ID in development
 */
export function getShopId(): string {
  const defaultValue = '';
  const shopId = getEnv('NEXT_PUBLIC_SHOP_ID', defaultValue);
  
  validateEnv('NEXT_PUBLIC_SHOP_ID', shopId, defaultValue);
  return shopId;
}

/**
 * Get Base URL from environment
 * Used for SEO and sitemap generation
 */
export function getBaseUrl(): string {
  const defaultValue = process.env.NODE_ENV === 'production'
    ? ''
    : 'http://localhost:3000';
  
  const baseUrl = getEnv('NEXT_PUBLIC_BASE_URL', defaultValue);
  
  // In production, try to infer from request if not set
  if (process.env.NODE_ENV === 'production' && !baseUrl) {
    console.warn(
      '⚠️  Warning: NEXT_PUBLIC_BASE_URL is not set in production.\n' +
      '   This may affect SEO and sitemap generation.\n' +
      '   Please set NEXT_PUBLIC_BASE_URL environment variable.'
    );
    return 'https://yourwebsite.com';
  }
  
  validateEnv('NEXT_PUBLIC_BASE_URL', baseUrl, defaultValue);
  return baseUrl;
}

/**
 * Validate all required environment variables on startup
 * Call this in your root layout or application entry point
 */
export function validateEnvironment(): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === 'production';
  const isServerSide = typeof window === 'undefined';
  
  // Check API URL
  const apiUrl = getEnv('NEXT_PUBLIC_API_URL');
  if (isProduction && !apiUrl) {
    errors.push('NEXT_PUBLIC_API_URL is required in production');
  }
  
  // Check Shop ID
  const shopId = getEnv('NEXT_PUBLIC_SHOP_ID');
  if (!shopId) {
    if (isProduction) {
      errors.push('NEXT_PUBLIC_SHOP_ID must be set to your actual shop ID in production');
    }
  }
  
  // Check Base URL for production
  const baseUrl = getEnv('NEXT_PUBLIC_BASE_URL');
  if (isProduction && (!baseUrl || baseUrl === 'https://yourwebsite.com')) {
    errors.push('NEXT_PUBLIC_BASE_URL should be set to your actual domain in production');
  }
  
  // Check Kubernetes internal URL (server-side only, optional but recommended)
  if (isServerSide && isProduction) {
    const kubeUrl = process.env.BACKEND_KUBE_URL;
    if (!kubeUrl) {
      warnings.push(
        'BACKEND_KUBE_URL is not set. ' +
        'For optimal performance in Kubernetes, set this to your internal service URL (e.g., http://backend-service:8080)'
      );
    } else {
      console.log('✅ Using Kubernetes internal networking:', kubeUrl);
    }
  }
  
  if (errors.length > 0 && isServerSide) {
    console.error(
      '\n❌ Environment Configuration Errors:\n' +
      errors.map(e => `   - ${e}`).join('\n') +
      '\n\nSee RUNTIME_ENV.md for configuration instructions.\n'
    );
  }
  
  if (warnings.length > 0 && isServerSide) {
    console.warn(
      '\n⚠️  Environment Configuration Warnings:\n' +
      warnings.map(w => `   - ${w}`).join('\n') + '\n'
    );
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

