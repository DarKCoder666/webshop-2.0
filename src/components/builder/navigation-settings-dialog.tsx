'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MorphingDialog, 
  MorphingDialogContent, 
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogClose,
  MorphingDialogTitle 
} from '@/components/motion-primitives/morphing-dialog';
import { Navigation2 } from 'lucide-react';
import { SiteConfig } from '@/lib/builder-types';
import { getAllLayouts, WebshopLayout } from '@/api/webshop-api';
import { ImageManagerDialog, type ImageData } from '@/components/image-manager-dialog';

export type NavigationSettings = {
  logoPosition: 'left' | 'middle';
  logoText: string;
  logoImageSrc: string;
  showCartIcon: boolean;
  menuItems: Array<{ name: string; href: string }>;
};

type NavigationSettingsDialogProps = {
  config: SiteConfig;
  onNavigationChange: (settings: NavigationSettings) => void;
};

export function NavigationSettingsDialog({ config, onNavigationChange }: NavigationSettingsDialogProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  
  // Get current navigation settings from config
  const navigationBlock = config.blocks.find(block => block.type === 'navigation');
  const currentSettings: NavigationSettings = {
    logoPosition: (navigationBlock?.props?.logoPosition as 'left' | 'middle') || 'left',
    logoText: (navigationBlock?.props?.logoText as any)?.text || 'Your Logo',
    logoImageSrc: (navigationBlock?.props?.logoImageSrc as string) || '/billy.svg',
    showCartIcon: (navigationBlock?.props?.showCartIcon as boolean) !== false,
    menuItems: (navigationBlock?.props?.menuItems as Array<{name: string; href: string}>) || [
      { name: 'Features', href: '#link' },
      { name: 'Solution', href: '#link' },
      { name: 'Pricing', href: '#link' },
      { name: 'About', href: '#link' },
    ],
  };

  const [settings, setSettings] = React.useState<NavigationSettings>(currentSettings);
  const [pages, setPages] = React.useState<WebshopLayout[]>([]);
  const [loadingPages, setLoadingPages] = React.useState<boolean>(false);

  React.useEffect(() => {
    setSettings(currentSettings);
  }, [config]);

  React.useEffect(() => {
    let mounted = true;
    const loadPages = async () => {
      try {
        setLoadingPages(true);
        const layouts = await getAllLayouts();
        if (mounted) setPages(layouts);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load pages for navigation settings', e);
      } finally {
        if (mounted) setLoadingPages(false);
      }
    };
    loadPages();
    return () => { mounted = false; };
  }, []);

  const handleSave = () => {
    onNavigationChange(settings);
    // Close dialog after save
    setDialogOpen(false);
  };

  const updateMenuItem = (index: number, field: 'name' | 'href', value: string) => {
    const newMenuItems = [...settings.menuItems];
    newMenuItems[index] = { ...newMenuItems[index], [field]: value };
    setSettings({ ...settings, menuItems: newMenuItems });
  };

  const addMenuItem = () => {
    setSettings({
      ...settings,
      menuItems: [...settings.menuItems, { name: 'New Item', href: '#' }]
    });
  };

  const removeMenuItem = (index: number) => {
    const newMenuItems = settings.menuItems.filter((_, i) => i !== index);
    setSettings({ ...settings, menuItems: newMenuItems });
  };

  const formatPageRoute = (layout: WebshopLayout) => {
    if (layout.pageType === 'home') return '/';
    const route = layout.pageType === 'general' && layout.config.route
      ? layout.config.route
      : layout.pageType;
    return `/${route}`;
  };

  const getPageLabel = (layout: WebshopLayout) => {
    const name = layout.pageName || layout.config.name || layout.pageType;
    const path = formatPageRoute(layout);
    return `${name} (${path})`;
  };

  return (
    <MorphingDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <MorphingDialogTrigger className="flex h-full w-full items-center justify-center">
        <Navigation2 className="h-6 w-6 text-muted-foreground" />
      </MorphingDialogTrigger>
      
      <MorphingDialogContainer>
        <MorphingDialogContent className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <MorphingDialogClose />
          
          <div className="p-6 space-y-6">
            <MorphingDialogTitle className="text-lg font-semibold">
              Navigation Settings
            </MorphingDialogTitle>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Logo Position</label>
                <select
                  value={settings.logoPosition}
                  onChange={(e) => setSettings({ ...settings, logoPosition: e.target.value as 'left' | 'middle' })}
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  <option value="left">Left</option>
                  <option value="middle">Middle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Logo Text</label>
                <Input
                  value={settings.logoText}
                  onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                  placeholder="Your Logo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Logo Image</label>
                <div className="flex items-center gap-3">
                  <Input
                    value={settings.logoImageSrc}
                    onChange={(e) => setSettings({ ...settings, logoImageSrc: e.target.value })}
                    placeholder="/billy.svg"
                    className="flex-1"
                  />
                  <ImageManagerDialog
                    maxImages={1}
                    initialSelectedImages={settings.logoImageSrc ? [{ id: settings.logoImageSrc, url: settings.logoImageSrc, name: 'logo', size: 0 }] : []}
                    onSelectionChange={(images: ImageData[]) => {
                      const first = images[0];
                      if (first) {
                        // Defer to avoid updating parent during child render
                        setTimeout(() => {
                          setSettings((s) => ({ ...s, logoImageSrc: first.url }));
                          // Apply immediately to config so header updates live
                          onNavigationChange({ ...settings, logoImageSrc: first.url });
                        }, 0);
                      }
                    }}
                    className="shrink-0"
                    showOnHover={false}
                    showOverlayButton={false}
                    triggerOnChildClick={true}
                  >
                    <button
                      type="button"
                      className="h-9 rounded-md border px-3 text-sm bg-secondary hover:bg-secondary/90 cursor-pointer"
                    >
                      Choose
                    </button>
                  </ImageManagerDialog>
                </div>
                {settings.logoImageSrc && (
                  <div className="mt-2">
                    <img src={settings.logoImageSrc} alt="Logo preview" className="h-8 object-contain" />
                  </div>
                )}
              </div>

              {/* Cart count removed as per requirements */}

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.showCartIcon}
                    onChange={(e) => setSettings({ ...settings, showCartIcon: e.target.checked })}
                  />
                  <span className="text-sm font-medium">Show Cart Icon</span>
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium">Menu Items</label>
                  <Button onClick={addMenuItem} size="sm" variant="outline">
                    Add Item
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Categories and Catalog are always shown.</p>
                <div className="space-y-3">
                  {settings.menuItems.map((item, index) => (
                    <div key={index} className="flex flex-col gap-2 rounded-md border border-border p-3">
                      <div className="flex gap-2 items-center">
                        <Input
                          value={item.name}
                          onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                          placeholder="Menu name"
                          className="flex-1"
                        />
                        <Button
                          onClick={() => removeMenuItem(index)}
                          size="sm"
                          variant="destructive"
                          disabled={settings.menuItems.length <= 1}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="flex gap-2 items-center">
                        <select
                          className="w-1/2 p-2 border border-border rounded-md bg-background"
                          value=""
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            const layout = pages.find((p) => p._id === selectedId);
                            if (layout) {
                              updateMenuItem(index, 'href', formatPageRoute(layout));
                            }
                          }}
                          disabled={loadingPages}
                        >
                          <option value="" disabled>
                            {loadingPages ? 'Loading pages...' : 'Select a page'}
                          </option>
                          {pages.map((p) => (
                            <option key={p._id} value={p._id}>{getPageLabel(p)}</option>
                          ))}
                        </select>
                        <Input
                          value={item.href}
                          onChange={(e) => updateMenuItem(index, 'href', e.target.value)}
                          placeholder="Or enter custom URL"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Save Changes
              </Button>
            </div>
          </div>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
