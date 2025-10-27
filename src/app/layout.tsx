import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { HeroHeader } from "@/components/sections/header/header";
import Footer from "@/components/sections/footer/footer";
import { getAllLayouts } from "@/api/webshop-api";
import { PublicEnvScript } from 'next-runtime-env';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const layouts = await getAllLayouts();
    const home = layouts.find((l) => l.pageType === "home");
    const seo = home?.config.seo;
    const siteName = home?.config.name || "Website";

    return {
      title: seo?.title || siteName,
      description: seo?.description || "Welcome to our website",
      keywords: seo?.keywords,
      openGraph: {
        title: seo?.title || siteName,
        description: seo?.description || "Welcome to our website",
        images: seo?.ogImage ? [{ url: seo.ogImage }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: seo?.title || siteName,
        description: seo?.description || "Welcome to our website",
        images: seo?.ogImage ? [seo.ogImage] : undefined,
      },
    };
  } catch (error) {
    return {
      title: "Website",
      description: "Welcome to our website",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <PublicEnvScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {/* Global Header across all pages */}
          <HeroHeader />
          <div className="pt-24">
            {children}
            {/* Global Footer across all pages */}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
