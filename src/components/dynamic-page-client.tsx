'use client';

import React from 'react';
import { SharedPageLayout } from '@/components/shared-page-layout';
import { SiteConfig } from '@/lib/builder-types';

interface DynamicPageClientProps {
  config: SiteConfig;
}

export function DynamicPageClient({ config }: DynamicPageClientProps) {
  return <SharedPageLayout config={config} isBuilder={false} />;
}
