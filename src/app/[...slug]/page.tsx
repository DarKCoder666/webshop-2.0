import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { DynamicPageClient } from '@/components/dynamic-page-client';
import { getAllLayouts, WebshopLayout } from '@/api/webshop-api';

// Force dynamic rendering to support runtime environment variables
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

// Helper function to safely get layouts with error handling
async function safeGetAllLayouts(): Promise<WebshopLayout[]> {
  try {
    console.log('[safeGetAllLayouts] Fetching all layouts from API...');
    const layouts = await getAllLayouts();
    console.log(`[safeGetAllLayouts] Successfully fetched ${layouts.length} layouts`);
    return layouts;
  } catch (error) {
    console.error('[safeGetAllLayouts] Error fetching layouts:', error);
    if (error instanceof Error) {
      console.error('[safeGetAllLayouts] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    // Return empty array instead of throwing to prevent build/runtime failures
    return [];
  }
}

// Generate static params for all pages
export async function generateStaticParams() {
  try {
    const layouts = await safeGetAllLayouts();
    
    if (layouts.length === 0) {
      console.warn('No layouts found for static params generation');
      return [];
    }
    
    const systemRoutes = ['login', 'builder', 'catalog', 'category', 'product'];
    
    return layouts
      .filter(layout => layout.pageType !== 'home') // Exclude home page
      .filter(layout => !systemRoutes.includes(layout.pageType)) // Exclude system routes
      .map(layout => {
        // Use route from config if it's a general page, otherwise use pageType
        const route = layout.pageType === 'general' && layout.config.route 
          ? layout.config.route 
          : layout.pageType;
        
        return {
          slug: route.split('/').filter(Boolean)
        };
      });
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const route = slug.join('/');
  
  try {
    const layouts = await safeGetAllLayouts();
    
    if (layouts.length === 0) {
      console.warn('No layouts available for metadata generation');
      return {
        title: 'Page',
        description: 'Page description'
      };
    }
    
    // First try to find by pageType (for backward compatibility)
    let layout = layouts.find(l => l.pageType === route);
    
    // If not found, try to find by route in config (for general pages)
    if (!layout) {
      layout = layouts.find(l => l.pageType === 'general' && l.config.route === route);
    }
    
    if (!layout) {
      return {
        title: 'Page Not Found',
        description: 'The requested page could not be found.'
      };
    }

    const seo = layout.config.seo;
    const pageName = layout.pageName || layout.config.name;

    return {
      title: seo?.title || pageName || 'Page',
      description: seo?.description || `${pageName} page`,
      keywords: seo?.keywords,
      openGraph: {
        title: seo?.title || pageName || 'Page',
        description: seo?.description || `${pageName} page`,
        images: seo?.ogImage ? [{ url: seo.ogImage }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: seo?.title || pageName || 'Page',
        description: seo?.description || `${pageName} page`,
        images: seo?.ogImage ? [seo.ogImage] : undefined,
      },
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: 'Page',
      description: 'Page description'
    };
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const route = slug.join('/');
  
  // Log the route being requested (helpful for debugging in production)
  console.log(`[DynamicPage] Rendering route: ${route}`);
  
  // Check if this is a system route that should be handled by dedicated pages
  const systemRoutes = ['login', 'builder', 'catalog', 'category'];
  if (slug.length === 1 && systemRoutes.includes(slug[0])) {
    console.log(`[DynamicPage] System route detected, returning 404: ${route}`);
    notFound();
  }
  
  // Check if this is a product route - if so, let the product page handle it
  if (slug.length === 2 && slug[0] === 'product') {
    // This should be handled by the product/[id]/page.tsx
    console.log(`[DynamicPage] Product route detected, returning 404: ${route}`);
    notFound();
  }
  
  try {
    const layouts = await safeGetAllLayouts();
    
    console.log(`[DynamicPage] Fetched ${layouts.length} layouts from API`);
    
    if (layouts.length === 0) {
      console.error('[DynamicPage] No layouts available for dynamic page rendering');
      notFound();
    }
    
    // Log available routes for debugging
    const availableRoutes = layouts.map(l => ({
      pageType: l.pageType,
      route: l.config?.route,
      pageName: l.pageName
    }));
    console.log('[DynamicPage] Available routes:', JSON.stringify(availableRoutes, null, 2));
    
    // First try to find by pageType (for backward compatibility)
    let layout = layouts.find(l => l.pageType === route);
    
    // If not found, try to find by route in config (for general pages)
    if (!layout) {
      layout = layouts.find(l => l.pageType === 'general' && l.config.route === route);
    }
    
    if (!layout) {
      console.error(`[DynamicPage] No layout found for route: ${route}`);
      console.error(`[DynamicPage] Tried matching against ${layouts.length} layouts`);
      notFound();
    }

    console.log(`[DynamicPage] Successfully found layout for route: ${route}`);
    return <DynamicPageClient config={layout.config} />;
  } catch (error) {
    console.error('[DynamicPage] Failed to load page:', error);
    if (error instanceof Error) {
      console.error('[DynamicPage] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    notFound();
  }
}
