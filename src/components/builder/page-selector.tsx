"use client";

import React, { useState, useEffect } from 'react';
import { getAllLayouts, getWebsiteProductCategories } from '@/api/webshop-api';
import { cn } from '@/lib/utils';

interface PageOption {
  value: string;
  label: string;
  type: 'static' | 'dynamic' | 'category';
}

interface PageSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PageSelector({ value, onChange, className }: PageSelectorProps) {
  const [pages, setPages] = useState<PageOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPages = async () => {
      try {
        setLoading(true);
        
        // Static pages
        const staticPages: PageOption[] = [
          { value: '/', label: 'Home', type: 'static' },
          { value: '/catalog', label: 'Catalog', type: 'static' },
          { value: '/builder', label: 'Builder', type: 'static' },
        ];

        // Dynamic pages from layouts
        const dynamicPages: PageOption[] = [];
        try {
          const layouts = await getAllLayouts();
          layouts.forEach(layout => {
            if (layout.pageType !== 'home') {
              const route = layout.pageType === 'general' && layout.config.route 
                ? `/${layout.config.route}` 
                : `/${layout.pageType}`;
              
              dynamicPages.push({
                value: route,
                label: layout.config.name || layout.pageType.charAt(0).toUpperCase() + layout.pageType.slice(1),
                type: 'dynamic'
              });
            }
          });
        } catch (error) {
          console.warn('Failed to load dynamic pages:', error);
        }

        // Category pages
        const categoryPages: PageOption[] = [];
        try {
          const categoriesResponse = await getWebsiteProductCategories();
          categoriesResponse.results.forEach(category => {
            categoryPages.push({
              value: `/category/${category._id}`,
              label: `Category: ${category.name}`,
              type: 'category'
            });
          });
        } catch (error) {
          console.warn('Failed to load categories:', error);
        }

        setPages([...staticPages, ...dynamicPages, ...categoryPages]);
      } catch (error) {
        console.error('Failed to load pages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPages();
  }, []);

  if (loading) {
    return (
      <select 
        className={cn(
          "rounded border border-border px-2 py-1 text-xs bg-background text-foreground min-w-[150px]",
          className
        )}
        disabled
      >
        <option>Loading pages...</option>
      </select>
    );
  }

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "rounded border border-border px-2 py-1 text-xs bg-background text-foreground min-w-[150px]",
        value && "bg-primary/10 border-primary",
        className
      )}
    >
      <option value="">Select page...</option>
      
      {/* Static pages */}
      <optgroup label="Static Pages">
        {pages.filter(p => p.type === 'static').map(page => (
          <option key={page.value} value={page.value}>
            {page.label}
          </option>
        ))}
      </optgroup>
      
      {/* Dynamic pages */}
      {pages.some(p => p.type === 'dynamic') && (
        <optgroup label="Dynamic Pages">
          {pages.filter(p => p.type === 'dynamic').map(page => (
            <option key={page.value} value={page.value}>
              {page.label}
            </option>
          ))}
        </optgroup>
      )}
      
      {/* Category pages */}
      {pages.some(p => p.type === 'category') && (
        <optgroup label="Categories">
          {pages.filter(p => p.type === 'category').map(page => (
            <option key={page.value} value={page.value}>
              {page.label}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}
