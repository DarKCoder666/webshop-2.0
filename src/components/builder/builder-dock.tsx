'use client';

import React from 'react';
import { Dock, DockItem, DockIcon, DockLabel } from '@/components/motion-primitives/dock';
import { ThemeSettingsDialog } from './theme-settings-dialog';
import { SEOSettingsDialog } from './seo-settings-dialog';
import { NavigationSettingsDialog, NavigationSettings } from './navigation-settings-dialog';
import { SiteConfig, ThemePreset, SEOSettings } from '@/lib/builder-types';
import { themePresets } from '@/lib/theme-presets';

type BuilderDockProps = {
  config: SiteConfig;
  onConfigUpdate: (updates: Partial<SiteConfig>) => void;
};

export function BuilderDock({ config, onConfigUpdate }: BuilderDockProps) {
  const handleThemeChange = (preset: ThemePreset) => {
    const themeData = themePresets[preset];
    onConfigUpdate({
      theme: {
        preset,
        colors: themeData.colors,
        darkColors: themeData.darkColors,
        fontSans: themeData.fonts.sans,
        fontSerif: themeData.fonts.serif,
        fontMono: themeData.fonts.mono,
        radius: '0.5rem',
        darkMode: config.theme?.darkMode || false,
        supportsDarkMode: config.theme?.supportsDarkMode ?? true,
        defaultMode: config.theme?.defaultMode || 'light',
      },
    });
  };

  const handleThemeConfigChange = (themeConfig: Partial<SiteConfig['theme']>) => {
    onConfigUpdate({
      theme: {
        ...config.theme,
        ...themeConfig,
      },
    });
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
        cartCount: settings.cartCount,
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
          <DockLabel>Theme Settings</DockLabel>
        </DockItem>
        
        <DockItem>
          <DockIcon>
            <SEOSettingsDialog config={config} onSEOChange={handleSEOChange} />
          </DockIcon>
          <DockLabel>SEO Settings</DockLabel>
        </DockItem>

        <DockItem>
          <DockIcon>
            <NavigationSettingsDialog config={config} onNavigationChange={handleNavigationChange} />
          </DockIcon>
          <DockLabel>Navigation</DockLabel>
        </DockItem>
      </Dock>
    </div>
  );
}
