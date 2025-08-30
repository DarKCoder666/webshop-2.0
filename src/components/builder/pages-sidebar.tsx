'use client';

import React, { useState, useEffect } from 'react';
import { WebshopLayout, getAllLayouts, createLayout } from '@/api/webshop-api';
import { SiteConfig } from '@/lib/builder-types';
import { getMinimalSiteConfig } from '@/api/webshop-api';
import { 
  MorphingDialog, 
  MorphingDialogTrigger, 
  MorphingDialogContainer, 
  MorphingDialogContent, 
  MorphingDialogTitle, 
  MorphingDialogClose,
  MorphingDialogDescription 
} from '@/components/motion-primitives/morphing-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FileText, Home, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings } from 'lucide-react';
import { t } from '@/lib/i18n';

export interface PagesSidebarProps {
  currentPageType?: string;
  currentLayoutId?: string | null;
  onPageSelect?: (layout: WebshopLayout) => void;
  isLoading?: boolean;
  onCollapseChange?: (isCollapsed: boolean) => void;
  onOpenPageSettings?: (layout: WebshopLayout) => void;
}

interface CreatePageFormData {
  pageName: string;
  pageRoute: string;
  pageTitle: string;
  pageDescription: string;
  keywords: string;
}

function PagesSidebar({ currentPageType = 'home', currentLayoutId, onPageSelect, isLoading: builderLoading, onCollapseChange, onOpenPageSettings }: PagesSidebarProps) {
  const [layouts, setLayouts] = useState<WebshopLayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [formData, setFormData] = useState<CreatePageFormData>({
    pageName: '',
    pageRoute: '',
    pageTitle: '',
    pageDescription: '',
    keywords: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadLayouts();
  }, []);

  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  const loadLayouts = async () => {
    try {
      setLoading(true);
      const allLayouts = await getAllLayouts();
      setLayouts(allLayouts);
    } catch (error) {
      console.error('Failed to load layouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async () => {
    if (!formData.pageName.trim() || !formData.pageRoute.trim()) {
      return;
    }

    try {
      setCreating(true);
      
      // Create a minimal config with SEO settings and route
      const defaultConfig = getMinimalSiteConfig();
      const route = formData.pageRoute.startsWith('/') 
        ? formData.pageRoute.slice(1) 
        : formData.pageRoute;
      
      const configWithSEO: SiteConfig = {
        ...defaultConfig,
        name: formData.pageName,
        route: route, // Store route in config
        seo: {
          title: formData.pageTitle || formData.pageName,
          description: formData.pageDescription,
          keywords: formData.keywords
        }
      };

      // Use 'general' as pageType for all created pages
      const pageType = 'general';

      const newLayout = await createLayout(
        pageType,
        configWithSEO,
        formData.pageName
      );

      // Refresh the layouts list
      await loadLayouts();
      
      // Reset form
      setFormData({
        pageName: '',
        pageRoute: '',
        pageTitle: '',
        pageDescription: '',
        keywords: ''
      });
      
      setCreateDialogOpen(false);
      
      // Select the new page
      if (onPageSelect) {
        onPageSelect(newLayout);
      }
    } catch (error) {
      console.error('Failed to create page:', error);
    } finally {
      setCreating(false);
    }
  };

  const formatPageRoute = (layout: WebshopLayout) => {
    if (layout.pageType === 'home') return '/';
    // Use route from config if it's a general page, otherwise use pageType
    const route = layout.pageType === 'general' && layout.config.route 
      ? layout.config.route 
      : layout.pageType;
    return `/${route}`;
  };

  const getPageIcon = (pageType: string) => {
    if (pageType === 'home') return <Home className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <>
      {/* Collapse Toggle Button */}
      <motion.button
        onClick={() => setIsCollapsed(prev => !prev)}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-[10000] bg-card border border-border rounded-full p-2 shadow-lg hover:bg-muted transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ right: isCollapsed ? '1rem' : '21rem' }}
        animate={{ right: isCollapsed ? '1rem' : '21rem' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {isCollapsed ? (
          <ChevronLeft className="w-4 h-4 text-card-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-card-foreground" />
        )}
      </motion.button>

      {/* Sidebar */}
      <motion.div
        className="fixed right-0 top-0 h-full bg-card border-l border-border flex flex-col"
        style={{ zIndex: 9999 }}
        animate={{ 
          width: isCollapsed ? 0 : 320,
          x: isCollapsed ? 320 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className="w-80 h-full flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: isCollapsed ? 0 : 0.1 }}
            >
              {/* Header */}
              <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-card-foreground">{t('pages' as any)}</h2>
            {builderLoading && (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          <MorphingDialog>
            <MorphingDialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              {t('new_page' as any)}
            </MorphingDialogTrigger>
            <MorphingDialogContainer>
              <MorphingDialogContent className="w-full max-w-md bg-card border border-border rounded-lg shadow-lg p-6">
                <MorphingDialogClose />
                <MorphingDialogTitle className="text-xl font-semibold text-card-foreground mb-2">
                  {t('create_new_page' as any)}
                </MorphingDialogTitle>
                <MorphingDialogDescription className="text-sm text-muted-foreground mb-6">
                  {t('create_page_help' as any)}
                </MorphingDialogDescription>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      {t('page_name' as any)} *
                    </label>
                    <Input
                      placeholder={t('page_name_placeholder' as any)}
                      value={formData.pageName}
                      onChange={(e) => setFormData(prev => ({ ...prev, pageName: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      {t('page_route' as any)} *
                    </label>
                    <Input
                      placeholder="/about"
                      value={formData.pageRoute}
                      onChange={(e) => setFormData(prev => ({ ...prev, pageRoute: e.target.value }))}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('url_path_help' as any)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      {t('seo_title' as any)}
                    </label>
                    <Input
                      placeholder={t('seo_title_placeholder' as any)}
                      value={formData.pageTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, pageTitle: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      {t('meta_description' as any)}
                    </label>
                    <Textarea
                      placeholder={t('meta_description_placeholder' as any)}
                      value={formData.pageDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, pageDescription: e.target.value }))}
                      className="w-full resize-none"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      {t('keywords' as any)}
                    </label>
                    <Input
                      placeholder={t('keywords_placeholder' as any)}
                      value={formData.keywords}
                      onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                      className="flex-1"
                      disabled={creating}
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      onClick={handleCreatePage}
                      className="flex-1"
                      disabled={creating || !formData.pageName.trim() || !formData.pageRoute.trim()}
                    >
                      {creating ? t('creating' as any) : t('create_page' as any)}
                    </Button>
                  </div>
                </div>
              </MorphingDialogContent>
            </MorphingDialogContainer>
          </MorphingDialog>
        </div>
      </div>

              {/* Pages List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4">
                    <div className="animate-pulse space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-muted rounded-md"></div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {layouts.map((layout) => (
                      <motion.div
                        key={layout._id}
                        className={`group relative p-3 rounded-md border transition-all ${
                          layout._id === currentLayoutId 
                            ? 'bg-primary/10 border-primary' 
                            : 'border-border hover:border-muted-foreground/30'
                        } ${
                          builderLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-muted/50'
                        }`}
                        onClick={() => !builderLoading && onPageSelect?.(layout)}
                        whileHover={!builderLoading ? { scale: 1.02 } : {}}
                        whileTap={!builderLoading ? { scale: 0.98 } : {}}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-md ${
                            layout._id === currentLayoutId 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {getPageIcon(layout.pageType)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-card-foreground truncate">
                                {layout.pageName || layout.config.name || 'Untitled Page'}
                              </h3>
                              {layout._id === currentLayoutId && (
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <span>{formatPageRoute(layout)}</span>
                              <ExternalLink className="w-3 h-3" />
                            </div>
                            
                            {layout.config.seo?.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {layout.config.seo.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Page actions */}
                        <div 
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-card-foreground transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenPageSettings?.(layout);
                            }}
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    
                    {layouts.length === 0 && (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No pages found</p>
                        <p className="text-xs text-muted-foreground mt-1">Create your first page to get started</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

export { PagesSidebar };
