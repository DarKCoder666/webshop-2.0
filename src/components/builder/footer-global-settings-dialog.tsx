'use client';

import React from 'react';
import { 
  MorphingDialog, 
  MorphingDialogContainer, 
  MorphingDialogContent, 
  MorphingDialogTrigger, 
  MorphingDialogTitle, 
  MorphingDialogClose 
} from '@/components/motion-primitives/morphing-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BlockInstance, SiteConfig } from '@/lib/builder-types';
import { getAllLayouts, updateLayout, WebshopLayout } from '@/api/webshop-api';
import { Shuffle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

type FooterType = 'footerColumns';

function isFooterType(type: string): type is FooterType {
  return type === 'footerColumns';
}

export function FooterGlobalSettingsDialog() {
  const [homeLayout, setHomeLayout] = React.useState<WebshopLayout | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);
  const t = useI18n();

  // Helpers
  function hasText(obj: unknown): obj is { text?: string } {
    return typeof obj === 'object' && obj !== null && 'text' in (obj as Record<string, unknown>);
  }
  const getText = React.useCallback((value: unknown, fallback: string): string => {
    if (typeof value === 'string') return value;
    if (hasText(value)) return value.text ?? fallback;
    return fallback;
  }, []);
  const getArray = <T,>(value: unknown): T[] => Array.isArray(value) ? (value as unknown as T[]) : [];
  const moveItem = <T,>(arr: T[], index: number, direction: 'up' | 'down'): T[] => {
    const newArr = [...arr];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newArr.length) return arr;
    const temp = newArr[index];
    newArr[index] = newArr[newIndex];
    newArr[newIndex] = temp;
    return newArr;
  };

  type ColumnLink = { label: string; href: string };
  type Column = { title: string; links: ColumnLink[] };

  // Columns footer state
  const [logoText, setLogoText] = React.useState<string>('Ваш бренд');
  const [description, setDescription] = React.useState<string>('Продуманный интернет-магазин.');
  const [columns, setColumns] = React.useState<Column[]>([
    { title: 'Продукт', links: [{ label: 'Возможности', href: '#' }, { label: 'Цены', href: '#' }, { label: 'Интеграции', href: '#' }] },
    { title: 'Компания', links: [{ label: 'О нас', href: '#' }, { label: 'Карьера', href: '#' }, { label: 'Пресса', href: '#' }] },
    { title: 'Ресурсы', links: [{ label: 'Блог', href: '#' }, { label: 'Центр помощи', href: '#' }, { label: 'Контакты', href: '#' }] },
    { title: 'Правовая информация', links: [{ label: 'Конфиденциальность', href: '#' }, { label: 'Условия', href: '#' }, { label: 'Файлы cookie', href: '#' }] },
  ]);
  const [bottomNote, setBottomNote] = React.useState<string>('© 2025 Ваш бренд');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const layouts = await getAllLayouts();
        const home = layouts.find((l) => l.pageType === 'home') || null;
        if (!mounted) return;
        setHomeLayout(home);
        if (home) {
          const footerBlocks = home.config.blocks.filter((b) => isFooterType(b.type as string));
          const fb = footerBlocks.length > 0 ? footerBlocks[footerBlocks.length - 1] : undefined;
          if (fb) {
            const props = fb.props as Record<string, unknown> | undefined;
            setLogoText(getText(props?.logoText, 'Ваш бренд'));
            setDescription(getText(props?.description, 'Продуманный интернет-магазин.'));
            const rawCols = getArray<{ title?: unknown; links?: unknown[] }>(props?.columns);
            setColumns(rawCols.map(c => ({ title: getText(c?.title, ''), links: getArray<ColumnLink>(c?.links) })));
            setBottomNote(getText(props?.bottomNote, '© 2025 Ваш бренд'));
          }
        }
        setInitialized(true);
      } catch (e) {
        console.error('Failed to load home layout for footer settings', e);
        setInitialized(true);
      }
    })();
    return () => { mounted = false; };
  }, [getText]);

  const ensureFooterAtEnd = (config: SiteConfig): SiteConfig => {
    const withoutExisting = config.blocks.filter((b) => !isFooterType(b.type as string));
    const existingFooter = config.blocks.find((b) => isFooterType(b.type as string));
    const footerBlock: BlockInstance = {
      id: existingFooter?.id || `footer-${Date.now()}`,
      type: 'footerColumns',
      props: existingFooter?.props || {},
    };
    return { ...config, blocks: [...withoutExisting, footerBlock] };
  };

  const handleSave = async () => {
    if (!homeLayout) return;
    try {
      setSaving(true);
      // Build footer props based on current state
      const footerProps: Record<string, unknown> = {
        logoText: { text: logoText },
        description: { text: description },
        columns: columns.map(c => ({ title: { text: c.title }, links: c.links })),
        bottomNote: { text: bottomNote },
      };

      // Ensure footer exists and put it last, then update its props
      const ensured = ensureFooterAtEnd(homeLayout.config);
      const updatedBlocks = ensured.blocks.map((b) => {
        if (isFooterType(b.type as string)) {
          return { ...b, type: 'footerColumns', props: footerProps } as BlockInstance;
        }
        return b;
      });
      const nextConfig = { ...ensured, blocks: updatedBlocks };
      await updateLayout(homeLayout._id, { config: nextConfig });
      
      // Dispatch event to trigger footer refresh
      window.dispatchEvent(new CustomEvent('footerUpdated'));
      
      // Keep dialog open for further edits, but give quick visual feedback via disabled state
    } catch (e) {
      console.error('Failed to save global footer settings', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MorphingDialog>
      <MorphingDialogTrigger className="flex h-full w-full items-center justify-center">
        <Shuffle className="h-6 w-6 text-muted-foreground" />
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent className="w-[800px] max-w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl bg-card shadow-2xl border border-border">
          <div className="p-6">
            <MorphingDialogTitle className="text-2xl font-bold text-card-foreground">
              {t('footer_settings')}
            </MorphingDialogTitle>
            <p className="mt-2 text-muted-foreground">
              {t('footer_description')}
            </p>
            
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">{t('columns_and_links')}</h4>
                <Button onClick={() => handleSave()} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {saving ? t('saving') : t('save_changes')}
                </Button>
              </div>

              {!initialized && (
                <div className="text-sm text-muted-foreground">{t('loading_settings')}</div>
              )}

              {initialized && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">{t('logo_text')}</label>
                      <Input value={logoText} onChange={(e) => setLogoText(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">{t('bottom_note')}</label>
                      <Input value={bottomNote} onChange={(e) => setBottomNote(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">{t('description')}</label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
                  </div>
                  {/* Columns editor */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">{t('columns')}</label>
                      <Button size="sm" variant="outline" onClick={() => setColumns([...columns, { title: t('new_column'), links: [] }])}>{t('add_column')}</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {columns.map((c, ci) => (
                        <div key={ci} className="rounded-md border border-border p-3 space-y-3">
                          <div className="flex items-center gap-2">
                            <Input value={c.title} onChange={(e) => { const arr = [...columns]; arr[ci] = { ...c, title: e.target.value }; setColumns(arr); }} placeholder={t('column_title')} />
                            <Button size="sm" variant="outline" onClick={() => setColumns(moveItem(columns, ci, 'up'))} disabled={ci === 0}>{t('up')}</Button>
                            <Button size="sm" variant="outline" onClick={() => setColumns(moveItem(columns, ci, 'down'))} disabled={ci === columns.length - 1}>{t('down')}</Button>
                            <Button size="sm" variant="destructive" onClick={() => setColumns(columns.filter((_, idx) => idx !== ci))}>{t('remove')}</Button>
                          </div>
                          {/* Links within column */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium">{t('links')}</label>
                              <Button size="sm" variant="outline" onClick={() => { const arr = [...columns]; arr[ci] = { ...c, links: [...c.links, { label: t('new_link'), href: '#' }] }; setColumns(arr); }}>{t('add_link')}</Button>
                            </div>
                            {c.links.map((l, i) => (
                              <div key={i} className="rounded-md border border-border p-3 space-y-2">
                                <div className="flex gap-2 items-center">
                                  <Input className="flex-1" value={l.label} onChange={(e) => { const arr = [...columns]; const newLinks = [...c.links]; newLinks[i] = { ...l, label: e.target.value }; arr[ci] = { ...c, links: newLinks }; setColumns(arr); }} placeholder={t('label')} />
                                  <Input className="flex-1" value={l.href} onChange={(e) => { const arr = [...columns]; const newLinks = [...c.links]; newLinks[i] = { ...l, href: e.target.value }; arr[ci] = { ...c, links: newLinks }; setColumns(arr); }} placeholder="/path" />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button size="sm" variant="outline" onClick={() => { const arr = [...columns]; arr[ci] = { ...c, links: moveItem(c.links, i, 'up') }; setColumns(arr); }} disabled={i === 0}>{t('up')}</Button>
                                  <Button size="sm" variant="outline" onClick={() => { const arr = [...columns]; arr[ci] = { ...c, links: moveItem(c.links, i, 'down') }; setColumns(arr); }} disabled={i === c.links.length - 1}>{t('down')}</Button>
                                  <Button size="sm" variant="destructive" onClick={() => { const arr = [...columns]; arr[ci] = { ...c, links: c.links.filter((_, idx) => idx !== i) }; setColumns(arr); }}>{t('remove')}</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <MorphingDialogClose className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </MorphingDialogClose>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}

export default FooterGlobalSettingsDialog;


