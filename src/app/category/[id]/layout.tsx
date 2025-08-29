import type { Metadata } from 'next';
import { getAllLayouts } from '@/api/webshop-api';

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const layouts = await getAllLayouts();
    const layout = layouts.find((l) => l.pageType === 'category' || (l.pageType === 'general' && l.config.route === 'category'));
    const seo = layout?.config.seo;
    const pageName = layout?.pageName || layout?.config.name || 'Category';

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
    return {
      title: 'Category',
      description: 'Product category',
    };
  }
}


