'use client';

import React from 'react';
import { 
  MorphingDialog, 
  MorphingDialogTrigger, 
  MorphingDialogContainer, 
  MorphingDialogContent, 
  MorphingDialogClose, 
  MorphingDialogTitle 
} from '@/components/motion-primitives/morphing-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { BlockInstance } from '@/lib/builder-types';
import { Shuffle, ImageIcon } from 'lucide-react';
import type { FooterMinimalProps } from '@/components/sections/footer/footer-minimal';
import type { FooterColumnsProps } from '@/components/sections/footer/footer-columns';
import type { FooterHalfscreenProps } from '@/components/sections/footer/footer-halfscreen';

type FooterType = 'footerMinimal' | 'footerColumns' | 'footerHalfscreen';

type FooterLink = { label: string; href: string };
type Social = { label: string; href: string; platform?: 'twitter' | 'instagram' | 'linkedin' | 'github' };
type ColumnLink = { label: string; href: string };
type Column = { title: string; links: ColumnLink[] };

type FooterSettingsDialogProps = {
  block: BlockInstance;
  onSave: (props: Record<string, unknown>) => void;
};

// no global footer lookup in per-block dialog

function hasText(obj: unknown): obj is { text?: string } {
  return typeof obj === 'object' && obj !== null && 'text' in (obj as Record<string, unknown>);
}

const getText = (value: unknown, fallback: string): string => {
  if (typeof value === 'string') return value;
  if (hasText(value)) return value.text ?? fallback;
  return fallback;
};

const getBool = (value: unknown, fallback: boolean): boolean => {
  return typeof value === 'boolean' ? value : fallback;
};

const getString = (value: unknown, fallback: string): string => {
  return typeof value === 'string' ? value : fallback;
};

const getArray = <T,>(value: unknown): T[] => {
  return Array.isArray(value) ? (value as unknown as T[]) : [];
};

const moveItem = <T,>(arr: T[], index: number, direction: 'up' | 'down'): T[] => {
  const newArr = [...arr];
  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= newArr.length) return arr;
  const temp = newArr[index];
  newArr[index] = newArr[newIndex];
  newArr[newIndex] = temp;
  return newArr;
};

export function FooterSettingsDialog({ block, onSave }: FooterSettingsDialogProps) {
  const existingType: FooterType = block.type as FooterType;
  const existingMinimalProps: FooterMinimalProps | undefined = existingType === 'footerMinimal' ? (block.props as FooterMinimalProps | undefined) : undefined;
  const existingColumnsProps: FooterColumnsProps | undefined = existingType === 'footerColumns' ? (block.props as FooterColumnsProps | undefined) : undefined;
  const existingHalfscreenProps: FooterHalfscreenProps | undefined = existingType === 'footerHalfscreen' ? (block.props as FooterHalfscreenProps | undefined) : undefined;

  // Minimal footer state
  const [minLogoText, setMinLogoText] = React.useState<string>(
    existingType === 'footerMinimal' ? getText(existingMinimalProps?.logoText, 'Your Brand') : 'Your Brand'
  );
  const [minDescription, setMinDescription] = React.useState<string>(
    existingType === 'footerMinimal' ? getText(existingMinimalProps?.description, 'We craft delightful experiences.') : 'We craft delightful experiences.'
  );
  const [minLinks, setMinLinks] = React.useState<FooterLink[]>(
    existingType === 'footerMinimal' ? getArray<FooterLink>(existingMinimalProps?.links) : [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ]
  );
  const [minSocial, setMinSocial] = React.useState<Social[]>(
    existingType === 'footerMinimal' ? getArray<Social>(existingMinimalProps?.social) : []
  );
  const [minShowNewsletter, setMinShowNewsletter] = React.useState<boolean>(
    false
  );
  const [minNewsletterTitle, setMinNewsletterTitle] = React.useState<string>(
    ''
  );
  const [minNewsletterPlaceholder, setMinNewsletterPlaceholder] = React.useState<string>(
    ''
  );
  const [minCopyright, setMinCopyright] = React.useState<string>(
    existingType === 'footerMinimal' ? getText(existingMinimalProps?.copyright, '© 2025 Your Brand. All rights reserved.') : '© 2025 Your Brand. All rights reserved.'
  );

  // Columns footer state
  const [colLogoText, setColLogoText] = React.useState<string>(
    existingType === 'footerColumns' ? getText(existingColumnsProps?.logoText, 'Your Brand') : 'Your Brand'
  );
  const [colDescription, setColDescription] = React.useState<string>(
    existingType === 'footerColumns' ? getText(existingColumnsProps?.description, 'Thoughtfully crafted ecommerce.') : 'Thoughtfully crafted ecommerce.'
  );
  const [columns, setColumns] = React.useState<Column[]>(
    existingType === 'footerColumns'
      ? getArray<{ title?: unknown; links?: unknown[] }>(existingColumnsProps?.columns).map((c) => ({
          title: getText(c?.title, ''),
          links: getArray<ColumnLink>(c?.links),
        }))
      : [
    { title: 'Продукт', links: [{ label: 'Возможности', href: '#' }, { label: 'Цены', href: '#' }, { label: 'Интеграции', href: '#' }] },
    { title: 'Компания', links: [{ label: 'О нас', href: '#' }, { label: 'Карьера', href: '#' }, { label: 'Пресса', href: '#' }] },
    { title: 'Ресурсы', links: [{ label: 'Блог', href: '#' }, { label: 'Центр поддержки', href: '#' }, { label: 'Контакты', href: '#' }] },
  ]
  );
  const [colShowNewsletter, setColShowNewsletter] = React.useState<boolean>(false);
  const [colNewsletterTitle, setColNewsletterTitle] = React.useState<string>('');
  const [colNewsletterPlaceholder, setColNewsletterPlaceholder] = React.useState<string>('');
  const [colNewsletterCtaLabel, setColNewsletterCtaLabel] = React.useState<string>('');
  const [bottomNote, setBottomNote] = React.useState<string>(
    existingType === 'footerColumns' ? getText(existingColumnsProps?.bottomNote, '© 2025 Your Brand') : '© 2025 Your Brand'
  );

  // Halfscreen footer state
  const [halfBadge, setHalfBadge] = React.useState<string>(
    existingType === 'footerHalfscreen' ? getText(existingHalfscreenProps?.badge, 'New') : 'New'
  );
  const [halfTitle, setHalfTitle] = React.useState<string>(
    existingType === 'footerHalfscreen' ? getText(existingHalfscreenProps?.title, 'Make a bold closing statement') : 'Make a bold closing statement'
  );
  const [halfDescription, setHalfDescription] = React.useState<string>(
    existingType === 'footerHalfscreen' ? getText(existingHalfscreenProps?.description, 'Convert visitors with a dramatic, editorial-style footer.') : 'Convert visitors with a dramatic, editorial-style footer.'
  );
  const [halfPrimaryCtaLabel, setHalfPrimaryCtaLabel] = React.useState<string>(
    existingType === 'footerHalfscreen' ? getText(existingHalfscreenProps?.primaryCta?.label, 'Get Started') : 'Get Started'
  );
  const [halfPrimaryCtaHref, setHalfPrimaryCtaHref] = React.useState<string>(
    existingType === 'footerHalfscreen' ? getString(existingHalfscreenProps?.primaryCta?.href, '#') : '#'
  );
  const [halfSecondaryCtaLabel, setHalfSecondaryCtaLabel] = React.useState<string>(
    existingType === 'footerHalfscreen' ? getText(existingHalfscreenProps?.secondaryCta?.label, 'Talk to Sales') : 'Talk to Sales'
  );
  const [halfSecondaryCtaHref, setHalfSecondaryCtaHref] = React.useState<string>(
    existingType === 'footerHalfscreen' ? getString(existingHalfscreenProps?.secondaryCta?.href, '#') : '#'
  );
  const [halfImageSrc, setHalfImageSrc] = React.useState<string>(
    existingType === 'footerHalfscreen' ? getString(existingHalfscreenProps?.imageSrc, '/random3.jpeg') : '/random3.jpeg'
  );
  const [halfImageAlt, setHalfImageAlt] = React.useState<string>(
    existingType === 'footerHalfscreen' ? getString(existingHalfscreenProps?.imageAlt, 'Decorative') : 'Decorative'
  );
  const [halfOverlayGradient, setHalfOverlayGradient] = React.useState<boolean>(
    existingType === 'footerHalfscreen' ? getBool(existingHalfscreenProps?.overlayGradient as unknown as boolean, true) : true
  );
  const [halfLinks, setHalfLinks] = React.useState<FooterLink[]>(
    existingType === 'footerHalfscreen' ? getArray<FooterLink>(existingHalfscreenProps?.links) : [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Impressum', href: '#' },
  ]
  );
  const [halfCopyright, setHalfCopyright] = React.useState<string>(
    existingType === 'footerHalfscreen' ? getText(existingHalfscreenProps?.copyright, '© 2025 Your Brand') : '© 2025 Your Brand'
  );

  React.useEffect(() => {
    // nothing to sync; dialog is per-block
  }, [block.id]);

  const handleSave = () => {
    if (existingType === 'footerMinimal') {
      onSave({
        logoText: { text: minLogoText },
        description: { text: minDescription },
        links: minLinks,
        social: minSocial,
        copyright: { text: minCopyright },
      });
    } else if (existingType === 'footerColumns') {
      onSave({
        logoText: { text: colLogoText },
        description: { text: colDescription },
        columns: columns.map(c => ({ title: { text: c.title }, links: c.links })),
        bottomNote: { text: bottomNote },
      });
    } else if (existingType === 'footerHalfscreen') {
      onSave({
        badge: { text: halfBadge },
        title: { text: halfTitle },
        description: { text: halfDescription },
        primaryCta: { label: { text: halfPrimaryCtaLabel }, href: halfPrimaryCtaHref },
        secondaryCta: { label: { text: halfSecondaryCtaLabel }, href: halfSecondaryCtaHref },
        imageSrc: halfImageSrc,
        imageAlt: halfImageAlt,
        overlayGradient: halfOverlayGradient,
        links: halfLinks,
        copyright: { text: halfCopyright },
      });
    }
    setTimeout(() => {
      const closeButton = document.querySelector('[aria-label="Close dialog"]') as HTMLButtonElement | null;
      closeButton?.click();
    }, 50);
  };

  const renderLinksEditor = (
    links: FooterLink[],
    setLinks: (v: FooterLink[]) => void,
    label: string
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <Button size="sm" variant="outline" onClick={() => setLinks([...links, { label: 'New', href: '#' }])}>Add link</Button>
      </div>
      <div className="space-y-2">
        {links.map((l, i) => (
          <div key={i} className="rounded-md border border-border p-3 space-y-2">
            <div className="flex gap-2 items-center">
              <Input className="flex-1" value={l.label} onChange={(e) => {
                const arr = [...links]; arr[i] = { ...l, label: e.target.value }; setLinks(arr);
              }} placeholder="Label" />
              <Input className="flex-1" value={l.href} onChange={(e) => {
                const arr = [...links]; arr[i] = { ...l, href: e.target.value }; setLinks(arr);
              }} placeholder="/path" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => setLinks(moveItem(links, i, 'up'))} disabled={i === 0}>Up</Button>
              <Button size="sm" variant="outline" onClick={() => setLinks(moveItem(links, i, 'down'))} disabled={i === links.length - 1}>Down</Button>
              <Button size="sm" variant="destructive" onClick={() => setLinks(links.filter((_, idx) => idx !== i))}>Remove</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSocialEditor = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Social links</label>
        <Button size="sm" variant="outline" onClick={() => setMinSocial([...minSocial, { label: 'New', href: '#', platform: 'twitter' }])}>Add social</Button>
      </div>
      <div className="space-y-2">
        {minSocial.map((s, i) => (
          <div key={i} className="rounded-md border border-border p-3 space-y-2">
            <div className="grid grid-cols-3 gap-2 items-center">
              <Input value={s.label} onChange={(e) => { const arr = [...minSocial]; arr[i] = { ...s, label: e.target.value }; setMinSocial(arr); }} placeholder="Label" />
              <select className="p-2 border border-border rounded-md bg-background" value={s.platform || ''} onChange={(e) => { const arr = [...minSocial]; arr[i] = { ...s, platform: e.target.value as Social['platform'] }; setMinSocial(arr); }}>
                <option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="github">GitHub</option>
              </select>
              <Input value={s.href} onChange={(e) => { const arr = [...minSocial]; arr[i] = { ...s, href: e.target.value }; setMinSocial(arr); }} placeholder="/url" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => setMinSocial(moveItem(minSocial, i, 'up'))} disabled={i === 0}>Up</Button>
              <Button size="sm" variant="outline" onClick={() => setMinSocial(moveItem(minSocial, i, 'down'))} disabled={i === minSocial.length - 1}>Down</Button>
              <Button size="sm" variant="destructive" onClick={() => setMinSocial(minSocial.filter((_, idx) => idx !== i))}>Remove</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderColumnsEditor = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Columns</label>
        <Button size="sm" variant="outline" onClick={() => setColumns([...columns, { title: 'New Column', links: [] }])}>Add column</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {columns.map((c, ci) => (
          <div key={ci} className="rounded-md border border-border p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Input value={c.title} onChange={(e) => { const arr = [...columns]; arr[ci] = { ...c, title: e.target.value }; setColumns(arr); }} placeholder="Column title" />
              <Button size="sm" variant="outline" onClick={() => setColumns(moveItem(columns, ci, 'up'))} disabled={ci === 0}>Up</Button>
              <Button size="sm" variant="outline" onClick={() => setColumns(moveItem(columns, ci, 'down'))} disabled={ci === columns.length - 1}>Down</Button>
              <Button size="sm" variant="destructive" onClick={() => setColumns(columns.filter((_, idx) => idx !== ci))}>Remove</Button>
            </div>
            {renderLinksEditor(c.links, (newLinks) => { const arr = [...columns]; arr[ci] = { ...c, links: newLinks }; setColumns(arr); }, 'Links')}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <MorphingDialog>
      <MorphingDialogTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-card-foreground hover:bg-muted">
        <Shuffle className="h-4 w-4" />
      </MorphingDialogTrigger>

      <MorphingDialogContainer>
        <MorphingDialogContent className="bg-card border border-border rounded-lg shadow-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <MorphingDialogClose />

          <div className="p-6 space-y-6">
            <MorphingDialogTitle className="text-lg font-semibold">Footer Settings</MorphingDialogTitle>

            <div className="space-y-4">
              {existingType === 'footerMinimal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Logo Text</label>
                      <Input value={minLogoText} onChange={(e) => setMinLogoText(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Show Newsletter</label>
                      <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={minShowNewsletter} onChange={(e) => setMinShowNewsletter(e.target.checked)} /> Enable</label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Description</label>
                    <Textarea value={minDescription} onChange={(e) => setMinDescription(e.target.value)} rows={2} />
                  </div>
                  {minShowNewsletter && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm mb-1">Newsletter Title</label>
                        <Input value={minNewsletterTitle} onChange={(e) => setMinNewsletterTitle(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Newsletter Placeholder</label>
                        <Input value={minNewsletterPlaceholder} onChange={(e) => setMinNewsletterPlaceholder(e.target.value)} />
                      </div>
                    </div>
                  )}
                  {renderLinksEditor(minLinks, setMinLinks, 'Links')}
                  {/* Social editor hidden per requirement */}
                  <div>
                    <label className="block text-sm mb-1">Copyright</label>
                    <Input value={minCopyright} onChange={(e) => setMinCopyright(e.target.value)} />
                  </div>
                </div>
              )}

              {existingType === 'footerColumns' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Logo Text</label>
                      <Input value={colLogoText} onChange={(e) => setColLogoText(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Show Newsletter</label>
                      <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={colShowNewsletter} onChange={(e) => setColShowNewsletter(e.target.checked)} /> Enable</label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Description</label>
                    <Textarea value={colDescription} onChange={(e) => setColDescription(e.target.value)} rows={2} />
                  </div>
                  {colShowNewsletter && (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm mb-1">Newsletter Title</label>
                        <Input value={colNewsletterTitle} onChange={(e) => setColNewsletterTitle(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Placeholder</label>
                        <Input value={colNewsletterPlaceholder} onChange={(e) => setColNewsletterPlaceholder(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Button Label</label>
                        <Input value={colNewsletterCtaLabel} onChange={(e) => setColNewsletterCtaLabel(e.target.value)} />
                      </div>
                    </div>
                  )}
                  {renderColumnsEditor()}
                  <div>
                    <label className="block text-sm mb-1">Bottom note</label>
                    <Input value={bottomNote} onChange={(e) => setBottomNote(e.target.value)} />
                  </div>
                </div>
              )}

              {existingType === 'footerHalfscreen' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Badge</label>
                      <Input value={halfBadge} onChange={(e) => setHalfBadge(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Title</label>
                      <Input value={halfTitle} onChange={(e) => setHalfTitle(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Overlay Gradient</label>
                      <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={halfOverlayGradient} onChange={(e) => setHalfOverlayGradient(e.target.checked)} /> Enable</label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Description</label>
                    <Textarea value={halfDescription} onChange={(e) => setHalfDescription(e.target.value)} rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Primary CTA</label>
                      <Input value={halfPrimaryCtaLabel} onChange={(e) => setHalfPrimaryCtaLabel(e.target.value)} placeholder="Label" />
                      <Input value={halfPrimaryCtaHref} onChange={(e) => setHalfPrimaryCtaHref(e.target.value)} placeholder="/href" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Secondary CTA</label>
                      <Input value={halfSecondaryCtaLabel} onChange={(e) => setHalfSecondaryCtaLabel(e.target.value)} placeholder="Label" />
                      <Input value={halfSecondaryCtaHref} onChange={(e) => setHalfSecondaryCtaHref(e.target.value)} placeholder="/href" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Image URL</label>
                      <div className="flex gap-2 items-center">
                        <ImageIcon className="h-4 w-4 opacity-60" />
                        <Input value={halfImageSrc} onChange={(e) => setHalfImageSrc(e.target.value)} placeholder="/random3.jpeg" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Image Alt</label>
                      <Input value={halfImageAlt} onChange={(e) => setHalfImageAlt(e.target.value)} />
                    </div>
                  </div>
                  {renderLinksEditor(halfLinks, setHalfLinks, 'Bottom links')}
                  <div>
                    <label className="block text-sm mb-1">Copyright</label>
                    <Input value={halfCopyright} onChange={(e) => setHalfCopyright(e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
            </div>
          </div>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}


