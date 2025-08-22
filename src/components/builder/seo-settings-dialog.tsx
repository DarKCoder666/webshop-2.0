'use client';

import React, { useState } from 'react';
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogTitle,
  MorphingDialogDescription,
} from '@/components/motion-primitives/morphing-dialog';
import { SiteConfig, SEOSettings } from '@/lib/builder-types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search, Save } from 'lucide-react';

type SEOSettingsDialogProps = {
  config: SiteConfig;
  onSEOChange: (seo: SEOSettings) => void;
};

export function SEOSettingsDialog({ config, onSEOChange }: SEOSettingsDialogProps) {
  const [seoData, setSeoData] = useState<SEOSettings>({
    title: config.seo?.title || '',
    description: config.seo?.description || '',
    keywords: config.seo?.keywords || '',
    ogImage: config.seo?.ogImage || '',
  });

  const handleSave = () => {
    onSEOChange(seoData);
    // Close the dialog by triggering the close button
    const closeButton = document.querySelector('[aria-label="Close dialog"]') as HTMLButtonElement;
    if (closeButton) {
      closeButton.click();
    }
  };

  const handleInputChange = (field: keyof SEOSettings, value: string) => {
    setSeoData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <MorphingDialog>
      <MorphingDialogTrigger className="flex h-full w-full items-center justify-center">
        <Search className="h-6 w-6 text-muted-foreground" />
      </MorphingDialogTrigger>
      
      <MorphingDialogContainer>
        <MorphingDialogContent className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border border-border">
          <div className="space-y-6">
            <div>
              <MorphingDialogTitle className="text-lg font-semibold text-card-foreground">
                SEO Settings
              </MorphingDialogTitle>
              
              <MorphingDialogDescription className="text-sm text-muted-foreground">
                Configure SEO metadata for this page
              </MorphingDialogDescription>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="seo-title" className="block text-sm font-medium text-card-foreground mb-2">
                  Page Title
                </label>
                <Input
                  id="seo-title"
                  type="text"
                  value={seoData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter page title..."
                  maxLength={60}
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  {seoData.title?.length || 0}/60 characters
                </div>
              </div>
              
              <div>
                <label htmlFor="seo-description" className="block text-sm font-medium text-card-foreground mb-2">
                  Meta Description
                </label>
                <Textarea
                  id="seo-description"
                  value={seoData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter meta description..."
                  rows={3}
                  className="resize-none"
                  maxLength={160}
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  {seoData.description?.length || 0}/160 characters
                </div>
              </div>
              
              <div>
                <label htmlFor="seo-keywords" className="block text-sm font-medium text-card-foreground mb-2">
                  Keywords
                </label>
                <Input
                  id="seo-keywords"
                  type="text"
                  value={seoData.keywords}
                  onChange={(e) => handleInputChange('keywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3..."
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  Separate keywords with commas
                </div>
              </div>
              
              <div>
                <label htmlFor="seo-ogimage" className="block text-sm font-medium text-card-foreground mb-2">
                  Open Graph Image URL
                </label>
                <Input
                  id="seo-ogimage"
                  type="url"
                  value={seoData.ogImage}
                  onChange={(e) => handleInputChange('ogImage', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  Image displayed when sharing on social media
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
              <MorphingDialogClose className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                Cancel
              </MorphingDialogClose>
              
              <button
                onClick={handleSave}
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
          
          <MorphingDialogClose />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
