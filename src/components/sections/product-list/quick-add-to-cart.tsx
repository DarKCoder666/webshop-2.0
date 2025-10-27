'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/stores/cart-store';
import { useWebshopSettings } from '@/components/providers/webshop-settings-provider';
import { formatPriceWithSettings } from '@/lib/currency-utils';
import AttributeSelector from '@/components/sections/product/attribute-selector';
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogTitle,
  MorphingDialogDescription,
} from '@/components/motion-primitives/morphing-dialog';
import { getWebsiteProduct, Product as ApiProduct } from '@/api/webshop-api';
import type { ProductVariation as SelectorProductVariation } from '@/lib/product-types';
import { t } from '@/lib/i18n';

export type QuickAddControllerProps = {
  productId: string;
  productTitle?: string;
  productImageUrl?: string | null;
  className?: string;
  children: (args: { onClick: () => Promise<boolean>; Dialog: React.ReactNode }) => React.ReactNode;
};

export function QuickAddController({ productId, productTitle, productImageUrl, className, children }: QuickAddControllerProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { settings } = useWebshopSettings();
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const [loading, setLoading] = React.useState(false);
  const [fullProduct, setFullProduct] = React.useState<ApiProduct | null>(null);
  const [selectedVariation, setSelectedVariation] = React.useState<SelectorProductVariation | undefined>(undefined);
  const [quantity, setQuantity] = React.useState<number>(1);

  const openDialog = React.useCallback(() => {
    triggerRef.current?.click();
  }, []);

  const closeDialog = React.useCallback(() => {
    triggerRef.current?.click();
  }, []);

  const selectorVariations: SelectorProductVariation[] = React.useMemo(() => {
    if (!fullProduct || !Array.isArray(fullProduct.variations)) return [];
    return (fullProduct.variations || []).map((v) => ({
      _id: v._id,
      quantity: v.quantity,
      articul: v.articul,
      barcode: v.barcode,
      images: (v.images as any) || [],
      price: v.price,
      discountPrice: v.discountPrice,
      freePrice: v.freePrice,
      alertQuantity: v.alertQuantity,
      attributes: v.attributes || {},
      attributesConverted: (v.attributesConverted || []).map((x) => ({ k: x.k, v: x.v })),
    }));
  }, [fullProduct]);

  async function ensureProduct(): Promise<ApiProduct> {
    if (fullProduct) return fullProduct;
    const prod = await getWebsiteProduct(productId);
    setFullProduct(prod);
    return prod;
  }

  async function addDirect(prod: ApiProduct, variationIndex = 0): Promise<void> {
    const v = prod.variations[variationIndex];
    addItem(
      {
        productId: v._id,
        productName: prod.name,
        productBaseId: prod._id,
        imageUrl: productImageUrl || prod.image?.image.smallUrl || v.images?.[0]?.image.smallUrl,
        price: v.price,
        discountPrice: v.discountPrice,
        attributes: v.attributes,
      },
      1
    );
  }

  const handleClick = React.useCallback(async (): Promise<boolean> => {
    if (loading) return false;
    setLoading(true);
    try {
      const prod = await ensureProduct();
      if (!prod || !Array.isArray(prod.variations) || prod.variations.length === 0) {
        setLoading(false);
        return false;
      }
      if (prod.variations.length === 1) {
        await addDirect(prod, 0);
        setLoading(false);
        return true; // added
      }
      // multiple variations -> open dialog
      setLoading(false);
      openDialog();
      return false; // not yet added
    } catch (e) {
      setLoading(false);
      return false;
    }
  }, [loading, openDialog]);

  const Dialog = (
    <MorphingDialog>
      {/* Hidden trigger to programmatically toggle */}
      <MorphingDialogTrigger className={cn('sr-only', className)} triggerRef={triggerRef} />
      <MorphingDialogContainer>
        <MorphingDialogContent className="relative w-[92vw] max-w-md rounded-xl border border-border bg-card p-5 shadow-xl">
          <MorphingDialogClose />
          <MorphingDialogTitle className="text-lg font-semibold text-card-foreground">
            {productTitle || fullProduct?.name || t('product_variations')}
          </MorphingDialogTitle>
          <MorphingDialogDescription className="mt-1 text-sm text-muted-foreground">
            {t('select_parameters')}
          </MorphingDialogDescription>

          {/* Variant selector */}
          {selectorVariations.length > 0 && (
            <div className="mt-4">
              <AttributeSelector
                variations={selectorVariations}
                onSelectedVariationChange={setSelectedVariation}
              />
            </div>
          )}

          {/* Quantity and footer */}
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">{t('quantity_label')}</div>
              <div className="mt-1 inline-flex items-center rounded border border-border">
                <button
                  type="button"
                  className="px-3 py-1.5 cursor-pointer hover:bg-muted"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <div className="px-4 py-1.5 min-w-[48px] text-center border-x border-border">{quantity}</div>
                <button
                  type="button"
                  className="px-3 py-1.5 cursor-pointer hover:bg-muted"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex-1 text-right">
              {selectedVariation && settings && (
                <div className="text-sm">
                  <span className="text-muted-foreground mr-2">{t('total_short')}:</span>
                  <span className="font-semibold">
                    {formatPriceWithSettings(
                      (typeof selectedVariation.discountPrice === 'number' && selectedVariation.discountPrice >= 0
                        ? selectedVariation.discountPrice
                        : selectedVariation.price) * quantity,
                      settings
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={closeDialog}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              className="cursor-pointer"
              disabled={!selectedVariation}
              onClick={() => {
                if (!fullProduct || !selectedVariation) return;
                addItem(
                  {
                    productId: selectedVariation._id,
                    productName: fullProduct.name,
                    productBaseId: fullProduct._id,
                    imageUrl: productImageUrl || fullProduct.image?.image.smallUrl,
                    price: selectedVariation.price,
                    discountPrice: selectedVariation.discountPrice,
                    attributes: selectedVariation.attributes,
                  },
                  quantity
                );
                closeDialog();
              }}
            >
              {t('to_cart')}
            </Button>
          </div>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );

  return <>{children({ onClick: handleClick, Dialog })}</>;
}


