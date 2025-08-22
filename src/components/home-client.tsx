'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HeroHeader } from '@/components/header';
import { DynamicBlock } from '@/components/builder/dynamic-block';
import { ThemeProvider } from '@/components/builder/theme-provider';
import { RenderBlock } from '@/components/builder/block-registry';
import { SiteConfig } from '@/lib/builder-types';

type HomeClientProps = {
  initialConfig: SiteConfig;
};

export function HomeClient({ initialConfig }: HomeClientProps) {
  const [config, setConfig] = useState(initialConfig);

  // Check if there's a navigation block in the config
  const navigationBlock = config.blocks.find(block => block.type === 'navigation');
  // Filter out navigation blocks from main content since we render them separately
  const contentBlocks = config.blocks.filter(block => block.type !== 'navigation');

  return (
    <ThemeProvider config={config}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Render navigation block if it exists, otherwise fall back to old header */}
        {navigationBlock ? (
          <RenderBlock block={navigationBlock} />
        ) : (
          <HeroHeader config={config} />
        )}
        
        <main>
          <div className="fixed left-4 top-4 z-[60]">
            <Link href="/builder" className="rounded-md border border-border bg-card/80 px-3 py-1.5 text-xs shadow-sm backdrop-blur hover:bg-card text-card-foreground">
              Open Builder
            </Link>
          </div>
          {contentBlocks.map((block) => (
            <DynamicBlock key={block.id} block={block} />
          ))}
        </main>
      </div>
    </ThemeProvider>
  );
}
