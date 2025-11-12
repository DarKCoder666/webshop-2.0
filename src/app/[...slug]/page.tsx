import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { DynamicPageClient } from '@/components/dynamic-page-client';
import { getAllLayouts, WebshopLayout } from '@/api/webshop-api';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

// Helper function to safely get layouts with error handling
async function safeGetAllLayouts(): Promise<WebshopLayout[]> {
  try {
    const layouts = await getAllLayouts();
    return layouts;
  } catch (error) {
    console.error('Error fetching layouts:', error);
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
  
  // Check if this is a system route that should be handled by dedicated pages
  const systemRoutes = ['login', 'builder', 'catalog', 'category'];
  if (slug.length === 1 && systemRoutes.includes(slug[0])) {
    notFound();
  }
  
  // Check if this is a product route - if so, let the product page handle it
  if (slug.length === 2 && slug[0] === 'product') {
    // This should be handled by the product/[id]/page.tsx
    notFound();
  }
  
  try {
    const layouts = await safeGetAllLayouts();
    
    if (layouts.length === 0) {
      console.error('No layouts available for dynamic page rendering');
      notFound();
    }
    
    // First try to find by pageType (for backward compatibility)
    let layout = layouts.find(l => l.pageType === route);
    
    // If not found, try to find by route in config (for general pages)
    if (!layout) {
      layout = layouts.find(l => l.pageType === 'general' && l.config.route === route);
    }
    
    if (!layout) {
      console.warn(`No layout found for route: ${route}`);
      notFound();
    }

    return <DynamicPageClient config={layout.config} />;
  } catch (error) {
    console.error('Failed to load page:', error);
    notFound();
  }
}
