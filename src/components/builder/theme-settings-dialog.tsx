'use client';

import React from 'react';
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogTitle,
  MorphingDialogDescription,
} from '@/components/motion-primitives/morphing-dialog';
import { themePresets } from '@/lib/theme-presets';
import { SiteConfig, ThemePreset } from '@/lib/builder-types';
import { cn } from '@/lib/utils';
import { Palette, Check, Sun, Moon, Settings } from 'lucide-react';
import { useCurrentThemePreset, useGlobalThemeStore } from '@/lib/stores/global-theme-store';
import { useI18n } from '@/lib/i18n';

type ThemeSettingsDialogProps = {
  config: SiteConfig;
  onThemeChange: (preset: ThemePreset) => void;
  onThemeConfigChange: (themeConfig: Partial<SiteConfig['theme']>) => void;
};

export function ThemeSettingsDialog({ config, onThemeChange, onThemeConfigChange }: ThemeSettingsDialogProps) {
  // Use global theme store for current theme info
  const globalCurrentPreset = useCurrentThemePreset();
  const { getSupportsDarkMode, getDefaultMode } = useGlobalThemeStore();
  const t = useI18n();
  
  // Fallback to config if global store is not yet loaded
  const currentPreset = globalCurrentPreset || config.theme?.preset || 'default';
  const supportsDarkMode = getSupportsDarkMode() ?? config.theme?.supportsDarkMode ?? true;
  const defaultMode = getDefaultMode() || config.theme?.defaultMode || 'light';

  return (
    <MorphingDialog>
      <MorphingDialogTrigger className="flex h-full w-full items-center justify-center">
        <Palette className="h-6 w-6 text-muted-foreground" />
      </MorphingDialogTrigger>
      
      <MorphingDialogContainer>
        <MorphingDialogContent className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border border-border max-h-[85vh] flex flex-col">
          <div className="space-y-4 flex-shrink-0">
            <MorphingDialogTitle className="text-lg font-semibold text-card-foreground">
              {t('theme_settings_title')}
            </MorphingDialogTitle>
            
            <MorphingDialogDescription className="text-sm text-muted-foreground">
              {t('theme_settings_description')}
            </MorphingDialogDescription>

            {/* Dark Mode Support Controls */}
            <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-card-foreground">{t('dark_mode_support')}</span>
              </div>
              
              <div className="space-y-3">
                {/* Enable/Disable Dark Mode */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supportsDarkMode}
                    onChange={(e) => {
                      // When enabling dark mode support, reset to light mode as default
                      // When disabling, keep current defaultMode or use light if none set
                      const updates: Partial<SiteConfig['theme']> = {
                        supportsDarkMode: e.target.checked
                      };
                      // Only set defaultMode when enabling dark mode support
                      if (e.target.checked) {
                        updates.defaultMode = 'light';
                      }
                      onThemeConfigChange(updates);
                    }}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-card-foreground">{t('enable_dark_light_switching')}</span>
                </label>

                {/* Default Mode Selection (when dark mode is disabled) */}
                {!supportsDarkMode && (
                  <div className="ml-6 space-y-2">
                    <span className="text-xs text-muted-foreground">{t('site_will_use')}</span>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="defaultMode"
                          value="light"
                          checked={defaultMode === 'light'}
                          onChange={() => onThemeConfigChange({ defaultMode: 'light', supportsDarkMode: false })}
                          className="text-primary focus:ring-primary"
                        />
                        <Sun className="h-3 w-3" />
                        <span className="text-xs">{t('light_mode_only')}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="defaultMode"
                          value="dark"
                          checked={defaultMode === 'dark'}
                          onChange={() => onThemeConfigChange({ defaultMode: 'dark', supportsDarkMode: false })}
                          className="text-primary focus:ring-primary"
                        />
                        <Moon className="h-3 w-3" />
                        <span className="text-xs">{t('dark_mode_only')}</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-0 pr-2 -mr-2">
            <div className="space-y-3 py-2">
              {Object.entries(themePresets).map(([presetKey, preset]) => {
                const isSelected = currentPreset === presetKey;
                
                return (
                  <button
                    key={presetKey}
                    onClick={() => onThemeChange(presetKey as ThemePreset)}
                    className={cn(
                      "w-full rounded-lg border p-4 text-left transition-all hover:shadow-md hover:border-primary",
                      isSelected 
                        ? "border-primary bg-primary/10 shadow-md" 
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-card-foreground">{preset.name}</div>
                        {isSelected && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      
                      {/* Beautiful color palette preview */}
                      <div className="space-y-3">
                        {/* Show light mode if dark mode is supported OR if default is light */}
                        {(supportsDarkMode || defaultMode === 'light') && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                {supportsDarkMode ? t('light_mode') : t('theme_preview')}
                              </span>
                              <Sun className="h-3 w-3 text-muted-foreground" />
                            </div>
                            
                            {/* Primary color bar */}
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-6 w-16 rounded-md border border-border shadow-sm"
                                style={{ backgroundColor: preset.colors.primary }}
                              />
                              <span className="text-xs text-muted-foreground">{t('color_primary')}</span>
                            </div>
                            
                            {/* Secondary colors grid */}
                            <div className="grid grid-cols-4 gap-2">
                              <div className="space-y-1">
                                <div 
                                  className="h-4 w-full rounded border border-border"
                                  style={{ backgroundColor: preset.colors.accent }}
                                />
                                <span className="text-[10px] text-muted-foreground">{t('color_accent')}</span>
                              </div>
                              <div className="space-y-1">
                                <div 
                                  className="h-4 w-full rounded border border-border"
                                  style={{ backgroundColor: preset.colors.secondary }}
                                />
                                <span className="text-[10px] text-muted-foreground">{t('color_secondary')}</span>
                              </div>
                              <div className="space-y-1">
                                <div 
                                  className="h-4 w-full rounded border border-border"
                                  style={{ backgroundColor: preset.colors.muted }}
                                />
                                <span className="text-[10px] text-muted-foreground">{t('color_muted')}</span>
                              </div>
                              <div className="space-y-1">
                                <div 
                                  className="h-4 w-full rounded border border-border"
                                  style={{ backgroundColor: preset.colors.background }}
                                />
                                <span className="text-[10px] text-muted-foreground">{t('color_background')}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Show dark mode if dark mode is supported OR if default is dark */}
                        {(supportsDarkMode || defaultMode === 'dark') && (
                          <div className={cn("space-y-2", supportsDarkMode && "pt-2 border-t border-border/50")}>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                {supportsDarkMode ? t('dark_mode') : t('theme_preview')}
                              </span>
                              <Moon className="h-3 w-3 text-muted-foreground" />
                            </div>
                            
                            {/* Primary color bar */}
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-6 w-16 rounded-md border border-border shadow-sm"
                                style={{ backgroundColor: preset.darkColors.primary }}
                              />
                              <span className="text-xs text-muted-foreground">{t('color_primary')}</span>
                            </div>
                            
                            {/* Secondary colors grid */}
                            <div className="grid grid-cols-4 gap-2">
                              <div className="space-y-1">
                                <div 
                                  className="h-4 w-full rounded border border-border"
                                  style={{ backgroundColor: preset.darkColors.accent }}
                                />
                                <span className="text-[10px] text-muted-foreground">{t('color_accent')}</span>
                              </div>
                              <div className="space-y-1">
                                <div 
                                  className="h-4 w-full rounded border border-border"
                                  style={{ backgroundColor: preset.darkColors.secondary }}
                                />
                                <span className="text-[10px] text-muted-foreground">{t('color_secondary')}</span>
                              </div>
                              <div className="space-y-1">
                                <div 
                                  className="h-4 w-full rounded border border-border"
                                  style={{ backgroundColor: preset.darkColors.muted }}
                                />
                                <span className="text-[10px] text-muted-foreground">{t('color_muted')}</span>
                              </div>
                              <div className="space-y-1">
                                <div 
                                  className="h-4 w-full rounded border border-border"
                                  style={{ backgroundColor: preset.darkColors.background }}
                                />
                                <span className="text-[10px] text-muted-foreground">{t('color_background')}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="pt-4 text-xs text-muted-foreground flex-shrink-0 border-t border-border/50 mt-4">
            {t('changes_applied_saved')}
          </div>
          
          <MorphingDialogClose />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
