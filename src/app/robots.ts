import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/env';

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
