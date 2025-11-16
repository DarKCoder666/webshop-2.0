'use client';

import React, { useMemo, useState } from 'react';
// import Image from 'next/image';
import { cn } from '@/lib/utils';
import ProductPlaceholder from '@/components/sections/product-list/product-placeholder';
import { Product } from '@/lib/product-types';
// Removed old carousel/morphing imports in favor of ProductImageSlider
import { ProductImageSlider } from '@/components/product-image-slider';
import { useWebshopSettings } from '@/components/providers/webshop-settings-provider';
import { formatDiscountPercentage, formatPriceWithSettings } from '@/lib/currency-utils';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check } from 'lucide-react';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import AttributeSelector from '@/components/sections/product/attribute-selector';
import type { ProductVariation } from '@/lib/product-types';
import { useCartStore } from '@/lib/stores/cart-store';
import { t, useI18n } from '@/lib/i18n';

export type ProductOverviewProps = {
  product: Product;
  blockId?: string;
};

export default function ProductOverview({ product }: ProductOverviewProps) {
  const { settings } = useWebshopSettings();
  const tt = useI18n();
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(
    product.variations[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [hoverAdd, setHoverAdd] = useState(false);
  const [displayedLabel, setDisplayedLabel] = useState<string>(tt('to_cart'));
  const [labelTrigger, setLabelTrigger] = useState<boolean>(true);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  // Flatten images: first main product image, then variation images, keeping mapping to variation
  const images = useMemo(() => {
    const base: Array<{ _id: string; smallUrl: string; bigUrl: string; variationId?: string }> = [];
    
    // Handle main product image - API returns ProductImage with url/filename
    if (product.image?.image?.bigUrl) {
      base.push({ 
        _id: product.image._id, 
        smallUrl: product.image.image.smallUrl, 
        bigUrl: product.image.image.bigUrl 
      });
    }
    
    // Handle variation images - these are ProductImage with url/filename
    for (const v of product.variations) {
      for (const img of v.images) {
        if (img.image) {
          base.push({ 
            _id: img._id, 
            smallUrl: img.image.smallUrl, 
            bigUrl: img.image.bigUrl, 
            variationId: v._id 
          });
        }
      }
    }
    return base;
  }, [product]);

  const hasImages = images.length > 0;
  const imageUrls = useMemo(() => images.map((i) => i.bigUrl), [images]);

  // Sync carousel to selected variation's first image when selection changes
  React.useEffect(() => {
    if (!hasImages) return;
    if (!selectedVariation) {
      setCarouselIndex(0);
      return;
    }
    const idx = images.findIndex((img) => img.variationId === selectedVariation._id);
    if (idx >= 0) setCarouselIndex(idx);
  }, [selectedVariation, images, hasImages]);

  React.useEffect(() => {
    const target = adding ? tt('added') : tt('to_cart');
    if (target === displayedLabel) return;
    setLabelTrigger(false);
    const timeoutId = setTimeout(() => {
      setDisplayedLabel(target);
      setLabelTrigger(true);
    }, 220);
    return () => clearTimeout(timeoutId);
  }, [adding, displayedLabel, tt]);

  const addItem = useCartStore((s) => s.addItem);
  const handleAdd = () => {
    if (!selectedVariation) return;
    setAdding(true);
    addItem(
      {
        productId: selectedVariation._id, // variation id as productId
        productName: product.name,
        productBaseId: product._id,
        imageUrl: images[carouselIndex]?.bigUrl,
        price: selectedVariation.price,
        discountPrice: selectedVariation.discountPrice,
        attributes: selectedVariation.attributes,
      },
      quantity
    );
    setTimeout(() => setAdding(false), 800);
  };

  // Selected variation updates come from AttributeSelector

  return (
    <section className="py-8 lg:py-12">
      <div className="container mx-auto px-4 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Images with slider */}
          <div>
            {hasImages ? (
              <ProductImageSlider
                images={imageUrls}
                alt={product.name}
                index={carouselIndex}
                onIndexChange={setCarouselIndex}
                className="rounded-lg"
              />
            ) : (
              <div className="aspect-square overflow-hidden rounded-lg">
                <ProductPlaceholder className="h-full w-full" />
              </div>
            )}
          </div>

          {/* Right: Details and variations */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{product.name}</h1>
              {product.description && (
                <p className="mt-2 text-muted-foreground leading-relaxed">{product.description}</p>
              )}
            </div>

            {/* Variations by attributes */}
            {product.variations.length > 0 && (
              <div className="space-y-4">
                <AttributeSelector
                  variations={product.variations}
                  onSelectedVariationChange={setSelectedVariation}
                />

                {selectedVariation && (
                  <div className="rounded-md border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {t('price')}
                      </div>
                      <div className="flex items-center gap-2">
                        {typeof selectedVariation.discountPrice === 'number' && selectedVariation.discountPrice < selectedVariation.price ? (
                          <>
                            <span className="text-lg font-bold text-foreground">
                              {formatPriceWithSettings(selectedVariation.discountPrice, settings)}
                            </span>
                            <span className="text-base text-muted-foreground line-through">
                              {formatPriceWithSettings(selectedVariation.price, settings)}
                            </span>
                            <span className="ml-1 rounded bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600">
                              {formatDiscountPercentage(selectedVariation.price, selectedVariation.discountPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-foreground">
                            {formatPriceWithSettings(selectedVariation.price, settings)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity and actions */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div>
                <div className="text-sm font-medium text-foreground mb-1">{t('quantity_label')}</div>
                <div className="flex items-center rounded border border-border">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-muted">−</button>
                  <span className="px-4 py-2 min-w-[56px] text-center border-x border-border">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-muted">+</button>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={handleAdd}
                onMouseEnter={() => setHoverAdd(true)}
                onMouseLeave={() => setHoverAdd(false)}
                disabled={!selectedVariation}
                className={cn(
                  'relative flex items-center gap-2 overflow-hidden px-6 py-3 text-base font-medium transition-colors rounded-md border border-border cursor-pointer',
                  hoverAdd || adding ? 'text-primary-foreground bg-primary' : 'bg-card text-card-foreground',
                  !selectedVariation && 'opacity-60 cursor-not-allowed'
                )}
                whileHover={selectedVariation ? { scale: 1.01 } : undefined}
                whileTap={selectedVariation ? { scale: 0.98 } : undefined}
              >
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoverAdd || adding ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                />

                <motion.span
                  initial={false}
                  animate={adding ? { scale: 1.05 } : hoverAdd ? { y: -1 } : { y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="relative grid place-items-center"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {adding ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                      >
                        <Check className="h-5 w-5" />
                      </motion.span>
                    ) : (
                      <motion.span key="plus" initial={false} animate={hoverAdd ? { scale: 1.05 } : { scale: 1 }}>
                        <Plus className="h-5 w-5" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <motion.span
                    aria-hidden
                    className="absolute -z-10 size-6 rounded-full bg-primary/20"
                    initial={false}
                    animate={hoverAdd ? { scale: 1.4, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  />
                </motion.span>

                <div className="relative overflow-hidden">
                  <TextEffect
                    as="span"
                    per="word"
                    preset="fade-in-blur"
                    speedReveal={1}
                    segmentTransition={{ duration: 0.2 }}
                    containerTransition={{ staggerChildren: 0.02 }}
                    trigger={labelTrigger}
                  >
                    {displayedLabel}
                  </TextEffect>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
