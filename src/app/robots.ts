import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/env';

export const dynamic = 'force-dynamic'; // Required for runtime env vars

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/builder', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
