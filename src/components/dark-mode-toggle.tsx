'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { SiteConfig } from '@/lib/builder-types';
import { useGlobalThemeStore } from '@/lib/stores/global-theme-store';

type DarkModeToggleProps = {
  config?: SiteConfig;
};

export function DarkModeToggle({ config }: DarkModeToggleProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { globalSettings, getSupportsDarkMode, getDefaultMode } = useGlobalThemeStore();

  // Check if dark mode is supported by the site - use global store if available, otherwise config
  const supportsDarkMode = globalSettings?.theme?.supportsDarkMode !== undefined
    ? globalSettings.theme.supportsDarkMode
    : (config?.theme?.supportsDarkMode ?? true);
  const defaultMode = globalSettings?.theme?.defaultMode || config?.theme?.defaultMode || 'light';

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    if (!supportsDarkMode) {
      // If dark mode is not supported, use the default mode
      setIsDarkMode(defaultMode === 'dark');
      return;
    }
    
    const savedDarkMode = localStorage.getItem('darkMode');
    const prefersDark = savedDarkMode ? JSON.parse(savedDarkMode) : false;
    setIsDarkMode(prefersDark);
  }, [supportsDarkMode, defaultMode]);

  const handleDarkModeToggle = () => {
    if (!supportsDarkMode) return; // Don't allow toggle if not supported
    
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Save to localStorage
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    
    // Dispatch custom event to notify theme provider
    window.dispatchEvent(new CustomEvent('darkModeChange', { detail: newDarkMode }));
  };

  // Don't render the toggle if dark mode is not supported
  if (!supportsDarkMode) {
    return null;
  }

  return (
    <button
      onClick={handleDarkModeToggle}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
