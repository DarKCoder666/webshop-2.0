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
import { Plus, FileText, Home, ExternalLink, Settings, FolderOpen } from 'lucide-react';
import { motion } from 'motion/react';

import { t } from '@/lib/i18n';

export interface PagesManagementDialogProps {
  currentPageType?: string;
  currentLayoutId?: string | null;
  onPageSelect?: (layout: WebshopLayout) => void;
  onOpenPageSettings?: (layout: WebshopLayout) => void;
  isLoading?: boolean;
  onRefreshRef?: (refreshFn: () => Promise<void>) => void;
}

interface CreatePageFormData {
  pageName: string;
  pageRoute: string;
  pageTitle: string;
  pageDescription: string;
  keywords: string;
}

function PagesManagementDialog({ currentPageType = 'home', currentLayoutId, onPageSelect, onOpenPageSettings, isLoading: builderLoading, onRefreshRef }: PagesManagementDialogProps) {
  const [layouts, setLayouts] = useState<WebshopLayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainDialogOpen, setMainDialogOpen] = useState(false);
  const createDialogTriggerRef = React.useRef<HTMLButtonElement>(null);
  const [formData, setFormData] = useState<CreatePageFormData>({
    pageName: '',
    pageRoute: '',
    pageTitle: '',
    pageDescription: '',
    keywords: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Load layouts immediately on mount
    loadLayouts();
  }, []);

  useEffect(() => {
    // Refresh layouts when dialog is opened
    if (mainDialogOpen) {
      loadLayouts();
    }
  }, [mainDialogOpen]);

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

  // Expose the loadLayouts function to parent component
  useEffect(() => {
    if (onRefreshRef) {
      onRefreshRef(loadLayouts);
    }
  }, [onRefreshRef]);

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
      
      // Close create dialog by toggling the hidden trigger
      createDialogTriggerRef.current?.click();
      
      // Select the new page and close main dialog
      if (onPageSelect) {
        onPageSelect(newLayout);
        setMainDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to create page:', error);
    } finally {
      setCreating(false);
    }
  };

  const handlePageSelect = (layout: WebshopLayout) => {
    if (onPageSelect) {
      onPageSelect(layout);
      setMainDialogOpen(false);
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
      <MorphingDialog open={mainDialogOpen} onOpenChange={setMainDialogOpen}>
        <MorphingDialogTrigger className="flex h-full w-full items-center justify-center">
          <FolderOpen className="h-6 w-6 text-muted-foreground" />
        </MorphingDialogTrigger>
        <MorphingDialogContainer>
          <MorphingDialogContent className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-lg p-6 max-h-[80vh] overflow-hidden flex flex-col">
            <MorphingDialogClose />
            <MorphingDialogTitle className="text-xl font-semibold text-card-foreground mb-2">
              {t('pages')}
            </MorphingDialogTitle>
            <MorphingDialogDescription className="text-sm text-muted-foreground mb-6">
              {t('pages_dialog_description')}
            </MorphingDialogDescription>
            
            {/* Header with Create Button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-card-foreground">{t('your_pages')}</h3>
                {builderLoading && (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <button
                onClick={() => createDialogTriggerRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('new_page')}
              </button>
            </div>

            {/* Pages List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded-md animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {layouts.map((layout) => (
                    <motion.div
                      key={layout._id}
                      className={`group relative p-4 rounded-md border transition-all ${
                        layout._id === currentLayoutId 
                          ? 'bg-primary/10 border-primary' 
                          : 'border-border hover:border-muted-foreground/30'
                      } ${
                        builderLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-muted/50'
                      }`}
                      onClick={() => !builderLoading && handlePageSelect(layout)}
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
                              {layout.pageName || layout.config.name || t('untitled_page')}
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
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      <p className="text-sm text-muted-foreground">{t('no_pages_found')}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('create_first_page_help')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </MorphingDialogContent>
        </MorphingDialogContainer>
      </MorphingDialog>

      {/* Separate Create Page Dialog */}
      <MorphingDialog>
        <MorphingDialogTrigger className="hidden" triggerRef={createDialogTriggerRef} />
        <MorphingDialogContainer>
          <MorphingDialogContent className="w-full max-w-md bg-card border border-border rounded-lg shadow-lg p-6">
            <MorphingDialogClose />
            <MorphingDialogTitle className="text-xl font-semibold text-card-foreground mb-2">
              {t('create_new_page')}
            </MorphingDialogTitle>
            <MorphingDialogDescription className="text-sm text-muted-foreground mb-6">
              {t('create_page_help')}
            </MorphingDialogDescription>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  {t('page_name')} *
                </label>
                <Input
                  placeholder={t('page_name_placeholder')}
                  value={formData.pageName}
                  onChange={(e) => setFormData(prev => ({ ...prev, pageName: e.target.value }))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('page_name_tip')}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  {t('page_route')} *
                </label>
                <Input
                  placeholder="/about"
                  value={formData.pageRoute}
                  onChange={(e) => setFormData(prev => ({ ...prev, pageRoute: e.target.value }))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('url_path_help')}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  {t('seo_title')}
                </label>
                <Input
                  placeholder={t('seo_title_placeholder')}
                  value={formData.pageTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, pageTitle: e.target.value }))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('seo_title_tip')}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  {t('meta_description')}
                </label>
                <Textarea
                  placeholder={t('meta_description_placeholder')}
                  value={formData.pageDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, pageDescription: e.target.value }))}
                  className="w-full resize-none"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('meta_description_tip')}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  {t('keywords')}
                </label>
                <Input
                  placeholder={t('keywords_placeholder')}
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('keywords_tip')}
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Reset form and close dialog via hidden trigger
                    setFormData({
                      pageName: '',
                      pageRoute: '',
                      pageTitle: '',
                      pageDescription: '',
                      keywords: ''
                    });
                    createDialogTriggerRef.current?.click();
                  }}
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
                  {creating ? t('creating') : t('create_page')}
                </Button>
              </div>
            </div>
          </MorphingDialogContent>
        </MorphingDialogContainer>
      </MorphingDialog>
    </>
  );
}

export { PagesManagementDialog };
