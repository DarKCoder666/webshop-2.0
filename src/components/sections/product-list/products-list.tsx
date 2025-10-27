"use client";

import React, { useMemo } from "react";
import { t } from '@/lib/i18n';
import ProductCard, { ProductCardData } from "@/components/sections/product-list/product-card";
import { renderProductCardVariant, ProductCardVariant } from "@/components/sections/product-list/product-card-variants";
import { EditableText } from "@/components/builder/editable-text";
import { useBuilder } from "@/components/builder/builder-context";
import { RenderableText } from "@/components/builder/renderable-text";
import { RichText } from "@/lib/builder-types";
import { getRichTextContent, getRichTextStyle } from "@/lib/text-utils";
import { Product } from "@/api/webshop-api";
import { useProducts, useProductCategories } from "@/queries/products";

export type ProductsListProps = {
  title?: string | RichText;
  subtitle?: string | RichText;
  itemsToShow?: number;
  itemsPerRow?: number; // desktop only
  cardVariant?: ProductCardVariant;
  imageAspect?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  products?: ProductCardData[];
  blockId?: string;
  // New API-based properties
  selectedCategories?: string[];
  priceSort?: 'none' | 'cheapest' | 'expensive';
  customProductIds?: string[];
  productSelectionMode?: 'auto' | 'custom';
  sortBy?: string;
  // Catalog filters
  searchQuery?: string;
  priceMin?: number;
  priceMax?: number;
  attributes?: Record<string, string | string[]>;
  page?: number;
};

// Helper function to convert API Product to ProductCardData
function convertProductToCardData(product: Product, categoriesMap: Record<string, string> = {}): ProductCardData {
  // Get the first variation for price (or use 0 if no variations)
  const firstVariation = product.variations[0];
  const originalPrice = firstVariation?.price || 0;
  const discountPrice = firstVariation?.discountPrice;
  
  // Use product image or first available variation image (scan all variations), or null for placeholder
  const variationWithImage = product.variations.find((v) => Array.isArray(v.images) && v.images.length > 0);
  const imageSrc = product.image?.url || 
                   variationWithImage?.images?.[0]?.url || 
                   null; // Use null to trigger placeholder
  
  // Get category name from map or use fallback
  const categoryId = product.categories[0];
  const categoryName = categoryId ? (categoriesMap[categoryId] || 'Category') : t('uncategorized' as any);
  
  return {
    id: product._id,
    title: product.name,
    category: categoryName,
    price: originalPrice,
    discountPrice: discountPrice,
    imageSrc: imageSrc,
  };
}

export default function ProductsList({
  title = { text: t('best_sellers' as any) },
  subtitle = { text: t('discover_most_loved' as any) },
  itemsToShow = 6,
  itemsPerRow = 3,
  products = [],
  cardVariant = "v1",
  imageAspect = '4:3',
  blockId,
  selectedCategories = [],
  customProductIds = [],
  productSelectionMode = 'auto',
  sortBy,
  searchQuery,
  priceMin,
  priceMax,
  attributes,
  page,
}: ProductsListProps) {
  const { isBuilder, updateBlockText } = useBuilder();
  
  // Use React Query to fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useProductCategories();
  
  // Use React Query to fetch products
  const productQueryParams = useMemo(() => {
    if (productSelectionMode === 'custom' && customProductIds.length > 0) {
      return {
        productsIds: customProductIds,
        limit: itemsToShow,
      };
    } else {
      return {
        limit: itemsToShow,
        sortBy: sortBy,
        page: page,
        filters: {
          query: searchQuery || undefined,
          categories: selectedCategories.length > 0 ? selectedCategories : undefined,
          price: {
            min: priceMin,
            max: priceMax,
          },
          attributes: attributes,
        },
      };
    }
  }, [productSelectionMode, customProductIds, itemsToShow, sortBy, selectedCategories, searchQuery, priceMin, priceMax, attributes, page]);
  
  const { data: productsData, isLoading: productsLoading } = useProducts(productQueryParams);
  
  // Create categories map from the loaded data
  const categoriesMap = useMemo(() => {
    if (!categoriesData?.results) return {};
    return categoriesData.results.reduce((acc, cat) => {
      acc[cat._id] = cat.name;
      return acc;
    }, {} as Record<string, string>);
  }, [categoriesData]);
  
  // Convert products to display format after both products and categories are loaded
  const displayProducts = useMemo(() => {
    if (!productsData?.results) return products;
    
    return productsData.results.map(product => convertProductToCardData(product, categoriesMap));
  }, [productsData, categoriesMap, products]);
  
  const visible = displayProducts.slice(0, Math.max(0, itemsToShow || 0));
  const loading = productsLoading || categoriesLoading;
  const gridCols = () => {
    const n = Math.min(5, Math.max(2, Number(itemsPerRow ?? 3)));
    // map to tailwind classes for lg breakpoint
    switch (n) {
      case 2:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2";
      case 3:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
      case 5:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5";
      default:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }
  };

  return (
    <section className="container mx-auto px-6 md:px-10 lg:px-16 py-16">
      <div className="mb-10 flex flex-col items-center text-center">
        {(title || isBuilder) && (
          isBuilder ? (
            <EditableText
              key={`pl-title-${blockId}`}
              blockId={blockId || ""}
              fieldKey="title"
              onSave={updateBlockText}
              isBuilder={isBuilder}
              as="h2"
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
              placeholder="Enter title..."
              style={getRichTextStyle(title)}
            >
              {getRichTextContent(title)}
            </EditableText>
          ) : (
            <RenderableText
              content={title}
              as="h2"
              per="word"
              preset="fade-in-blur"
              speedReveal={1}
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
              fallback="Our Products"
            />
          )
        )}

        {(subtitle || isBuilder) && (
          isBuilder ? (
            <EditableText
              key={`pl-subtitle-${blockId}`}
              blockId={blockId || ""}
              fieldKey="subtitle"
              onSave={updateBlockText}
              isBuilder={isBuilder}
              as="p"
              className="mt-3 max-w-2xl text-muted-foreground"
              placeholder="Enter description..."
              style={getRichTextStyle(subtitle)}
            >
              {getRichTextContent(subtitle)}
            </EditableText>
          ) : (
            <RenderableText
              content={subtitle}
              as="p"
              per="word"
              preset="fade"
              delay={0.1}
              className="mt-3 max-w-2xl text-muted-foreground"
            />
          )
        )}
      </div>

      <div className={`${gridCols()} gap-6 md:gap-8`}>
        {loading ? (
          // Loading skeleton
          Array.from({ length: itemsToShow || 6 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="animate-pulse">
              <div className="bg-muted rounded-2xl aspect-[4/3] mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
            </div>
          ))
        ) : visible.length > 0 ? (
          visible.map((p) => (
            cardVariant === "v1" ? (
              <ProductCard key={p.id} product={p} imageAspect={imageAspect} />
            ) : (
              <div key={p.id}>
                {renderProductCardVariant(cardVariant, { product: p, imageAspect })}
              </div>
            )
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground">
              {productSelectionMode === 'custom' && customProductIds.length === 0
                ? 'No products selected. Use the settings to select products.'
                : 'No products found.'}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


