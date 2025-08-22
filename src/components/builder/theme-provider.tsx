'use client';

import React, { useEffect, useState } from 'react';
import { SiteConfig } from '@/lib/builder-types';
import { themePresets, generateCSSVariables } from '@/lib/theme-presets';

type ThemeProviderProps = {
  config: SiteConfig;
  children: React.ReactNode;
};

export function ThemeProvider({ config, children }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load initial dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const prefersDark = savedDarkMode ? JSON.parse(savedDarkMode) : false;
    setIsDarkMode(prefersDark);
  }, []);

  // Listen for dark mode changes (from theme selector and other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'darkMode' && e.newValue !== null) {
        setIsDarkMode(JSON.parse(e.newValue));
      }
    };

    const handleDarkModeChange = (e: CustomEvent) => {
      setIsDarkMode(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('darkModeChange', handleDarkModeChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('darkModeChange', handleDarkModeChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const preset = config.theme?.preset || 'default';
    const themeData = themePresets[preset];
    const supportsDarkMode = config.theme?.supportsDarkMode ?? true;
    const defaultMode = config.theme?.defaultMode || 'light';
    
    if (!themeData) return;

    // Use the colors and fonts from the config if available, otherwise use preset defaults
    const lightColors = config.theme?.colors || themeData.colors;
    const darkColors = config.theme?.darkColors || themeData.darkColors;
    const fonts = {
      sans: config.theme?.fontSans || themeData.fonts.sans,
      serif: config.theme?.fontSerif || themeData.fonts.serif,
      mono: config.theme?.fontMono || themeData.fonts.mono,
    };

    // Generate CSS for both light and dark modes
    const themeCSS = generateCSSVariables(lightColors, darkColors, fonts);
    
    // Remove existing theme styles
    const existingStyle = document.getElementById('dynamic-theme-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Inject new theme styles
    const style = document.createElement('style');
    style.id = 'dynamic-theme-styles';
    style.textContent = themeCSS;
    document.head.appendChild(style);

    // Apply dark mode class to html element
    const htmlElement = document.documentElement;
    
    if (!supportsDarkMode) {
      // Use fixed mode when dark mode is disabled
      if (defaultMode === 'dark') {
        htmlElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
      }
    } else {
      // Use user preference when dark mode is enabled
      if (isDarkMode) {
        htmlElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
      }
    }
    
    return () => {
      const styleToRemove = document.getElementById('dynamic-theme-styles');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [config.theme?.preset, config.theme?.colors, config.theme?.darkColors, config.theme?.fontSans, config.theme?.fontSerif, config.theme?.fontMono, config.theme?.supportsDarkMode, config.theme?.defaultMode, isDarkMode]);

  return <>{children}</>;
}
