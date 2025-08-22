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

export type NavigationSettings = {
  logoPosition: 'left' | 'middle';
  logoText: string;
  logoImageSrc: string;
  cartCount: number;
  showCartIcon: boolean;
  menuItems: Array<{ name: string; href: string }>;
};

type NavigationSettingsDialogProps = {
  config: SiteConfig;
  onNavigationChange: (settings: NavigationSettings) => void;
};

export function NavigationSettingsDialog({ config, onNavigationChange }: NavigationSettingsDialogProps) {
  
  // Get current navigation settings from config
  const navigationBlock = config.blocks.find(block => block.type === 'navigation');
  const currentSettings: NavigationSettings = {
    logoPosition: (navigationBlock?.props?.logoPosition as 'left' | 'middle') || 'left',
    logoText: navigationBlock?.props?.logoText?.text || 'Your Logo',
    logoImageSrc: navigationBlock?.props?.logoImageSrc || '/billy.svg',
    cartCount: navigationBlock?.props?.cartCount || 0,
    showCartIcon: navigationBlock?.props?.showCartIcon !== false,
    menuItems: navigationBlock?.props?.menuItems || [
      { name: 'Features', href: '#link' },
      { name: 'Solution', href: '#link' },
      { name: 'Pricing', href: '#link' },
      { name: 'About', href: '#link' },
    ],
  };

  const [settings, setSettings] = React.useState<NavigationSettings>(currentSettings);

  React.useEffect(() => {
    setSettings(currentSettings);
  }, [config]);

  const handleSave = () => {
    onNavigationChange(settings);
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

  return (
    <MorphingDialog>
      <MorphingDialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-12 w-12">
        <Navigation2 className="h-5 w-5" />
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
                <label className="block text-sm font-medium mb-2">Logo Image URL</label>
                <Input
                  value={settings.logoImageSrc}
                  onChange={(e) => setSettings({ ...settings, logoImageSrc: e.target.value })}
                  placeholder="/billy.svg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cart Count</label>
                <Input
                  type="number"
                  value={settings.cartCount}
                  onChange={(e) => setSettings({ ...settings, cartCount: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

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
                
                <div className="space-y-3">
                  {settings.menuItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={item.name}
                        onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                        placeholder="Menu name"
                        className="flex-1"
                      />
                      <Input
                        value={item.href}
                        onChange={(e) => updateMenuItem(index, 'href', e.target.value)}
                        placeholder="Link URL"
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
