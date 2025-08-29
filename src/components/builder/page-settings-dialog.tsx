'use client';

import React, { useState } from 'react';
import { WebshopLayout, updateLayout, deleteLayout } from '@/api/webshop-api';
import { 
  MorphingDialog, 
  MorphingDialogTrigger, 
  MorphingDialogContainer, 
  MorphingDialogContent, 
  MorphingDialogTitle, 
  MorphingDialogClose,
  MorphingDialogDescription,
  useMorphingDialog
} from '@/components/motion-primitives/morphing-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Trash2 } from 'lucide-react';
import { t } from '@/lib/i18n';

interface PageSettingsDialogProps {
  layout: WebshopLayout | null;
  onUpdate?: (updatedLayout: WebshopLayout) => void;
  onDelete?: (layoutId: string) => void;
  onClose?: () => void;
}

interface PageSettingsFormData {
  pageRoute: string;
  pageTitle: string;
  pageDescription: string;
  keywords: string;
}

interface PageSettingsActionsProps {
  onSave: (closeDialog: () => void) => void;
  onCancel: (closeDialog: () => void) => void;
  saving: boolean;
  deleting: boolean;
}

function PageSettingsActions({ onSave, onCancel, saving, deleting }: PageSettingsActionsProps) {
  const { setIsOpen } = useMorphingDialog();
  
  const closeDialog = () => setIsOpen(false);
  
  return (
    <div className="flex gap-3 pt-4">
      <Button
        variant="outline"
        className="flex-1"
        disabled={saving || deleting}
        onClick={() => onCancel(closeDialog)}
      >
        {t('cancel')}
      </Button>
      <Button
        onClick={() => onSave(closeDialog)}
        className="flex-1"
        disabled={saving || deleting}
      >
        {saving ? t('saving') : t('save_changes')}
      </Button>
    </div>
  );
}

export function PageSettingsDialog({ layout, onUpdate, onDelete, onClose }: PageSettingsDialogProps) {
  const [formData, setFormData] = useState<PageSettingsFormData>({
    pageRoute: '',
    pageTitle: '',
    pageDescription: '',
    keywords: ''
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update form data when layout changes
  React.useEffect(() => {
    if (layout) {
      setFormData({
        pageRoute: layout.pageType === 'general' && layout.config.route 
          ? layout.config.route 
          : layout.pageType,
        pageTitle: layout.config.seo?.title || '',
        pageDescription: layout.config.seo?.description || '',
        keywords: layout.config.seo?.keywords || ''
      });
    }
  }, [layout]);

  const handleSave = async (closeDialog: () => void) => {
    if (!layout) return;
    
    try {
      setSaving(true);
      
      // For general pages, store route in config and keep pageType as 'page'
      const isGeneralPage = layout.pageType === 'general';
      
      const updatedLayout = await updateLayout(layout._id, {
        pageType: isGeneralPage ? 'general' : formData.pageRoute,
        config: {
          ...layout.config,
          route: isGeneralPage ? formData.pageRoute : undefined,
          seo: {
            ...layout.config.seo,
            title: formData.pageTitle,
            description: formData.pageDescription,
            keywords: formData.keywords
          }
        }
      });
      
      if (onUpdate) {
        onUpdate(updatedLayout);
      }
      
      // Close dialog on successful save
      closeDialog();
      onClose?.();
    } catch (error) {
      console.error('Failed to update page settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (closeDialog: () => void) => {
    if (layout) {
      // Reset form to original values
      setFormData({
        pageRoute: layout.pageType === 'general' && layout.config.route 
          ? layout.config.route 
          : layout.pageType,
        pageTitle: layout.config.seo?.title || '',
        pageDescription: layout.config.seo?.description || '',
        keywords: layout.config.seo?.keywords || ''
      });
    }
    setShowDeleteConfirm(false);
    closeDialog();
    onClose?.();
  };

  const handleDelete = async () => {
    if (!layout || layout.pageType === 'home') {
      alert(t('cannot_delete_home_page'));
      return;
    }

    try {
      setDeleting(true);
      await deleteLayout(layout._id);
      
      if (onDelete) {
        onDelete(layout._id);
      }
      onClose?.();
    } catch (error) {
      console.error('Failed to delete page:', error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };



  return (
    <MorphingDialog open={!!layout} onOpenChange={(open) => {
      if (!open) {
        // When dialog closes, call onClose to clear the layout
        onClose?.();
      }
    }}>
      {/* Hidden trigger - we don't need a visible trigger since we control it externally */}
      <MorphingDialogTrigger style={{ display: 'none' }}>
        <Settings className="w-4 h-4" />
      </MorphingDialogTrigger>
      
      <MorphingDialogContainer>
        <MorphingDialogContent className="w-full max-w-md bg-card border border-border rounded-lg shadow-lg p-6">
          <MorphingDialogClose />
          <MorphingDialogTitle className="text-xl font-semibold text-card-foreground mb-2">
            {t('page_settings')}
          </MorphingDialogTitle>
          <MorphingDialogDescription className="text-sm text-muted-foreground mb-6">
            {t('page_settings_description')}
          </MorphingDialogDescription>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {t('page_route_label')}
              </label>
              <Input
                placeholder={t('page_route_placeholder')}
                value={formData.pageRoute}
                onChange={(e) => setFormData(prev => ({ ...prev, pageRoute: e.target.value }))}
                className="w-full"
                disabled={!layout || layout.pageType === 'home'}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {layout?.pageType === 'home' 
                  ? t('home_page_route_readonly')
                  : t('page_route_help')
                }
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {t('seo_title_label')}
              </label>
              <Input
                placeholder={t('seo_title_placeholder')}
                value={formData.pageTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, pageTitle: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {t('meta_description_label')}
              </label>
              <Textarea
                placeholder={t('meta_description_placeholder')}
                value={formData.pageDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, pageDescription: e.target.value }))}
                className="w-full resize-none"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {t('keywords_label')}
              </label>
              <Input
                placeholder={t('keywords_placeholder')}
                value={formData.keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                className="w-full"
              />
            </div>
            
            {/* Delete Section */}
            {layout && layout.pageType !== 'home' && (
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-destructive">{t('danger_zone')}</h4>
                    <p className="text-xs text-muted-foreground">{t('permanently_delete_page')}</p>
                  </div>
                  {!showDeleteConfirm ? (
                                          <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('delete_page')}
                      </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deleting}
                      >
                        {t('cancel')}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={deleting}
                      >
                        {deleting ? t('deleting') : t('confirm_delete')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <PageSettingsActions 
              onSave={handleSave}
              onCancel={handleCancel}
              saving={saving}
              deleting={deleting}
            />
          </div>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
