import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { DynamicPageClient } from '@/components/dynamic-page-client';
import { getAllLayouts, getWebsiteProduct } from '@/api/webshop-api';
import { Product } from '@/lib/product-types';
import { SiteConfig } from '@/lib/builder-types';

// Force dynamic rendering to support runtime environment variables
export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Fetch product data from API
async function getProduct(id: string): Promise<Product | null> {
  try {
    const product = await getWebsiteProduct(id);
    return product;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);
  
  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.'
    };
  }

  return {
    title: product.name,
    description: product.description || `${product.name} - View details and purchase options`,
    openGraph: {
      title: product.name,
      description: product.description || `${product.name} - View details and purchase options`,
      images: product.image ? [{ url: product.image.image.smallUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || `${product.name} - View details and purchase options`,
      images: product.image ? [product.image.image.smallUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);
  
  if (!product) {
    notFound();
  }

  try {
    // Get all layouts to find if there's a product page template
    const layouts = await getAllLayouts();
    const productLayout = layouts.find(l => l.pageType === 'product');
    
    // If no product page template exists, create a default one
    if (!productLayout) {
      const defaultProductConfig: SiteConfig = {
        id: `product-${product._id}`,
        name: product.name,
        blocks: [
          {
            id: `product-overview-${product._id}`,
            type: 'productOverview',
            props: { product }
          }
        ]
      };
      
      return <DynamicPageClient config={defaultProductConfig} />;
    }

    // If product page template exists, inject the product data into the blocks
    const configWithProduct: SiteConfig = {
      ...productLayout.config,
      id: `product-${product._id}`,
      name: product.name,
      blocks: productLayout.config.blocks.map(block => {
        if (block.type === 'productGallery' || block.type === 'productDetails' || block.type === 'productOverview') {
          return {
            ...block,
            props: { ...block.props, product }
          };
        }
        return block;
      })
    };

    return <DynamicPageClient config={configWithProduct} />;
  } catch (error) {
    console.error('Failed to load product page:', error);
    notFound();
  }
}
