'use client';

import React from 'react';
import { RenderBlock } from '@/components/builder/block-registry';
import { BuilderProvider } from '@/components/builder/builder-context';
import { SiteConfig } from '@/lib/builder-types';

interface SharedPageLayoutProps {
  config: SiteConfig;
  isBuilder?: boolean;
  children?: React.ReactNode;
}

export function SharedPageLayout({ config, isBuilder = false, children }: SharedPageLayoutProps) {
  // Create a unique page identifier for consistent keys
  const pageId = config.id || 'page';
  
  return (
    <BuilderProvider isBuilder={isBuilder} blocks={config.blocks}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Page Content */}
        <main>
          {children || config.blocks
            .filter(b => b.type !== 'navigation' && !b.type.startsWith('footer'))
            .map((block) => (
              <RenderBlock key={`block-${pageId}-${block.id}`} block={block} />
            ))}
        </main>
      </div>
    </BuilderProvider>
  );
}
