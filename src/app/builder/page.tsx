/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { Suspense } from "react";
import { RenderBlock, getSchema } from "@/components/builder/block-registry";
import { BlockType, SiteConfig, BlockInstance } from "@/lib/builder-types";
import { loadSiteConfig, saveSiteConfig, getAllLayouts, updateLayout } from "@/api/webshop-api";
import { InsertBlockButton } from "@/components/builder/insert-button";
import { initializeDebugTools } from "@/lib/api-test-utils";
import { MorphingPopover, MorphingPopoverContent, MorphingPopoverTrigger } from "@/components/motion-primitives/morphing-popover";
import { BuilderProvider } from "@/components/builder/builder-context";
import { BuilderDock } from "@/components/builder/builder-dock";

import { TestimonialsSettingsDialog } from "@/components/builder/testimonials-settings-dialog";
import { ProductsSettingsDialog } from "@/components/builder/products-settings-dialog";
import { FooterSettingsDialog } from "@/components/builder/footer-settings-dialog";
import { PageSettingsDialog } from "@/components/builder/page-settings-dialog";

import { WebshopLayout, getLayoutById } from "@/api/webshop-api";
import { t } from "@/lib/i18n";
import { getCurrentLanguage } from "@/lib/stores/language-store";
import { AuthGuard } from "@/components/auth-guard";
import { useRouter, useSearchParams } from "next/navigation";



function BuilderPageContent() {
  const [config, setConfig] = React.useState<SiteConfig | null>(null);
  const [selectedType, setSelectedType] = React.useState<BlockType>("heroSection");
  const [currentPageType, setCurrentPageType] = React.useState<string>("home");
  const [currentLayoutId, setCurrentLayoutId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [pageSettingsLayout, setPageSettingsLayout] = React.useState<WebshopLayout | null>(null);
  const pagesRefreshFn = React.useRef<(() => Promise<void>) | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();


  React.useEffect(() => {
    const initializeBuilder = async () => {
      try {
        setIsLoading(true);
        // Check URL for a specific layout ID
        const layoutIdFromUrl = searchParams?.get('layoutId');
        if (layoutIdFromUrl) {
          const layout = await getLayoutById(layoutIdFromUrl);
          if (layout) {
            setConfig(layout.config);
            setCurrentLayoutId(layout._id);
            setCurrentPageType(layout.pageType);
            // Ensure URL reflects current selection (normalize params)
            router.replace(`/builder?layoutId=${layout._id}`, { scroll: false });
            return;
          }
        }

        // Fallback: load all layouts and use home page
        const layouts = await getAllLayouts();
        const homeLayout = layouts.find(layout => layout.pageType === 'home');
        if (homeLayout) {
          setConfig(homeLayout.config);
          setCurrentLayoutId(homeLayout._id);
          setCurrentPageType(homeLayout.pageType);
          router.replace(`/builder?layoutId=${homeLayout._id}` , { scroll: false });
        } else {
          // Fallback to loadSiteConfig if no home layout found
          const config = await loadSiteConfig();
          setConfig(config);
          // Note: currentLayoutId remains null, which is correct for this fallback case
        }
      } catch (error) {
        console.error('Failed to initialize builder:', error);
        // Fallback to loadSiteConfig
        const config = await loadSiteConfig();
        setConfig(config);
        // Note: currentLayoutId remains null, which is correct for this fallback case
      } finally {
        setIsLoading(false);
      }
    };

    initializeBuilder();
    
    // Initialize API debug tools in development
    if (process.env.NODE_ENV === 'development') {
      initializeDebugTools();
    }
  }, [router, searchParams]);

  const [confirmOpenId, setConfirmOpenId] = React.useState<string | null>(null);



  React.useEffect(() => {
    if (config && config.blocks.length && !selectedType) {
      setSelectedType(config.blocks[0].type);
    }
  }, [config, selectedType]);

  const insertBlockAt = (index: number, type: BlockType) => {
    if (!config) return;
    
    // Get default props for the block type
    const schema = getSchema(type);
    const defaultProps = schema?.defaultProps || {};
    
    // Create new block
    const newBlock: BlockInstance = {
      id: `block-${Date.now()}`,
      type,
      props: defaultProps,
    };
    
    // Insert at correct position (local state only)
    const next: SiteConfig = { 
      ...config, 
      blocks: [...config.blocks.slice(0, index), newBlock, ...config.blocks.slice(index)] 
    };
    
    // Update local state only - don't save to server
    setConfig(next);
  };

  const moveBlock = (from: number, to: number) => {
    if (!config) return;
    
    // Reorder blocks in local state only
    const nextBlocks = [...config.blocks];
    const [moved] = nextBlocks.splice(from, 1);
    nextBlocks.splice(to, 0, moved);
    const updated: SiteConfig = { ...config, blocks: nextBlocks };
    
    // Update local state only - don't save to server
    setConfig(updated);
  };

  const handleTextUpdate = (
    blockId: string,
    fieldKey: string,
    value: string,
    style?: any,
    options?: { 
      perLanguage?: boolean;
      activeLanguage?: string;
      multilingualContent?: Record<string, string>;
      href?: string;
    }
  ) => {
    if (!config) return;
    const lang = getCurrentLanguage();

    // Update only local state - don't save to server yet
    const updatedBlocks = config.blocks.map((b) => {
      if (b.id !== blockId) return b;
      const prevField = (b.props as any)[fieldKey] || {};
      
      let nextField;
      if (options?.perLanguage && options.multilingualContent) {
        // Save all multilingual content
        nextField = {
          ...prevField,
          ...options.multilingualContent,
          style,
          href: options.href ?? (prevField as any)?.href,
        };
      } else if (options?.perLanguage) {
        // Legacy single language save
        nextField = { 
          ...prevField, 
          [lang]: value, 
          style,
          href: options.href ?? (prevField as any)?.href,
        };
      } else {
        // Single text mode
        nextField = { 
          ...prevField, 
          text: value, 
          style,
          href: options?.href ?? (prevField as any)?.href,
        };
      }
      
      return { ...b, props: { ...b.props, [fieldKey]: nextField } };
    });
    
    setConfig({ ...config, blocks: updatedBlocks });
  };

  const handleConfigUpdate = (updates: Partial<SiteConfig>) => {
    if (!config) return;
    
    const updatedConfig = { ...config, ...updates };
    // Update local state only - don't save to server
    setConfig(updatedConfig);
  };

  const handleBlockPropsUpdate = (blockId: string, props: Record<string, unknown>) => {
    if (!config) return;
    const updatedBlocks = config.blocks.map((b) => (b.id === blockId ? { ...b, props: { ...b.props, ...props } } : b));
    const updatedConfig = { ...config, blocks: updatedBlocks };
    setConfig(updatedConfig);
    // Only update local state - don't save to database
  };

  const handleBlockTypeChange = (blockId: string, newType: BlockType, newProps: Record<string, unknown>) => {
    if (!config) return;
    const updatedBlocks = config.blocks.map((b) => (b.id === blockId ? { ...b, type: newType, props: newProps } : b));
    const updatedConfig = { ...config, blocks: updatedBlocks };
    setConfig(updatedConfig);
    // Only update local state - don't save to database
  };

  const handlePageSelect = async (layout: WebshopLayout) => {
    if (isLoading || layout._id === currentLayoutId) {
      return; // Don't switch if already on this page or loading
    }

    console.log('Switching to page:', layout.pageName || layout.config.name, 'ID:', layout._id, 'PageType:', layout.pageType);

    try {
      setIsLoading(true);
      
      // Don't save current page - let user click save button when ready
      // Just switch to the selected page
      setConfig(layout.config);
      setCurrentPageType(layout.pageType);
      setCurrentLayoutId(layout._id);
      router.replace(`/builder?layoutId=${layout._id}`, { scroll: false });
      
      console.log('Successfully switched to page ID:', layout._id);
    } catch (error) {
      console.error('Failed to switch page:', error);
      // Still switch the page even if switching failed
      setConfig(layout.config);
      setCurrentPageType(layout.pageType);
      setCurrentLayoutId(layout._id);
      router.replace(`/builder?layoutId=${layout._id}`, { scroll: false });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPageSettings = (layout: WebshopLayout) => {
    setPageSettingsLayout(layout);
  };

  const handlePageSettingsUpdate = async (updatedLayout: WebshopLayout) => {
    // Refresh the current config if this is the currently selected page
    if (updatedLayout._id === currentLayoutId) {
      setConfig(updatedLayout.config);
      setCurrentPageType(updatedLayout.pageType);
    }
    setPageSettingsLayout(null);
  };

  const handlePagesRefreshRef = (refreshFn: () => Promise<void>) => {
    pagesRefreshFn.current = refreshFn;
  };

  const handlePageSettingsDelete = async (layoutId: string) => {
    // If the deleted page was the current page, switch to home
    if (layoutId === currentLayoutId) {
      // This will be handled by the pages management dialog
    }
    
    // Refresh the pages list in the pages management dialog
    if (pagesRefreshFn.current) {
      await pagesRefreshFn.current();
    }
    
    setPageSettingsLayout(null);
  };

  return (
    <AuthGuard>
      <BuilderProvider 
        key={`builder-${currentLayoutId}`}
        isBuilder={true} 
        blocks={config?.blocks || []} 
        onBlockUpdate={handleTextUpdate}
        onBlockPropsUpdate={handleBlockPropsUpdate}
      >
        <div className="min-h-screen bg-background text-foreground">
      {/* Global header is rendered via RootLayout */}
      
      <div className="fixed right-4 top-4 z-[101]">
        {config && (
          <button
            onClick={async () => { 
              console.log('Save button clicked. CurrentLayoutId:', currentLayoutId, 'CurrentPageType:', currentPageType);
              
              if (currentLayoutId) {
                console.log('Updating layout with ID:', currentLayoutId);
                await updateLayout(currentLayoutId, { config });
              } else {
                // If no currentLayoutId, this should only happen for home page
                if (currentPageType === 'home') {
                  console.log('Saving home page config');
                  await saveSiteConfig(config);
                } else {
                  console.error('No layout ID found for non-home page. Cannot save.');
                  alert('Error: Cannot save page. Please try refreshing and editing again.');
                  return;
                }
              }
              window.location.href = "/"; 
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? 'Сохранение...' : 'Сохранить и выйти'}
          </button>
        )}
      </div>
      <main key={`main-${currentLayoutId}`} className="pt-24">
        {config?.blocks.filter(b => b.type !== 'navigation' && !b.type.startsWith('footer')).map((b) => {
          const originalIndex = config.blocks.findIndex(block => block.id === b.id);
          return (
            <div key={`${currentLayoutId}-${b.id}`} className="relative group">
              <div className="absolute -top-6 left-1/2 z-[60] -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                <InsertBlockButton onPick={(type) => insertBlockAt(originalIndex, type)} />
              </div>
              <RenderBlock key={`block-${currentLayoutId}-${b.id}`} block={b} />
              <div className="absolute top-4 right-4 z-[60] flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                {(b.type === 'testimonials' || b.type === 'testimonials2' || b.type === 'testimonials3') && (
                  <TestimonialsSettingsDialog block={b} onSave={(props) => handleBlockPropsUpdate(b.id, props)} />
                )}
                {b.type === 'productsList' && (
                  <ProductsSettingsDialog block={b} onSave={(props) => handleBlockPropsUpdate(b.id, props)} />
                )}
                {(b.type === 'footerMinimal' || b.type === 'footerColumns' || b.type === 'footerHalfscreen') && (
                  <FooterSettingsDialog 
                    block={b} 
                    onSave={(props) => handleBlockPropsUpdate(b.id, props)}
                    onChangeType={(newType, newProps) => handleBlockTypeChange(b.id, newType, newProps)}
                  />
                )}
                <MorphingPopover open={confirmOpenId === b.id} onOpenChange={(open) => setConfirmOpenId(open ? b.id : null)}>
                  <MorphingPopoverTrigger className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive shadow hover:bg-destructive/20">
                    {t('delete')}
                  </MorphingPopoverTrigger>
                  <MorphingPopoverContent className="p-4 right-0 top-0 min-w-[260px] text-sm z-[70] bg-card border border-border">
                    <div className="space-y-3">
                      <p className="text-sm text-card-foreground">{t('delete_section_q')}</p>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setConfirmOpenId(null)} className="rounded-md border border-border bg-card px-4 py-2 text-xs font-medium hover:bg-muted text-card-foreground">{t('cancel')}</button>
                        <button onClick={() => { 
                          if (!config) return; 
                          
                          // Remove block from local state only
                          const updated: SiteConfig = {
                            ...config,
                            blocks: config.blocks.filter((block) => block.id !== b.id),
                          };
                          
                          // Update local state only - don't save to server
                          setConfig(updated); 
                          setConfirmOpenId(null); 
                        }} className="rounded-md bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90">{t('delete')}</button>
                      </div>
                    </div>
                  </MorphingPopoverContent>
                </MorphingPopover>
                {originalIndex > 0 && (
                  <button onClick={() => moveBlock(originalIndex, originalIndex - 1)} className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium shadow hover:bg-muted text-card-foreground">{t('up')}</button>
                )}
                {(() => {
                  const firstFooterIndex = config.blocks.findIndex(block => block.type.startsWith('footer'));
                  const maxIndex = firstFooterIndex === -1 ? (config?.blocks.length ?? 1) - 1 : Math.max(0, firstFooterIndex - 1);
                  return originalIndex < maxIndex;
                })() && (
                  <button onClick={() => moveBlock(originalIndex, originalIndex + 1)} className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium shadow hover:bg-muted text-card-foreground">{t('down')}</button>
                )}
              </div>
            </div>
          );
        })}
        {config && (
          <div className="flex justify-center py-8">
            {(() => {
              const footerIndex = config.blocks.findIndex(b => b.type.startsWith('footer'));
              const insertIndex = footerIndex === -1 ? config.blocks.length : footerIndex;
              return <InsertBlockButton onPick={(type) => insertBlockAt(insertIndex, type)} />;
            })()}
          </div>
        )}
      </main>
      
      {/* Builder Dock with Global Settings */}
      {config && (
        <BuilderDock 
          config={config} 
          onConfigUpdate={handleConfigUpdate}
          currentPageType={currentPageType}
          currentLayoutId={currentLayoutId}
          onPageSelect={handlePageSelect}
          onOpenPageSettings={handleOpenPageSettings}
          isLoading={isLoading}
          onPagesRefreshRef={handlePagesRefreshRef}
        />
      )}
      
      {/* Page Settings Dialog - Rendered at root level to avoid nesting */}
      <PageSettingsDialog 
        layout={pageSettingsLayout} 
        onUpdate={handlePageSettingsUpdate}
        onDelete={handlePageSettingsDelete}
        onClose={() => setPageSettingsLayout(null)}
      />
      </div>
    </BuilderProvider>
    </AuthGuard>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">{t('loading')}</div>}>
      <BuilderPageContent />
    </Suspense>
  );
}


