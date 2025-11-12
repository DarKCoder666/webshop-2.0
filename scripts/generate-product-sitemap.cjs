require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const shopId = process.env.NEXT_PUBLIC_SHOP_ID || '';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourwebsite.com';

if (!apiUrl) {
  console.error('Missing NEXT_PUBLIC_API_URL in environment');
  process.exit(1);
}

const axiosInstance = axios.create({
  baseURL: `${apiUrl}/v1/`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

async function fetchAllProductsIds() {
  const all = [];
  let page = 1;
  const limit = 200;
  while (true) {
    const params = new URLSearchParams();
    params.set('shopId', shopId);
    params.set('limit', String(limit));
    params.set('page', String(page));
    params.set('sortBy', 'createdAt:desc');

    const url = `webshop/products?${params.toString()}`;
    const { data } = await axiosInstance.get(url);
    all.push(...data.results.map(p => ({ _id: p._id, createdAt: p.createdAt })));
    if (page >= data.totalPages) break;
    page += 1;
  }
  return all;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeJsonProducts(products) {
  const outPath = path.join(process.cwd(), 'public', 'products.json');
  fs.writeFileSync(outPath, JSON.stringify(products, null, 2));
  return outPath;
}

function writeProductsSitemapXml(products) {
  const dir = path.join(process.cwd(), 'public', 'sitemaps');
  ensureDir(dir);
  const outPath = path.join(dir, 'products-sitemap.xml');

  const urls = products.map(p => `  <url>\n    <loc>${baseUrl}/product/${p._id}</loc>\n    <lastmod>${new Date(p.createdAt).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urls}\n` +
    `</urlset>\n`;

  fs.writeFileSync(outPath, xml);
  return outPath;
}

async function main() {
  console.log('Fetching all products for sitemap...');
  const products = await fetchAllProductsIds();
  console.log(`Fetched ${products.length} products`);

  const jsonPath = writeJsonProducts(products);
  const xmlPath = writeProductsSitemapXml(products);

  console.log('Wrote:', jsonPath);
  console.log('Wrote:', xmlPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


