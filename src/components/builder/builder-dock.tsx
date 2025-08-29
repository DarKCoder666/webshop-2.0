'use client';

import React from 'react';
import { Dock, DockItem, DockIcon, DockLabel } from '@/components/motion-primitives/dock';
import { ThemeSettingsDialog } from './theme-settings-dialog';
import { SEOSettingsDialog } from './seo-settings-dialog';
import { NavigationSettingsDialog, NavigationSettings } from './navigation-settings-dialog';
import { FooterGlobalSettingsDialog } from './footer-global-settings-dialog';
import { PagesManagementDialog } from './pages-management-dialog';
import { SiteConfig, ThemePreset, SEOSettings } from '@/lib/builder-types';
import { themePresets } from '@/lib/theme-presets';
import { useUpdateGlobalSettings } from '@/queries/global-settings';
import { getCurrentShopId, WebshopLayout } from '@/api/webshop-api';
import { useI18n } from '@/lib/i18n';

type BuilderDockProps = {
  config: SiteConfig;
  onConfigUpdate: (updates: Partial<SiteConfig>) => void;
  currentPageType?: string;
  currentLayoutId?: string | null;
  onPageSelect?: (layout: WebshopLayout) => void;
  onOpenPageSettings?: (layout: WebshopLayout) => void;
  isLoading?: boolean;
  onPagesRefreshRef?: (refreshFn: () => Promise<void>) => void;
};

export function BuilderDock({ config, onConfigUpdate, currentPageType, currentLayoutId, onPageSelect, onOpenPageSettings, isLoading, onPagesRefreshRef }: BuilderDockProps) {
  const t = useI18n();
  const shopId = getCurrentShopId();
  const updateGlobalSettings = useUpdateGlobalSettings(shopId);

  const handleThemeChange = async (preset: ThemePreset) => {
    const themeData = themePresets[preset];
    
    try {
      await updateGlobalSettings.mutateAsync({
        theme: {
          preset,
          colors: themeData.colors,
          darkColors: themeData.darkColors,
          fontSans: themeData.fonts.sans,
          fontSerif: themeData.fonts.serif,
          fontMono: themeData.fonts.mono,
          radius: '0.5rem',
          supportsDarkMode: config.theme?.supportsDarkMode ?? true,
          defaultMode: config.theme?.defaultMode || 'light',
        },
      });
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  const handleThemeConfigChange = async (themeConfig: Partial<SiteConfig['theme']>) => {
    try {
      await updateGlobalSettings.mutateAsync({
        theme: {
          preset: config.theme?.preset || 'default',
          colors: config.theme?.colors || themePresets.default.colors,
          darkColors: config.theme?.darkColors || themePresets.default.darkColors,
          fontSans: config.theme?.fontSans || themePresets.default.fonts.sans,
          fontSerif: config.theme?.fontSerif || themePresets.default.fonts.serif,
          fontMono: config.theme?.fontMono || themePresets.default.fonts.mono,
          radius: config.theme?.radius || '0.5rem',
          supportsDarkMode: config.theme?.supportsDarkMode ?? true,
          defaultMode: config.theme?.defaultMode || 'light',
          ...themeConfig,
        },
      });
    } catch (error) {
      console.error('Failed to update theme config:', error);
    }
  };

  const handleSEOChange = (seo: SEOSettings) => {
    onConfigUpdate({ seo });
  };

  const handleNavigationChange = (settings: NavigationSettings) => {
    // Find existing navigation block or create new one
    const navigationBlockIndex = config.blocks.findIndex(block => block.type === 'navigation');
    const updatedBlocks = [...config.blocks];
    
    const navigationBlock = {
      id: navigationBlockIndex >= 0 ? config.blocks[navigationBlockIndex].id : `nav-${Date.now()}`,
      type: 'navigation' as const,
      props: {
        logoPosition: settings.logoPosition,
        logoText: { text: settings.logoText },
        logoImageSrc: settings.logoImageSrc,
        showCartIcon: settings.showCartIcon,
        menuItems: settings.menuItems,
      },
    };

    if (navigationBlockIndex >= 0) {
      updatedBlocks[navigationBlockIndex] = navigationBlock;
    } else {
      // Add navigation at the beginning
      updatedBlocks.unshift(navigationBlock);
    }

    onConfigUpdate({ blocks: updatedBlocks });
  };


  return (
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2">
      <Dock className="bg-card/90 backdrop-blur-sm border border-border">
        <DockItem>
          <DockIcon>
            <ThemeSettingsDialog 
              config={config} 
              onThemeChange={handleThemeChange}
              onThemeConfigChange={handleThemeConfigChange}
            />
          </DockIcon>
          <DockLabel>{t('dock_theme_settings')}</DockLabel>
        </DockItem>
        
        <DockItem>
          <DockIcon>
            <SEOSettingsDialog config={config} onSEOChange={handleSEOChange} />
          </DockIcon>
          <DockLabel>{t('dock_seo_settings')}</DockLabel>
        </DockItem>

        <DockItem>
          <DockIcon>
            <NavigationSettingsDialog config={config} onNavigationChange={handleNavigationChange} />
          </DockIcon>
          <DockLabel>{t('dock_navigation')}</DockLabel>
        </DockItem>

        <DockItem>
          <DockIcon>
            <FooterGlobalSettingsDialog />
          </DockIcon>
          <DockLabel>{t('dock_footer')}</DockLabel>
        </DockItem>

        <DockItem>
          <DockIcon>
            <PagesManagementDialog 
              currentPageType={currentPageType}
              currentLayoutId={currentLayoutId}
              onPageSelect={onPageSelect}
              onOpenPageSettings={onOpenPageSettings}
              isLoading={isLoading}
              onRefreshRef={onPagesRefreshRef}
            />
          </DockIcon>
          <DockLabel>{t('dock_pages')}</DockLabel>
        </DockItem>

        {/* Per-block footer settings still available on blocks; global type handled here */}
      </Dock>
    </div>
  );
}
