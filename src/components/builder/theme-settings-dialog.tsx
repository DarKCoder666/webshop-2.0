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

type ThemeSettingsDialogProps = {
  config: SiteConfig;
  onThemeChange: (preset: ThemePreset) => void;
  onThemeConfigChange: (themeConfig: Partial<SiteConfig['theme']>) => void;
};

export function ThemeSettingsDialog({ config, onThemeChange, onThemeConfigChange }: ThemeSettingsDialogProps) {
  const currentPreset = config.theme?.preset || 'default';
  const supportsDarkMode = config.theme?.supportsDarkMode ?? true;
  const defaultMode = config.theme?.defaultMode || 'light';

  return (
    <MorphingDialog>
      <MorphingDialogTrigger className="flex h-full w-full items-center justify-center">
        <Palette className="h-6 w-6 text-muted-foreground" />
      </MorphingDialogTrigger>
      
      <MorphingDialogContainer>
        <MorphingDialogContent className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border border-border max-h-[85vh] flex flex-col">
          <div className="space-y-4 flex-shrink-0">
            <MorphingDialogTitle className="text-lg font-semibold text-card-foreground">
              Theme Settings
            </MorphingDialogTitle>
            
            <MorphingDialogDescription className="text-sm text-muted-foreground">
              Choose a color palette and configure dark mode support
            </MorphingDialogDescription>

            {/* Dark Mode Support Controls */}
            <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-card-foreground">Dark Mode Support</span>
              </div>
              
              <div className="space-y-3">
                {/* Enable/Disable Dark Mode */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supportsDarkMode}
                    onChange={(e) => onThemeConfigChange({ supportsDarkMode: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-card-foreground">Enable dark/light mode switching for visitors</span>
                </label>

                {/* Default Mode Selection (when dark mode is disabled) */}
                {!supportsDarkMode && (
                  <div className="ml-6 space-y-2">
                    <span className="text-xs text-muted-foreground">Site will use:</span>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="defaultMode"
                          value="light"
                          checked={defaultMode === 'light'}
                          onChange={() => onThemeConfigChange({ defaultMode: 'light' })}
                          className="text-primary focus:ring-primary"
                        />
                        <Sun className="h-3 w-3" />
                        <span className="text-xs">Light mode only</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="defaultMode"
                          value="dark"
                          checked={defaultMode === 'dark'}
                          onChange={() => onThemeConfigChange({ defaultMode: 'dark' })}
                          className="text-primary focus:ring-primary"
                        />
                        <Moon className="h-3 w-3" />
                        <span className="text-xs">Dark mode only</span>
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
                                {supportsDarkMode ? 'Light Mode' : 'Theme Preview'}
                              </span>
                              <Sun className="h-3 w-3 text-muted-foreground" />
                            </div>
                            
                            {/* Primary color bar */}
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-6 w-16 rounded-md border border-border shadow-sm"
                                style={{ backgroundColor: preset.colors.primary }}
                              />
                              <span className="text-xs text-muted-foreground">Primary</span>
                            </div>
                            
                            {/* Secondary colors grid */}
                            <div className="grid grid-cols-4 gap-2">
                              <div className="space-y-1">
                                <div 
                                  className="h-4 w-full rounded border border-border"
                                  style={{ backgroundColor: preset.colors.accent }}
                                />
                                <span className="text-[10px] text-muted-foreground">Accent</span>
                              </div>
                              <div className="space-y-1">
                                <div 
                                  className="h-4 w-full rounded border border-border"
                                  style={{ backgroundColor: preset.colors.secondary }}
                                />
                                <span className="text-[10px] text-muted-foreground">Secondary</span>
                              </div>
                              <div className="space-y-1">
                                <div 
                                  className="h-4 w-full rounded border border-border"
                                  style={{ backgroundColor: preset.colors.muted }}
                                />
                                <span className="text-[10px] text-muted-foreground">Muted</span>
                              </div>
                              <div className="space-y-1">
                                <div 
                                  className="h-4 w-full rounded border border-border"
                                  style={{ backgroundColor: preset.colors.background }}
                                />
                                <span className="text-[10px] text-muted-foreground">Background</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Show dark mode if dark mode is supported OR if default is dark */}
                        {(supportsDarkMode || defaultMode === 'dark') && (
                          <div className={cn("space-y-2", supportsDarkMode && "pt-2 border-t border-border/50")}>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                {supportsDarkMode ? 'Dark Mode' : 'Theme Preview'}
                              </span>
                              <Moon className="h-3 w-3 text-muted-foreground" />
                            </div>
                            
                            {/* Primary color bar */}
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-6 w-16 rounded-md border border-border shadow-sm"
                                style={{ backgroundColor: preset.darkColors.primary }}
                              />
                              <span className="text-xs text-muted-foreground">Primary</span>
                            </div>
                            
                            {/* Secondary colors grid */}
                            <div className="grid grid-cols-4 gap-2">
                              <div className="space-y-1">
                                <div 
                                  className="h-4 w-full rounded border border-border"
                                  style={{ backgroundColor: preset.darkColors.accent }}
                                />
                                <span className="text-[10px] text-muted-foreground">Accent</span>
                              </div>
                              <div className="space-y-1">
                                <div 
                                  className="h-4 w-full rounded border border-border"
                                  style={{ backgroundColor: preset.darkColors.secondary }}
                                />
                                <span className="text-[10px] text-muted-foreground">Secondary</span>
                              </div>
                              <div className="space-y-1">
                                <div 
                                  className="h-4 w-full rounded border border-border"
                                  style={{ backgroundColor: preset.darkColors.muted }}
                                />
                                <span className="text-[10px] text-muted-foreground">Muted</span>
                              </div>
                              <div className="space-y-1">
                                <div 
                                  className="h-4 w-full rounded border border-border"
                                  style={{ backgroundColor: preset.darkColors.background }}
                                />
                                <span className="text-[10px] text-muted-foreground">Background</span>
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
            Changes will be applied instantly and saved automatically.
          </div>
          
          <MorphingDialogClose />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
