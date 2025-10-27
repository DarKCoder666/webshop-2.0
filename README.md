## Runtime Environment Variables 🔧

Этот проект использует **runtime environment variables** через `next-runtime-env`. Это означает:

✅ Переменные окружения загружаются при запуске контейнера (runtime), а не при сборке  
✅ Один Docker образ работает для всех tenants с разными настройками  
✅ Tenant Controller может инжектить переменные динамически  

### Обязательные переменные

```bash
NEXT_PUBLIC_API_URL=https://api.yourbackend.com    # URL backend API
NEXT_PUBLIC_SHOP_ID=60f7b3b3b3b3b3b3b3b3b3b3        # ID магазина в системе
NEXT_PUBLIC_BASE_URL=https://yourshop.com          # Базовый URL сайта
```

📖 **Подробная документация:**
- [RUNTIME_ENV.md](./RUNTIME_ENV.md) - Полное руководство по runtime env
- [TENANT_CONTROLLER_INTEGRATION.md](./TENANT_CONTROLLER_INTEGRATION.md) - Интеграция с Tenant Controller

### Запуск с Docker

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.example.com \
  -e NEXT_PUBLIC_SHOP_ID=your-shop-id \
  -e NEXT_PUBLIC_BASE_URL=https://myshop.com \
  webshop:latest
```

## Product sitemap generation

To help search engines discover all product detail pages, this project includes a generator that fetches all products and writes:

- `public/products.json` – cached list of product ids and timestamps
- `public/sitemaps/products-sitemap.xml` – product sitemap consumed by robots

Run locally or in cron:

```
npm run generate:product-sitemap
```

Example crontab (run hourly):

```
0 * * * * cd /path/to/webshop-2.0 && /usr/bin/env npm run generate:product-sitemap >> cron.log 2>&1
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
