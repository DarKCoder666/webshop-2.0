import { MetadataRoute } from 'next';
import { getAllLayouts } from '@/api/webshop-api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourwebsite.com';
  
  try {
    const layouts = await getAllLayouts();
    
    const pages = layouts.map(layout => {
      const url = layout.pageType === 'home' 
        ? baseUrl 
        : `${baseUrl}/${layout.pageType}`;
      
      return {
        url,
        lastModified: new Date(layout.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: layout.pageType === 'home' ? 1 : 0.8,
      };
    });

    return pages;
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    
    // Return at least the home page
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1,
      },
    ];
  }
}
