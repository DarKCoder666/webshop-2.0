'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductGalleryProps } from '@/lib/product-types';
import { cn } from '@/lib/utils';
import ProductPlaceholder from '@/components/sections/product-list/product-placeholder';
import { t } from '@/lib/i18n';

export default function ProductGallery({ product }: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get all images from main product image and variations
  const allImages = [
    product.image,
    ...product.variations.flatMap(variation => variation.images)
  ].filter(Boolean); // Remove any null/undefined images

  const hasImages = allImages.length > 0;
  const selectedImage = hasImages ? allImages[selectedImageIndex] : null;

  const nextImage = () => {
    if (hasImages) {
      setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  const prevImage = () => {
    if (hasImages) {
      setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  return (
    <section className="py-8 lg:py-12">
      <div className="container mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Main Image Display */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              {hasImages && selectedImage ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={selectedImage.url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ProductPlaceholder className="w-full h-full" />
                </div>
              )}

              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {allImages.map((image, index) => (
                  <button
                    key={image._id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "relative flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-colors",
                      selectedImageIndex === index
                        ? "border-primary"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Basic Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              
              {product.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Price Display */}
            {product.variations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">{t('product_variations')}</h3>
                {product.variations.map((variation) => (
                  <div
                    key={variation._id}
                    className="p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(variation.attributes).map(([key, value]) => (
                            <span
                              key={key}
                              className="px-2 py-1 bg-muted text-muted-foreground rounded text-sm"
                            >
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t('sku')} {variation.articul}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-foreground">
                          {(variation.price / 100).toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
