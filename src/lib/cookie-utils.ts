/**
 * Cookie utilities for debugging and handling authentication cookies
 */

import { getApiUrl } from './env';

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  return null;
}

export function getAllCookies(): Record<string, string> {
  if (typeof document === 'undefined') return {};
  
  const cookies: Record<string, string> = {};
  document.cookie.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}

export function debugCookies(): void {
  if (typeof window === 'undefined') {
    console.log('🍪 Cookie Debug: Running in SSR environment, no document available');
    return;
  }
  
  console.log('🍪 Cookie Debug Information:');
  console.log('Current URL:', window.location.href);
  console.log('Current domain:', window.location.hostname);
  console.log('Protocol:', window.location.protocol);
  console.log('All cookies:', getAllCookies());
  console.log('Raw cookie string:', document.cookie);
  
  // Check for common auth cookies
  const commonAuthCookieNames = ['token', 'auth', 'session', 'jwt', 'access_token', 'refresh_token'];
  commonAuthCookieNames.forEach(name => {
    const value = getCookie(name);
    if (value) {
      console.log(`Found auth cookie "${name}":`, value.substring(0, 20) + '...');
    }
  });
  
  if (Object.keys(getAllCookies()).length === 0) {
    console.warn('⚠️ No cookies found! This might indicate:');
    console.warn('1. Backend not setting cookies properly');
    console.warn('2. CORS configuration issues');
    console.warn('3. SameSite/Secure cookie attribute problems');
    console.warn('4. Domain mismatch between frontend and backend');
  }
}

let corsCheckDone = false; // Prevent repeated logging

export function checkCorsAndCookieCompatibility(): void {
  if (typeof window === 'undefined' || corsCheckDone) return;
  corsCheckDone = true;
  
  const currentDomain = window.location.hostname;
  const apiUrl = getApiUrl();
  
  console.log('🔍 CORS & Cookie Compatibility Check:');
  console.log('Frontend domain:', currentDomain);
  console.log('API URL:', apiUrl);
  
  if (apiUrl) {
    try {
      const apiDomain = new URL(apiUrl).hostname;
      console.log('Backend domain:', apiDomain);
      
      if (currentDomain !== apiDomain) {
        console.warn('⚠️ Cross-domain setup detected!');
        console.warn('For cookies to work properly, ensure:');
        console.warn('1. Backend sets SameSite=None and Secure=true for cookies');
        console.warn('2. CORS is configured to allow credentials');
        console.warn('3. Access-Control-Allow-Credentials: true header is set');
        
        // Provide specific backend code examples
        console.groupCollapsed('🔧 Backend Configuration Required');
        console.log(`
🚀 BACKEND FIXES NEEDED:

1️⃣ CORS Configuration:
   app.use(cors({
     origin: '${window.location.origin}',
     credentials: true,
     optionsSuccessStatus: 200
   }));

2️⃣ Cookie Settings (for cross-domain):
   res.cookie('your-auth-cookie', token, {
     httpOnly: true,
     secure: true,        // MUST be true for cross-domain
     sameSite: 'none',    // MUST be 'none' for cross-domain
     maxAge: 24 * 60 * 60 * 1000  // 24 hours
   });

3️⃣ Response Headers:
   res.header('Access-Control-Allow-Credentials', 'true');
        `);
        console.groupEnd();
      } else {
        console.log('✅ Same-domain setup - cookies should work normally');
      }
    } catch (e) {
      console.error('Failed to parse API URL:', e);
    }
  }
}
