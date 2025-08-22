/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { RenderBlock } from "@/components/builder/block-registry";
import { BlockType, SiteConfig } from "@/lib/builder-types";
import { loadSiteConfig, saveSiteConfig, addBlock, reorderBlocks, removeBlock } from "@/lib/fake-builder-api";
import { InsertBlockButton } from "@/components/builder/insert-button";
import { MorphingPopover, MorphingPopoverContent, MorphingPopoverTrigger } from "@/components/motion-primitives/morphing-popover";
import { BuilderProvider } from "@/components/builder/builder-context";
import { BuilderDock } from "@/components/builder/builder-dock";
import { ThemeProvider } from "@/components/builder/theme-provider";
import { TestimonialsSettingsDialog } from "@/components/builder/testimonials-settings-dialog";
import { ProductsSettingsDialog } from "@/components/builder/products-settings-dialog";

import Link from "next/link";

export default function BuilderPage() {
  const [config, setConfig] = React.useState<SiteConfig | null>(null);
  const [selectedType, setSelectedType] = React.useState<BlockType>("heroSection");

  React.useEffect(() => {
    loadSiteConfig().then(setConfig);
  }, []);

  const [confirmOpenId, setConfirmOpenId] = React.useState<string | null>(null);



  React.useEffect(() => {
    if (config && config.blocks.length && !selectedType) {
      setSelectedType(config.blocks[0].type);
    }
  }, [config, selectedType]);

  const insertBlockAt = async (index: number, type: BlockType) => {
    if (!config) return;
    
    // Use addBlock to get defaults, then reorder to correct position
    const tempConfig = await addBlock(config, type, {});
    const newBlock = tempConfig.blocks[tempConfig.blocks.length - 1];
    
    // Remove from end and insert at correct position
    const blocksWithoutNew = tempConfig.blocks.slice(0, -1);
    const next: SiteConfig = { 
      ...tempConfig, 
      blocks: [...blocksWithoutNew.slice(0, index), newBlock, ...blocksWithoutNew.slice(index)] 
    };
    
    const updated = await saveSiteConfig(next);
    setConfig(updated);
  };

  const moveBlock = async (from: number, to: number) => {
    if (!config) return;
    const updated = await reorderBlocks(config, from, to);
    setConfig(updated);
  };

  const handleTextUpdate = (blockId: string, fieldKey: string, value: string, style?: any) => {
    if (!config) return;
    
    // Create the update object based on the field key
    const updateData: Record<string, any> = {};
    updateData[fieldKey] = { text: value, style };
    
    // Update only local state - don't save to server yet
    const updatedBlocks = config.blocks.map((b) => 
      b.id === blockId 
        ? { ...b, props: { ...b.props, ...updateData } } 
        : b
    );
    
    setConfig({ ...config, blocks: updatedBlocks });
  };

  const handleConfigUpdate = async (updates: Partial<SiteConfig>) => {
    if (!config) return;
    
    const updatedConfig = { ...config, ...updates };
    setConfig(updatedConfig);
    
    // Save to server
    await saveSiteConfig(updatedConfig);
  };

  const handleBlockPropsSave = async (blockId: string, props: Record<string, unknown>) => {
    if (!config) return;
    const updatedBlocks = config.blocks.map((b) => (b.id === blockId ? { ...b, props: { ...b.props, ...props } } : b));
    const updatedConfig = { ...config, blocks: updatedBlocks };
    setConfig(updatedConfig);
    await saveSiteConfig(updatedConfig);
  };

  return (
    <ThemeProvider config={config || { id: 'default', name: 'Default', blocks: [] }}>
      <BuilderProvider 
        isBuilder={true} 
        blocks={config?.blocks || []} 
        onBlockUpdate={handleTextUpdate}
      >
        <div className="min-h-screen bg-background text-foreground">
      {/* Navigation - always show at top if exists */}
      {config && (() => {
        const navBlock = config.blocks.find(b => b.type === 'navigation');
        return navBlock ? <RenderBlock block={navBlock} /> : null;
      })()}
      
      {/* Builder controls */}
      <div className="fixed left-4 top-4 z-[60]">
        <Link href="/" className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium shadow-md hover:bg-muted text-card-foreground">Назад</Link>
      </div>
      <div className="fixed right-4 top-4 z-[60]">
        {config && (
          <button
            onClick={async () => { await saveSiteConfig(config); window.location.href = "/"; }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
          >
            Сохранить и выйти
          </button>
        )}
      </div>
      <main className="pt-24">
        {config?.blocks.filter(b => b.type !== 'navigation').map((b, i) => {
          const originalIndex = config.blocks.findIndex(block => block.id === b.id);
          return (
            <div key={b.id} className="relative group">
              <div className="absolute -top-6 left-1/2 z-[60] -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                <InsertBlockButton onPick={(type) => insertBlockAt(originalIndex, type)} />
              </div>
              <RenderBlock block={b} />
              <div className="absolute top-4 right-4 z-[60] flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                {(b.type === 'testimonials' || b.type === 'testimonials2' || b.type === 'testimonials3') && (
                  <TestimonialsSettingsDialog block={b} onSave={(props) => handleBlockPropsSave(b.id, props)} />
                )}
                {b.type === 'productsList' && (
                  <ProductsSettingsDialog block={b} onSave={(props) => handleBlockPropsSave(b.id, props)} />
                )}
                <MorphingPopover open={confirmOpenId === b.id} onOpenChange={(open) => setConfirmOpenId(open ? b.id : null)}>
                  <MorphingPopoverTrigger className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive shadow hover:bg-destructive/20">
                    Удалить
                  </MorphingPopoverTrigger>
                  <MorphingPopoverContent className="p-4 right-0 top-0 min-w-[260px] text-sm z-[70] bg-card border border-border">
                    <div className="space-y-3">
                      <p className="text-sm text-card-foreground">Удалить эту секцию?</p>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setConfirmOpenId(null)} className="rounded-md border border-border bg-card px-4 py-2 text-xs font-medium hover:bg-muted text-card-foreground">Отмена</button>
                        <button onClick={async () => { if (!config) return; const updated = await removeBlock(config, b.id); setConfig(updated); setConfirmOpenId(null); }} className="rounded-md bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90">Удалить</button>
                      </div>
                    </div>
                  </MorphingPopoverContent>
                </MorphingPopover>
                {originalIndex > 0 && (
                  <button onClick={() => moveBlock(originalIndex, originalIndex - 1)} className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium shadow hover:bg-muted text-card-foreground">Вверх</button>
                )}
                {originalIndex < (config?.blocks.length ?? 1) - 1 && (
                  <button onClick={() => moveBlock(originalIndex, originalIndex + 1)} className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium shadow hover:bg-muted text-card-foreground">Вниз</button>
                )}
              </div>
            </div>
          );
        })}
        {config && (
          <div className="flex justify-center py-8">
            <InsertBlockButton onPick={(type) => insertBlockAt(config.blocks.length, type)} />
          </div>
        )}
      </main>
      
      {/* Builder Dock with Global Settings */}
      {config && <BuilderDock config={config} onConfigUpdate={handleConfigUpdate} />}
      </div>
    </BuilderProvider>
    </ThemeProvider>
  );
}


