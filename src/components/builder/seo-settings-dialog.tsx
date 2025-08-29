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
import { useI18n } from '@/lib/i18n';

type SEOSettingsDialogProps = {
  config: SiteConfig;
  onSEOChange: (seo: SEOSettings) => void;
};

export function SEOSettingsDialog({ config, onSEOChange }: SEOSettingsDialogProps) {
  const t = useI18n();
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
                {t('seo_settings_title')}
              </MorphingDialogTitle>
              
              <MorphingDialogDescription className="text-sm text-muted-foreground">
                {t('seo_settings_description')}
              </MorphingDialogDescription>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="seo-title" className="block text-sm font-medium text-card-foreground mb-2">
                  {t('page_title_label')}
                </label>
                <Input
                  id="seo-title"
                  type="text"
                  value={seoData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={t('enter_page_title')}
                  maxLength={60}
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  {(seoData.title?.length || 0) + '/60 ' + t('characters')}
                </div>
              </div>
              
              <div>
                <label htmlFor="seo-description" className="block text-sm font-medium text-card-foreground mb-2">
                  {t('meta_description_label')}
                </label>
                <Textarea
                  id="seo-description"
                  value={seoData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('enter_meta_description')}
                  rows={3}
                  className="resize-none"
                  maxLength={160}
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  {(seoData.description?.length || 0) + '/160 ' + t('characters')}
                </div>
              </div>
              
              <div>
                <label htmlFor="seo-keywords" className="block text-sm font-medium text-card-foreground mb-2">
                  {t('keywords_label')}
                </label>
                <Input
                  id="seo-keywords"
                  type="text"
                  value={seoData.keywords}
                  onChange={(e) => handleInputChange('keywords', e.target.value)}
                  placeholder={t('keywords_placeholder')}
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  {t('separate_keywords_with_commas')}
                </div>
              </div>
              
              <div>
                <label htmlFor="seo-ogimage" className="block text-sm font-medium text-card-foreground mb-2">
                  {t('open_graph_image_url')}
                </label>
                <Input
                  id="seo-ogimage"
                  type="url"
                  value={seoData.ogImage}
                  onChange={(e) => handleInputChange('ogImage', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  {t('og_image_help')}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
              <MorphingDialogClose className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                {t('cancel')}
              </MorphingDialogClose>
              
              <button
                onClick={handleSave}
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <Save className="mr-2 h-4 w-4" />
                {t('save_changes')}
              </button>
            </div>
          </div>
          
          <MorphingDialogClose />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
