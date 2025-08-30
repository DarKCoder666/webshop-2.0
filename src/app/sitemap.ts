import { MetadataRoute } from 'next';
import { getAllLayouts, getWebsiteProducts, getWebsiteProductCategories } from '@/api/webshop-api';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const revalidate = 3600; // refresh sitemap at most once per hour automatically

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourwebsite.com';
  
  try {
    const layouts = await getAllLayouts();
    
    const pages = layouts
      .map(layout => {
        // Resolve route for custom pages
        const isHome = layout.pageType === 'home';
        const route = layout.pageType === 'general' && layout.config.route
          ? layout.config.route
          : layout.pageType;

        // Exclude non-indexable/system-only routes
        const exclude = ['builder', 'login', 'product'];
        if (!isHome && exclude.includes(route)) return null;

        const normalizedRoute = route.replace(/^\/+/, '');
        const url = isHome ? baseUrl : `${baseUrl}/${normalizedRoute}`;
        return {
          url,
          lastModified: new Date(layout.updatedAt),
          changeFrequency: 'weekly' as const,
          priority: isHome ? 1 : 0.8,
        };
      })
      .filter(Boolean) as MetadataRoute.Sitemap;

    // Ensure product cache is fresh (<= 1 hour old). If stale/missing, refresh from API.
    const cachedPath = path.join(process.cwd(), 'public', 'products.json');
    const productsSitemapDir = path.join(process.cwd(), 'public', 'sitemaps');
    let products: { _id: string; createdAt: string }[] = [];

    const isCacheFresh = (() => {
      try {
        const stats = fs.statSync(cachedPath);
        const ageMs = Date.now() - stats.mtimeMs;
        return ageMs < 60 * 60 * 1000; // 1 hour
      } catch {
        return false;
      }
    })();

    async function refreshProductsFromApi() {
      const all: { _id: string; createdAt: string }[] = [];
      let pageNum = 1;
      const limit = 200;
      // Paginate products
      // Using the same API contract as in '@/api/webshop-api'
      // Stop when all pages are fetched
      // If API fails mid-way, fall back to whatever we fetched
      // and do not throw to avoid breaking sitemap.
      try {
        while (true) {
          const res = await getWebsiteProducts({ page: pageNum, limit, sortBy: 'createdAt:desc' });
          all.push(...res.results.map((p) => ({ _id: p._id, createdAt: p.createdAt })));
          if (pageNum >= res.totalPages) break;
          pageNum += 1;
        }
      } catch (e) {
        console.error('Failed to refresh products from API for sitemap:', e);
      }

      // Best-effort write cache and xml
      try {
        fs.writeFileSync(cachedPath, JSON.stringify(all, null, 2));
      } catch (e) {
        console.error('Failed to write products cache file:', e);
      }
      try {
        if (!fs.existsSync(productsSitemapDir)) {
          fs.mkdirSync(productsSitemapDir, { recursive: true });
        }
        const xmlBody = all
          .map((p) => (
            `  <url>\n    <loc>${baseUrl}/product/${p._id}</loc>\n    <lastmod>${new Date(p.createdAt).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`
          ))
          .join('\n');
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          `${xmlBody}\n` +
          `</urlset>\n`;
        fs.writeFileSync(path.join(productsSitemapDir, 'products-sitemap.xml'), xml);
      } catch (e) {
        console.error('Failed to write products sitemap xml:', e);
      }

      return all;
    }

    if (isCacheFresh) {
      try {
        const raw = fs.readFileSync(cachedPath, 'utf8');
        products = JSON.parse(raw);
      } catch {
        // If reading cache fails, refresh from API
        products = await refreshProductsFromApi();
      }
    } else {
      products = await refreshProductsFromApi();
    }

    const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${baseUrl}/product/${p._id}`,
      lastModified: new Date(p.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    // Fetch all categories (paginated) and include category pages
    let categoryEntries: MetadataRoute.Sitemap = [];
    try {
      let catPage = 1;
      const catLimit = 200;
      while (true) {
        const cats = await getWebsiteProductCategories({ page: catPage, limit: catLimit });
        if (Array.isArray(cats.results) && cats.results.length > 0) {
          categoryEntries.push(
            ...cats.results.map((c) => ({
              url: `${baseUrl}/category/${c._id}`,
              lastModified: new Date(),
              changeFrequency: 'weekly' as const,
              priority: 0.7,
            }))
          );
        } else {
          break;
        }
        if (!cats.totalPages || catPage >= cats.totalPages) break;
        catPage += 1;
      }
    } catch (e) {
      console.error('Failed to include categories in sitemap:', e);
    }

    // Fallback: if categories API returned none, derive category IDs from products
    if (categoryEntries.length === 0) {
      try {
        const categoryIds = new Set<string>();
        let pageNum = 1;
        const limit = 200;
        while (true) {
          const res = await getWebsiteProducts({ page: pageNum, limit, sortBy: 'createdAt:desc' });
          for (const p of res.results as Array<{ categories?: string[] }>) {
            if (Array.isArray(p.categories)) {
              for (const cat of p.categories) {
                if (cat) categoryIds.add(cat);
              }
            }
          }
          if (pageNum >= res.totalPages) break;
          pageNum += 1;
        }
        if (categoryIds.size > 0) {
          categoryEntries = Array.from(categoryIds).map((id) => ({
            url: `${baseUrl}/category/${id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          }));
        }
      } catch (e) {
        console.error('Fallback category derivation failed:', e);
      }
    }

    return [...pages, ...categoryEntries, ...productEntries];
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
