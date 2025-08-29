'use client';

import React, { useState, useEffect } from 'react';
import { ThemePreset } from '@/lib/builder-types';
import { themePresets } from '@/lib/theme-presets';
import { useUpdateGlobalSettings } from '@/queries/global-settings';
import { useCurrentThemePreset } from '@/lib/stores/global-theme-store';
import { getCurrentShopId } from '@/api/webshop-api';
import { cn } from '@/lib/utils';
import { Palette, Sun, Moon, ChevronDown } from 'lucide-react';

type ThemeSelectorProps = {
  onDarkModeChange?: (isDark: boolean) => void;
};

export function ThemeSelector({ onDarkModeChange }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Use the new global theme store and API
  const currentPreset = useCurrentThemePreset();
  const shopId = getCurrentShopId();
  const updateGlobalSettings = useUpdateGlobalSettings(shopId);

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const prefersDark = savedDarkMode ? JSON.parse(savedDarkMode) : false;
    setIsDarkMode(prefersDark);
    if (onDarkModeChange) {
      onDarkModeChange(prefersDark);
    }
  }, [onDarkModeChange]);

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
          supportsDarkMode: true,
          defaultMode: 'light',
        },
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update theme:', error);
      // You could show a toast notification here
    }
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Save to localStorage instead of database
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('darkModeChange', { detail: newDarkMode }));
    
    if (onDarkModeChange) {
      onDarkModeChange(newDarkMode);
    }
  };

  return (
    <div className="relative">
      {/* Dark mode toggle */}
      <button
        onClick={handleDarkModeToggle}
        className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Theme selector dropdown */}
      <div className="relative inline-block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-card-foreground shadow-sm hover:bg-muted cursor-pointer transition-colors"
        >
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">{themePresets[currentPreset].name}</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-md border border-border bg-card shadow-lg">
              <div className="p-1">
                {Object.entries(themePresets).map(([presetKey, preset]) => {
                  const isSelected = currentPreset === presetKey;
                  
                  return (
                    <button
                      key={presetKey}
                      onClick={() => handleThemeChange(presetKey as ThemePreset)}
                      className={cn(
                        "w-full rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-muted cursor-pointer",
                        isSelected && "bg-muted"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{preset.name}</span>
                        <div className="flex space-x-1">
                          <div 
                            className="h-3 w-3 rounded-full border border-border"
                            style={{ backgroundColor: preset.colors.primary }}
                          />
                          <div 
                            className="h-3 w-3 rounded-full border border-border"
                            style={{ backgroundColor: preset.colors.accent }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
