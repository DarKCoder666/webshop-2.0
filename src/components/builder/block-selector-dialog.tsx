"use client";

import React from "react";
import { motion } from "motion/react";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogDescription,
  MorphingDialogClose,
} from "@/components/motion-primitives/morphing-dialog";
import { BLOCK_SCHEMAS } from "./block-registry";
import { BlockType } from "@/lib/builder-types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

// Map block types to their preview images
const BLOCK_PREVIEWS: Record<BlockType, string> = {
  heroSection: "/block-previews/hero-section.png",
  hero37: "/block-previews/hero-37.png",
  hero210: "/block-previews/hero-210.png",
  hero85: "/block-previews/hero-85.png",
  testimonials: "/block-previews/hero-section.png",
  navigation: "/block-previews/hero-section.png",
  testimonials2: "/block-previews/hero-section.png",
  testimonials3: "/block-previews/hero-section.png",
  productsList: "/block-previews/hero-section.png",
  productGallery: "/block-previews/hero-section.png",
  productDetails: "/block-previews/hero-section.png",
  productOverview: "/block-previews/hero-section.png",
  footerMinimal: "/block-previews/hero-section.png",
  footerColumns: "/block-previews/hero-section.png",
  footerHalfscreen: "/block-previews/hero-section.png",
  textLongform: "/block-previews/hero-section.png",
  textWithImage: "/block-previews/hero-section.png",
};

type BlockSelectorDialogProps = {
  onPick: (type: BlockType) => void;
  trigger?: React.ReactNode;
  className?: string;
};

export function BlockSelectorDialog({ onPick, trigger, className }: BlockSelectorDialogProps) {
  const [selectedBlock, setSelectedBlock] = React.useState<BlockType | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<string>("hero");
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const tt = useI18n();

  // Scroll spy for side navigation
  React.useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root) return;
    const sections = Array.from(root.querySelectorAll('[id^="cat-"]')) as HTMLElement[];
    if (sections.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top));
      if (visible[0]) {
        const id = visible[0].target.id.replace('cat-', '');
        setActiveCategory(id);
      }
    }, { root, threshold: 0.5, rootMargin: '0px 0px -40% 0px' });
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const handleBlockSelect = (type: BlockType) => {
    onPick(type);
    // Close the dialog after selection
    setTimeout(() => {
      const closeButton = document.querySelector('[aria-label="Close dialog"]') as HTMLButtonElement;
      if (closeButton) {
        closeButton.click();
      }
    }, 100);
  };

  return (
    <MorphingDialog>
        <MorphingDialogTrigger className={cn("rounded-full border border-border bg-card px-3 py-2 text-sm font-medium shadow-md hover:bg-muted transition-colors text-card-foreground", className)}>
          {trigger || tt('builder_add_section_trigger' as any)}
        </MorphingDialogTrigger>
      
      <MorphingDialogContainer>
        <MorphingDialogContent className="w-[900px] max-w-[95vw] rounded-2xl bg-card shadow-2xl border border-border">
          <div className="p-6">
            <MorphingDialogTitle className="text-2xl font-bold text-card-foreground">
              {tt('builder_add_section_title' as any)}
            </MorphingDialogTitle>
            <MorphingDialogDescription className="mt-2 text-muted-foreground">
              {tt('builder_add_section_desc' as any)}
            </MorphingDialogDescription>
            
            {/* Categorized list */}
            {(() => {
              const heroTypes: BlockType[] = ["heroSection", "hero37", "hero210", "hero85"];
              const testimonialTypes: BlockType[] = ["testimonials", "testimonials2", "testimonials3"];
              const textTypes: BlockType[] = ["textLongform", "textWithImage"];
              const productListTypes: BlockType[] = ["productsList"];

              const categories = [
                { id: 'hero', title: tt('category_hero' as any), items: BLOCK_SCHEMAS.filter((s) => heroTypes.includes(s.type)) },
                { id: 'testimonials', title: tt('category_testimonials' as any), items: BLOCK_SCHEMAS.filter((s) => testimonialTypes.includes(s.type)) },
                { id: 'texts', title: tt('category_texts' as any), items: BLOCK_SCHEMAS.filter((s) => textTypes.includes(s.type)) },
                { id: 'product-list', title: tt('category_product_list' as any), items: BLOCK_SCHEMAS.filter((s) => productListTypes.includes(s.type)) },
              ];

              return (
                <motion.div
                  ref={scrollContainerRef}
                  className="mt-6 grid grid-cols-[200px_1fr] gap-6 max-h-[70vh] overflow-y-auto overflow-x-hidden pr-2 pb-2"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--muted)) transparent' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Left sticky navigation */}
                  <div className="hidden md:block">
                    <div className="sticky top-0 py-1">
                      <ul className="space-y-1">
                        {categories.map((cat) => (
                          <li key={cat.id}>
                            <button
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-md text-sm",
                                activeCategory === cat.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"
                              )}
                              onClick={() => {
                                const section = scrollContainerRef.current?.querySelector(`#cat-${cat.id}`) as HTMLElement | null;
                                section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }}
                            >
                              {cat.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right content */}
                  <div>
                    {categories.map((cat) => (
                      cat.items.length > 0 && (
                        <div key={cat.id} id={`cat-${cat.id}`} className="mb-6">
                          <h4 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">
                            {cat.title}
                          </h4>
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cat.items.map((schema, index) => (
                              <motion.div
                                key={schema.type}
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: index * 0.08 + 0.2, type: "spring", stiffness: 300, damping: 20 }}
                                className="group relative h-full flex"
                              >
                                <button
                                  onClick={() => handleBlockSelect(schema.type)}
                                  onMouseEnter={() => setSelectedBlock(schema.type)}
                                  onMouseLeave={() => setSelectedBlock(null)}
                                  className={cn(
                                    "w-full h-full text-left rounded-xl border-2 transition-all duration-300 flex flex-col",
                                    "hover:border-primary hover:shadow-lg",
                                    selectedBlock === schema.type ? "border-primary shadow-lg scale-[1.02]" : "border-border"
                                  )}
                                >
                                  <div className="aspect-video bg-muted rounded-t-[10px] overflow-hidden flex-shrink-0">
                                    <img
                                      src={BLOCK_PREVIEWS[schema.type]}
                                      alt={`Preview of ${schema.label}`}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                  </div>
                                  <div className="p-4 flex flex-col flex-grow">
                                    <div className="flex-grow">
                                      <h3 className="font-semibold text-card-foreground mb-1">
                                        {getBlockLabel(schema.type, tt)}
                                      </h3>
                                      <p className="text-sm text-muted-foreground mb-3">
                                        {getBlockDescription(schema.type, tt)}
                                      </p>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-auto">
                                      {getBlockFeatures(schema.type, tt).map((feature, idx) => (
                                        <span
                                          key={idx}
                                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground"
                                        >
                                          {feature}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <motion.div
                                    className="absolute inset-0 bg-foreground/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    initial={false}
                                  >
                                    <motion.div
                                      className="bg-primary rounded-full px-4 py-2 shadow-lg"
                                      initial={{ scale: 0.8, opacity: 0 }}
                                      animate={selectedBlock === schema.type ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <span className="text-sm font-medium text-primary-foreground">{tt('select' as any)}</span>
                                    </motion.div>
                                  </motion.div>
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </motion.div>
              );
            })()}
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

// Helper functions: labels, descriptions and features (localized)
function getBlockLabel(type: BlockType, tfunc: (key: any) => string): string {
  switch (type) {
    case "textLongform":
      return tfunc('block_text_longform' as any);
    case "textWithImage":
      return tfunc('block_text_with_image' as any);
    case "heroSection":
      return tfunc('block_hero_section' as any);
    case "hero37":
      return tfunc('block_hero_37' as any);
    case "hero210":
      return tfunc('block_hero_210' as any);
    case "hero85":
      return tfunc('block_hero_85' as any);
    case "testimonials":
      return tfunc('block_testimonials_1' as any);
    case "testimonials2":
      return tfunc('block_testimonials_2' as any);
    case "testimonials3":
      return tfunc('block_testimonials_3' as any);
    case "productsList":
      return tfunc('block_products_list' as any);
    default:
      return 'Block';
  }
}

function getBlockDescription(type: BlockType, tfunc: (key: any) => string): string {
  switch (type) {
    case "textLongform":
      return tfunc('desc_text_longform' as any);
    case "textWithImage":
      return tfunc('desc_text_with_image' as any);
    case "heroSection":
      return tfunc('desc_hero_section' as any);
    case "hero37":
      return tfunc('desc_hero_37' as any);
    case "hero210":
      return tfunc('desc_hero_210' as any);
    case "hero85":
      return tfunc('desc_hero_85' as any);
    case "testimonials":
      return tfunc('desc_testimonials_1' as any);
    case "testimonials2":
      return tfunc('desc_testimonials_2' as any);
    case "testimonials3":
      return tfunc('desc_testimonials_3' as any);
    case "productsList":
      return tfunc('desc_products_list' as any);
    default:
      return '';
  }
}

function getBlockFeatures(type: BlockType, tfunc: (key: any) => string): string[] {
  switch (type) {
    case "textLongform":
      return [tfunc('feat_article' as any), tfunc('feat_aside' as any), tfunc('feat_editable_text' as any)];
    case "textWithImage":
      return [tfunc('feat_one_image' as any), tfunc('feat_cta' as any), tfunc('feat_editable_text' as any)];
    case "heroSection":
      return [tfunc('feat_image' as any), tfunc('feat_cta_buttons' as any), tfunc('feat_description' as any)];
    case "hero37":
      return [tfunc('feat_badge' as any), tfunc('feat_two_cta' as any), tfunc('feat_modern_design' as any)];
    case "hero210":
      return [tfunc('feat_carousel' as any), tfunc('feat_animation' as any), tfunc('feat_interactive' as any)];
    case "hero85":
      return [tfunc('feat_autoscroll' as any), tfunc('feat_dynamic_content' as any), tfunc('feat_smooth_transitions' as any)];
    case "testimonials":
      return [tfunc('feat_reviews' as any), tfunc('feat_two_carousels' as any), tfunc('feat_drag_autoplay' as any)];
    case "productsList":
      return [tfunc('feat_product_cards' as any), tfunc('feat_animations' as any), tfunc('feat_settings' as any)];
    default:
      return [];
  }
}
