"use client";

import React from "react";
import { useMemo, useState, useEffect, useRef } from "react";
import ProductsList from "@/components/sections/product-list/products-list";
import { useProductAttributes, useProductCategories, useProductPriceRange, useProducts } from "@/queries/products";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { t } from '@/lib/i18n';

export default function CategoryPage() {
  const { data: categoriesData } = useProductCategories();
  const { data: priceRange } = useProductPriceRange();
  const { data: attributesData } = useProductAttributes();

  const categories = useMemo(() => categoriesData?.results || [], [categoriesData?.results]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ id: string }>();
  const categoryId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [attrFilters, setAttrFilters] = useState<Record<string, string | string[]>>({});
  const isUpdatingFromURL = useRef(false);

  // Initialize and sync state from URL on mount and when URL changes
  useEffect(() => {
    isUpdatingFromURL.current = true;
    
    const p = Number(searchParams.get('page') || '1');
    const nextPage = Number.isNaN(p) || p < 1 ? 1 : p;
    if (nextPage !== page) setPage(nextPage);

    const nextSearch = searchParams.get('q') || "";
    if (nextSearch !== search) setSearch(nextSearch);

    const min = searchParams.get('min');
    const max = searchParams.get('max');
    const nextMin = min ? Number(min) : undefined;
    const nextMax = max ? Number(max) : undefined;
    if (nextMin !== minPrice) setMinPrice(nextMin);
    if (nextMax !== maxPrice) setMaxPrice(nextMax);

    // attributes are encoded as attr_key=value (multi allowed)
    const nextAttrs: Record<string, string | string[]> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('attr_')) {
        const k = key.replace('attr_', '');
        if (nextAttrs[k]) {
          const cur = nextAttrs[k];
          nextAttrs[k] = Array.isArray(cur) ? [...cur, value] : [cur as string, value];
        } else {
          nextAttrs[k] = value;
        }
      }
    });
    // Compare shallowly
    const curAttrKeys = Object.keys(attrFilters).sort().join('|');
    const nextAttrKeys = Object.keys(nextAttrs).sort().join('|');
    const sameKeys = curAttrKeys === nextAttrKeys;
    let sameValues = sameKeys;
    if (sameKeys) {
      for (const k of Object.keys(nextAttrs)) {
        const a = nextAttrs[k];
        const b = attrFilters[k];
        const aStr = Array.isArray(a) ? a.join('|') : a ?? '';
        const bStr = Array.isArray(b) ? b.join('|') : (b as string) ?? '';
        if (aStr !== bStr) { sameValues = false; break; }
      }
    }
    if (!sameValues) setAttrFilters(nextAttrs);
    
    // Reset the flag after state updates
    setTimeout(() => {
      isUpdatingFromURL.current = false;
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const setAttribute = (key: string, value: string, checked: boolean) => {
    setAttrFilters((prev) => {
      const current = prev[key];
      if (Array.isArray(current)) {
        const nextArray = checked ? [...current, value] : current.filter((v) => v !== value);
        const next = { ...prev, [key]: nextArray };
        setPage(1);
        return next;
      } else if (typeof current === 'string') {
        if (checked) {
          const next = { ...prev, [key]: [current, value] };
          setPage(1);
          return next;
        } else {
          const next = { ...prev, [key]: value === current ? undefined : current } as Record<string, string | string[]>;
          setPage(1);
          return next;
        }
      } else {
        const next = { ...prev, [key]: checked ? value : undefined } as Record<string, string | string[]>;
        setPage(1);
        return next;
      }
    });
  };

  const normalizedAttributes = useMemo(() => {
    const result: Record<string, string | string[]> = {};
    Object.entries(attrFilters).forEach(([k, v]) => {
      if (Array.isArray(v) && v.length > 0) result[k] = v;
      else if (typeof v === 'string' && v) result[k] = v;
    });
    return result;
  }, [attrFilters]);

  // After render, sync state to URL if it differs
  useEffect(() => {
    // Don't update URL if we're currently updating from URL
    if (isUpdatingFromURL.current) return;
    
    // Use a timeout to ensure this runs after the current render cycle
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (minPrice !== undefined) params.set('min', String(minPrice));
      if (maxPrice !== undefined) params.set('max', String(maxPrice));
      if (page && page > 1) params.set('page', String(page));
      Object.entries(normalizedAttributes).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach((vv) => params.append(`attr_${k}`, vv));
        else params.append(`attr_${k}`, v);
      });
      const next = params.toString();
      const cur = searchParams.toString();
      if (next !== cur) {
        router.replace(`${pathname}?${next}`, { scroll: false });
      }
    }, 0);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, minPrice, maxPrice, normalizedAttributes, pathname, router]);

  React.useEffect(() => {
    if (priceRange && minPrice === undefined && maxPrice === undefined) {
      setMinPrice(priceRange.min);
      setMaxPrice(priceRange.max);
    }
  }, [priceRange, minPrice, maxPrice]);

  // Build query params to obtain totalPages without triggering extra network (React Query caches by key)
  const ITEMS_PER_PAGE = 24;
  const productsParams = useMemo(() => ({
    limit: ITEMS_PER_PAGE,
    page,
    filters: {
      query: search || undefined,
      categories: categoryId ? [categoryId] : undefined,
      price: { min: minPrice, max: maxPrice },
      attributes: normalizedAttributes,
    },
  }), [ITEMS_PER_PAGE, page, search, categoryId, minPrice, maxPrice, normalizedAttributes]);
  const { data: productsMeta } = useProducts(productsParams);
  const totalPages = productsMeta?.totalPages ?? 1;

  // Clamp page if it exceeds total available pages
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      const clamped = Math.max(1, totalPages);
      if (clamped !== page) {
        setPage(clamped);
      }
    }
  }, [totalPages, page]);

  const resetFilters = () => {
    setSearch("");
    setMinPrice(priceRange?.min);
    setMaxPrice(priceRange?.max);
    setAttrFilters({});
    setPage(1);
  };

  const appliedFiltersCount = useMemo(() => {
    let count = 0;
    // Count price only if differs from full range
    const priceChanged = (
      (priceRange && minPrice !== undefined && minPrice > priceRange.min) ||
      (priceRange && maxPrice !== undefined && maxPrice < priceRange.max)
    );
    if (priceChanged) count++;
    // Count attributes
    count += Object.values(normalizedAttributes).reduce((acc, v) => acc + (Array.isArray(v) ? v.length : 1), 0);
    return count;
  }, [priceRange, minPrice, maxPrice, normalizedAttributes]);

  const categoryName = useMemo(() => {
    return categories.find((c) => c._id === categoryId)?.name || t('categories_label');
  }, [categories, categoryId]);

  return (
    <div className="container mx-auto px-4 md:px-10 lg:px-16 py-4 md:py-10">
      {/* Top bar: full-width search + Filters button */}
      <div className="mb-3 md:mb-6 flex w-full items-center gap-2 md:gap-3">
        <Input
          placeholder={t('search_products')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1"
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="relative">
              {t('filters')}
              {appliedFiltersCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs px-2 py-0.5">
                  {appliedFiltersCount}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{t('filters')}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 md:gap-6 max-h-[70vh] overflow-y-auto px-1">
              {/* Price */}
              <div>
                <h2 className="text-sm md:text-base font-semibold mb-2">{t('price_label')}</h2>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder={t('min')}
                    value={minPrice ?? ''}
                    onChange={(e) => { const v = e.target.value === '' ? undefined : Number(e.target.value); setMinPrice(v); setPage(1); }}
                    min={priceRange?.min}
                    max={priceRange?.max}
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    type="number"
                    placeholder={t('max')}
                    value={maxPrice ?? ''}
                    onChange={(e) => { const v = e.target.value === '' ? undefined : Number(e.target.value); setMaxPrice(v); setPage(1); }}
                    min={priceRange?.min}
                    max={priceRange?.max}
                  />
                </div>
              </div>
              {/* Attributes */}
              {attributesData && attributesData.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm md:text-base font-semibold">{t('attributes_label')}</h2>
                  {attributesData.map((attr) => (
                    <div key={attr._id} className="space-y-1.5">
                      <h3 className="font-medium capitalize text-xs md:text-sm">{attr.key}</h3>
                      <div className="flex flex-wrap gap-2">
                        {attr.value.map((v) => {
                          const checked = Array.isArray(attrFilters[attr.key])
                            ? (attrFilters[attr.key] as string[]).includes(v)
                            : attrFilters[attr.key] === v;
                          return (
                            <label key={v} className={cn("flex items-center gap-2 text-sm border rounded-full px-3 py-1 cursor-pointer", checked ? "bg-accent" : undefined)}>
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={checked}
                                onChange={(e) => setAttribute(attr.key, v, e.target.checked)}
                              />
                              <span>{v}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <Button variant="secondary" onClick={resetFilters} className="w-full">{t('reset_filters')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Full-width products list */}
      <main>
          <ProductsList
            title={{ text: categoryName }}
            subtitle={{ text: t('browse_category') }}
            itemsToShow={ITEMS_PER_PAGE}
            itemsPerRow={3}
            selectedCategories={categoryId ? [categoryId] : []}
            searchQuery={search}
            priceMin={minPrice}
            priceMax={maxPrice}
            attributes={normalizedAttributes}
            page={page}
          />

          {/* Pagination */}
          {totalPages > page && (
            <div className="mt-6 md:mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => { const next = Math.max(1, page - 1); setPage(next); }}
                disabled={page <= 1}
              >
                {t('prev')}
              </Button>
              <div className="px-4 py-2 border rounded-md">{t('page')} {page} {t('of')} {totalPages}</div>
              <Button
                variant="outline"
                onClick={() => { const next = Math.min(totalPages, page + 1); setPage(next); }}
                disabled={page >= totalPages}
              >
                {t('next')}
              </Button>
            </div>
          )}
      </main>
    </div>
  );
}


