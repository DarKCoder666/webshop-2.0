import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllLayouts, getDefaultSiteConfig } from "@/api/webshop-api";
import { DynamicPageClient } from '@/components/dynamic-page-client';

export default async function Home() {
  try {
    // Get all layouts to check if home page exists
    const layouts = await getAllLayouts();
    const homeLayout = layouts.find(layout => layout.pageType === 'home');
    
    if (!homeLayout) {
      // No home page found, use default site configuration
      const defaultConfig = getDefaultSiteConfig();
      return <DynamicPageClient config={defaultConfig} />;
    }
    
    // Home page exists, render it using the same logic as dynamic pages
    return <DynamicPageClient config={homeLayout.config} />;
  } catch (error) {
    console.error('Failed to load home page:', error);
    // On error, use default site configuration
    const defaultConfig = getDefaultSiteConfig();
    return <DynamicPageClient config={defaultConfig} />;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const layouts = await getAllLayouts();
    const homeLayout = layouts.find(layout => layout.pageType === 'home');
    
    // Use home layout if exists, otherwise use default configuration
    const config = homeLayout ? homeLayout.config : getDefaultSiteConfig();
    const seo = config.seo;
    const pageName = homeLayout?.pageName || config.name || 'Home';

    return {
      title: seo?.title || pageName,
      description: seo?.description || `${pageName} page`,
      keywords: seo?.keywords,
      openGraph: {
        title: seo?.title || pageName,
        description: seo?.description || `${pageName} page`,
        images: seo?.ogImage ? [{ url: seo.ogImage }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: seo?.title || pageName,
        description: seo?.description || `${pageName} page`,
        images: seo?.ogImage ? [seo.ogImage] : undefined,
      },
    };
  } catch (error) {
    // Fallback to default configuration metadata on error
    const defaultConfig = getDefaultSiteConfig();
    return {
      title: defaultConfig.seo?.title || defaultConfig.name || 'Home',
      description: defaultConfig.seo?.description || 'Welcome to our website',
    };
  }
}
