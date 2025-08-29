'use client';

import React, { useEffect, useState } from 'react';
import { useGlobalSettings } from '@/queries/global-settings';
import { themePresets, generateCSSVariables } from '@/lib/theme-presets';
import { getCurrentShopId } from '@/api/webshop-api';
import { ThemePreset, ThemeColors } from '@/lib/builder-types';

interface GlobalThemeCSSProviderProps {
  children: React.ReactNode;
}

export function GlobalThemeCSSProvider({ children }: GlobalThemeCSSProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const shopId = getCurrentShopId();
  const { data: globalSettings } = useGlobalSettings(shopId);

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
    // Use global settings theme or fallback to default
    const preset = (globalSettings?.theme?.preset as ThemePreset) || 'default';
    const themeData = themePresets[preset];
    const supportsDarkMode = globalSettings?.theme?.supportsDarkMode ?? true;
    const defaultMode = globalSettings?.theme?.defaultMode || 'light';
    
    if (!themeData) return;

    // Use the colors and fonts from the global settings if available, otherwise use preset defaults
    const lightColors = (globalSettings?.theme?.colors as ThemeColors) || themeData.colors;
    const darkColors = (globalSettings?.theme?.darkColors as ThemeColors) || themeData.darkColors;
    const fonts = {
      sans: globalSettings?.theme?.fontSans || themeData.fonts.sans,
      serif: globalSettings?.theme?.fontSerif || themeData.fonts.serif,
      mono: globalSettings?.theme?.fontMono || themeData.fonts.mono,
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
  }, [
    globalSettings?.theme?.preset, 
    globalSettings?.theme?.colors, 
    globalSettings?.theme?.darkColors, 
    globalSettings?.theme?.fontSans, 
    globalSettings?.theme?.fontSerif, 
    globalSettings?.theme?.fontMono, 
    globalSettings?.theme?.supportsDarkMode, 
    globalSettings?.theme?.defaultMode, 
    isDarkMode
  ]);

  return <>{children}</>;
}
