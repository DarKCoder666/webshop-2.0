'use client';

import React, { useState } from 'react';
import { ShoppingCart, Heart, Share2, Package, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductDetailsProps, ProductVariation } from '@/lib/product-types';
import { cn } from '@/lib/utils';
import AttributeSelector from '@/components/sections/product/attribute-selector';
import { useWebshopSettings } from '@/components/providers/webshop-settings-provider';
import { formatPriceWithSettings } from '@/lib/currency-utils';
import { t } from '@/lib/i18n';

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(
    product.variations[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { settings } = useWebshopSettings();

  const currentVariation = selectedVariation;

  const features = [
    {
      icon: Package,
      title: 'Быстрая упаковка',
      description: 'Аккуратная упаковка в течение 24 часов'
    },
    {
      icon: Truck,
      title: 'Бесплатная доставка',
      description: 'При заказе от 5000 ₽'
    },
    {
      icon: Shield,
      title: 'Гарантия качества',
      description: '30 дней на возврат товара'
    }
  ];

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log('Added to cart:', {
      product: product._id,
      variation: currentVariation?._id,
      quantity
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <section className="py-8 lg:py-12 bg-muted/20">
      <div className="container mx-auto px-4 md:px-10 lg:px-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Purchase Section */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">{t('buy_product')}</h2>
            
            {/* Variation Selection */}
            {product.variations.length > 0 && (
              <div className="space-y-3 mb-6">
                <label className="text-sm font-medium text-foreground">{t('select_parameters')}</label>
                <AttributeSelector
                  variations={product.variations}
                  onSelectedVariationChange={setSelectedVariation}
                />
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t('quantity')}</label>
                <div className="flex items-center border border-border rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-muted transition-colors cursor-pointer"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 min-w-[60px] text-center border-x border-border">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-muted transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-2 flex-1 sm:flex-none">
                <Button    onClick={handleAddToCart}
                  className="flex-1 sm:w-auto cursor-pointer"
                  disabled={!currentVariation}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {t('to_cart')}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={cn(
                    isWishlisted && "text-red-500 border-red-500"
                  )}
                >
                  <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
                </Button>

                <Button
                  variant="outline"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Total Price with discount handling */}
            {currentVariation && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">{t('total')}</span>
                  <div className="flex items-center gap-2 text-lg">
                    {typeof currentVariation.discountPrice === 'number' ? (
                      <>
                        <span className="font-bold text-foreground">
                          {formatPriceWithSettings(
                            currentVariation.discountPrice * quantity,
                            settings
                          )}
                        </span>
                        <span className="text-muted-foreground line-through text-base">
                          {formatPriceWithSettings(
                            currentVariation.price * quantity,
                            settings
                          )}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-foreground">
                        {formatPriceWithSettings(currentVariation.price * quantity, settings)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-lg p-4 border border-border text-center"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Product Specifications */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t('specifications')}</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border last:border-b-0">
                <span className="text-muted-foreground">{t('measurement_unit')}</span>
                <span className="font-medium text-foreground">{product.measurementUnit}</span>
              </div>
              
              {currentVariation && Object.entries(currentVariation.attributes).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-border last:border-b-0">
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
              
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">{t('sku')}</span>
                <span className="font-medium text-foreground">{currentVariation?.articul}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
