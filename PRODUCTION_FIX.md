# Production Dynamic Page Rendering Fix

## Problem Summary

When creating new pages in production, the server-side rendering (SSR) failed with the following errors:

```
No layout found for route: delivery
No layout found for route: contacts
Failed to load page: Error: NEXT_HTTP_ERROR_FALLBACK;404
Error: DYNAMIC_SERVER_USAGE
```

The pages were correctly stored in the database and visible in the network tab on the frontend, but Next.js couldn't render them during SSR, resulting in 500 errors.

## Root Cause

The issue was caused by **module-level evaluation of environment variables** in production. Specifically:

1. **`src/api/axios.ts`** - The API URL was being evaluated at module initialization:
   ```typescript
   const apiUrl = getApiUrl(); // ❌ Evaluated at module load time
   ```

2. **`src/api/webshop-api.ts`** - The Shop ID was being evaluated at module initialization:
   ```typescript
   const DEFAULT_SHOP_ID = getShopId(); // ❌ Evaluated at module load time
   ```

When Next.js tries to perform server-side rendering or static generation in production:
- The `getApiUrl()` and `getShopId()` functions call `env()` from `next-runtime-env`
- These functions access runtime environment variables
- Next.js marks this as "dynamic" behavior during static generation
- This triggers the `DYNAMIC_SERVER_USAGE` error
- The axios instance fails to initialize properly
- API calls fail silently, returning empty layout arrays
- Pages appear to not exist, resulting in 404 errors

## Solution

We implemented **lazy evaluation** for both the API URL and Shop ID to ensure they're only evaluated when actually needed, not at module initialization time.

### Changes Made

#### 1. Fixed `src/api/axios.ts`

**Before:**
```typescript
const apiUrl = getApiUrl();

const instance = axios.create({
  baseURL: `${apiUrl}/v1/`,
  // ... other config
});
```

**After:**
```typescript
// Cache for API URL to avoid multiple evaluations
let cachedApiUrl: string | null = null;

function getCachedApiUrl(): string {
  if (!cachedApiUrl) {
    cachedApiUrl = getApiUrl();
  }
  return cachedApiUrl;
}

const instance = axios.create({
  // Don't set baseURL here - it will be set lazily in the request interceptor
  // ... other config
});

// Request interceptor
instance.interceptors.request.use(
  function (config) {
    // Lazily set the baseURL on each request
    if (!config.baseURL) {
      const apiUrl = getCachedApiUrl();
      config.baseURL = `${apiUrl}/v1/`;
    }
    // ... rest of interceptor
  }
);
```

#### 2. Fixed `src/api/webshop-api.ts`

**Before:**
```typescript
const DEFAULT_SHOP_ID = getShopId();
```

**After:**
```typescript
// Using lazy evaluation to avoid module-level evaluation issues
let cachedShopId: string | null = null;

function getDefaultShopId(): string {
  if (cachedShopId === null) {
    cachedShopId = getShopId();
  }
  return cachedShopId;
}

// All usages of DEFAULT_SHOP_ID replaced with getDefaultShopId()
```

#### 3. Enhanced Logging in `src/app/[...slug]/page.tsx`

Added comprehensive logging to help debug similar issues in the future:
- Log when routes are being rendered
- Log the number of layouts fetched
- Log available routes for debugging
- Log detailed error information

## Why This Fixes the Issue

1. **No Module-Level Evaluation**: Environment variables are no longer accessed at module initialization time
2. **Lazy Loading**: The API URL and Shop ID are only evaluated when the first request is made
3. **Caching**: After the first evaluation, values are cached to avoid repeated calls
4. **Next.js Compatibility**: This pattern is compatible with Next.js static generation and SSR
5. **Production Safe**: Works correctly in production where environment variables are injected at runtime

## Environment Variables Required

Ensure these environment variables are set in your production environment:

### For Browser (Public)
```bash
NEXT_PUBLIC_API_URL=https://api.yourshop.com
NEXT_PUBLIC_SHOP_ID=your-shop-id
NEXT_PUBLIC_BASE_URL=https://yourshop.com
```

### For Server-Side (Kubernetes) - **HIGHLY RECOMMENDED**
```bash
BACKEND_KUBE_URL=http://backend-service:8080
```

The `BACKEND_KUBE_URL` allows the Next.js server to communicate with your backend using Kubernetes internal networking, which is faster and more reliable than going through the public internet.

## Testing in Production

After deploying this fix:

1. **Verify environment variables are set**:
   - Check your Kubernetes ConfigMap/Deployment
   - Ensure all required variables are present

2. **Create a new test page**:
   - Use the builder to create a new general page
   - Note the route (e.g., "test-page")

3. **Check server logs**:
   ```
   [safeGetAllLayouts] Fetching all layouts from API...
   [safeGetAllLayouts] Successfully fetched X layouts
   [DynamicPage] Rendering route: test-page
   [DynamicPage] Fetched X layouts from API
   [DynamicPage] Available routes: [...]
   [DynamicPage] Successfully found layout for route: test-page
   ```

4. **Verify the page loads**:
   - Visit `https://yourshop.com/test-page`
   - Should render without 500 errors
   - Check browser console and network tab

## Additional Notes

### Why It Worked Locally But Not in Production

- **Local Development**: Environment variables are typically available immediately and synchronously
- **Production (Docker/Kubernetes)**: Environment variables are injected at runtime via ConfigMaps/Secrets
- **Next.js Build Time**: During static generation, some environment variables may not be available yet
- **Module Initialization**: Code at the top level of modules runs during import, before runtime env vars are ready

### Performance Considerations

The caching mechanism ensures that:
- `getApiUrl()` is only called once per server instance
- `getShopId()` is only called once per server instance
- Subsequent requests use the cached values
- No performance degradation compared to the previous implementation

### Best Practices Going Forward

1. **Never evaluate environment variables at module level** in files that run on the server
2. **Use lazy evaluation** for any runtime configuration
3. **Cache values** to avoid repeated evaluations
4. **Add logging** to help debug production issues
5. **Test in a production-like environment** before deploying

## Related Files

- `/src/api/axios.ts` - Axios instance with lazy baseURL evaluation
- `/src/api/webshop-api.ts` - API functions with lazy Shop ID evaluation
- `/src/app/[...slug]/page.tsx` - Dynamic page rendering with enhanced logging
- `/src/lib/env.ts` - Environment variable utilities
- `/RUNTIME_ENV.md` - Comprehensive environment variable documentation

## Rollback Plan

If issues persist, you can verify the axios configuration is working by checking:
```bash
# In your pod logs, you should see:
kubectl logs <your-frontend-pod> | grep "Using internal Kubernetes URL"
```

If you see this message, the server is correctly using the internal Kubernetes URL for API calls.

