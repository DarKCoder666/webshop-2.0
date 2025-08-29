"use client";

import React from "react";
import { SiteConfig } from "@/lib/builder-types";
import { getAllLayouts, getDefaultSiteConfig } from "@/api/webshop-api";
import FooterMinimal from "@/components/sections/footer/footer-minimal";
import FooterColumns from "@/components/sections/footer/footer-columns";
import FooterHalfscreen from "@/components/sections/footer/footer-halfscreen";

type FooterType = "footerMinimal" | "footerColumns" | "footerHalfscreen";

function isFooterType(type: string): type is FooterType {
  return type === "footerMinimal" || type === "footerColumns" || type === "footerHalfscreen";
}

export function Footer({ config }: { config?: SiteConfig }) {
  const [resolvedConfig, setResolvedConfig] = React.useState<SiteConfig | null>(config || null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    if (!config) {
      (async () => {
        try {
          const layouts = await getAllLayouts();
          const home = layouts.find((l) => l.pageType === "home");
          if (mounted) {
            if (home) {
              setResolvedConfig(home.config);
            } else {
              // Fallback to default configuration if no home page exists
              const defaultConfig = getDefaultSiteConfig();
              setResolvedConfig(defaultConfig);
            }
          }
        } catch (e) {
          // Fallback to default configuration on error
          if (mounted) {
            const defaultConfig = getDefaultSiteConfig();
            setResolvedConfig(defaultConfig);
          }
        }
      })();
    }
    return () => {
      mounted = false;
    };
  }, [config, refreshKey]);

  // Listen for footer updates
  React.useEffect(() => {
    const handleFooterUpdate = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('footerUpdated', handleFooterUpdate);
    return () => window.removeEventListener('footerUpdated', handleFooterUpdate);
  }, []);

  const blocks = resolvedConfig?.blocks || [];
  const footerBlocks = blocks.filter((b) => isFooterType(b.type as string));
  if (footerBlocks.length === 0) return null;

  // Prefer the last footer block if multiple exist
  const footerBlock = footerBlocks[footerBlocks.length - 1];
  const type = footerBlock.type as FooterType;

  if (type === "footerMinimal") {
    return <FooterMinimal {...(footerBlock.props as any)} blockId={footerBlock.id} />;
  }
  if (type === "footerColumns") {
    return <FooterColumns {...(footerBlock.props as any)} blockId={footerBlock.id} />;
  }
  if (type === "footerHalfscreen") {
    return <FooterHalfscreen {...(footerBlock.props as any)} blockId={footerBlock.id} />;
  }
  return null;
}

export default Footer;


