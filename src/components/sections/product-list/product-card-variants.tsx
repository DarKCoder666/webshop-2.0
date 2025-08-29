"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductPlaceholder from "@/components/sections/product-list/product-placeholder";
import type { ProductCardData } from "@/components/sections/product-list/product-card";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { useWebshopSettings } from "@/components/providers/webshop-settings-provider";
import { formatPriceWithSettings, formatPriceAuto } from "@/lib/currency-utils";
import { QuickAddController } from "./quick-add-to-cart";
import { t, useI18n } from '@/lib/i18n';

type BaseProps = {
  product: ProductCardData;
  className?: string;
  onToggleFavorite?: (id: string, next: boolean) => void;
  onAddToCart?: (id: string) => void;
  imageAspect?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
};

function AddAnimatedButton({ onClick, className, label, addedLabel }: { onClick?: () => void | boolean | Promise<boolean>; className?: string; label?: string; addedLabel?: string }) {
  const tt = useI18n();
  const [adding, setAdding] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const effectiveLabel = label ?? tt('to_cart');
  const effectiveAdded = addedLabel ?? tt('added');
  const [displayedLabel, setDisplayedLabel] = React.useState<string>(effectiveLabel);
  const [trigger, setTrigger] = React.useState<boolean>(true);

  React.useEffect(() => {
    const target = adding ? effectiveAdded : effectiveLabel;
    if (target === displayedLabel) return;
    setTrigger(false);
    const timeoutId = setTimeout(() => {
      setDisplayedLabel(target);
      setTrigger(true);
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [adding, effectiveLabel, effectiveAdded, displayedLabel]);

  const handleAdd = async () => {
    try {
      const result = onClick ? await onClick() : false;
      if (result) {
        setAdding(true);
        setTimeout(() => setAdding(false), 2000);
      }
    } catch {}
  };

  return (
    <motion.button
      type="button"
      onClick={handleAdd}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        "relative inline-flex items-center gap-2 overflow-hidden px-4 py-2 text-sm font-medium transition-colors cursor-pointer border border-border rounded-md",
        hover || adding ? "text-primary-foreground" : undefined,
        className
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-primary"
        initial={{ opacity: 0 }}
        animate={{ opacity: hover || adding ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      />

      <motion.span
        initial={false}
        animate={adding ? { scale: 1.05 } : hover ? { y: -1 } : { y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        className="relative grid place-items-center"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {adding ? (
            <motion.span
              key="check"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 24 }}
            >
              <Check className="h-4 w-4" />
            </motion.span>
          ) : (
            <motion.span key="plus" initial={false}>
              <Plus className="h-4 w-4" />
            </motion.span>
          )}
        </AnimatePresence>
        <motion.span
          aria-hidden
          className="absolute -z-10 size-6 rounded-full bg-primary/20"
          initial={false}
          animate={hover ? { scale: 1.4, opacity: 1 } : { scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        />
      </motion.span>

      <TextEffect
        as="span"
        per="word"
        preset="fade-in-blur"
        speedReveal={1}
        segmentTransition={{ duration: 0.2 }}
        containerTransition={{ staggerChildren: 0.02 }}
        trigger={trigger}
      >
        {displayedLabel}
      </TextEffect>
    </motion.button>
  );
}

export function ProductCardV2({ product, className, onToggleFavorite, imageAspect = '4:3' }: BaseProps) {
  const { settings } = useWebshopSettings();
  const [fav, setFav] = React.useState(!!product.favorite);
  const aspect = imageAspect === '1:1' ? 'aspect-square' : imageAspect === '3:4' ? 'aspect-[3/4]' : imageAspect === '4:3' ? 'aspect-[4/3]' : imageAspect === '9:16' ? 'aspect-[9/16]' : 'aspect-[16/9]';
  return (
    <motion.div className={cn("group overflow-hidden rounded-xl border border-border bg-card", className)} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className={cn("relative", aspect)}>
        {product.imageSrc ? (
          <img src={product.imageSrc} alt={product.title} className="h-full w-full object-cover" />
        ) : (
          <ProductPlaceholder className="h-full w-full" />
        )}
        <button onClick={() => { const n = !fav; setFav(n); onToggleFavorite?.(product.id, n); }} className="absolute left-4 top-4 rounded-full bg-card/90 p-2 text-card-foreground shadow ring-1 ring-border">
          <Heart className={cn("h-5 w-5", fav && "fill-current text-destructive")}/>
        </button>
        <div className="absolute bottom-4 left-4 rounded-full bg-card/90 px-3 py-1 text-xs font-medium ring-1 ring-border">{product.category}</div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="min-w-0">
          <div className="font-semibold">{product.title}</div>
          <div className="text-xs text-muted-foreground">
            {product.discountPrice ? (
              <div className="space-x-2">
                <span className="line-through">{settings ? formatPriceAuto(product.price, settings.currency) : formatPriceWithSettings(product.price, settings)}</span>
                <span className="text-destructive font-semibold">{settings ? formatPriceAuto(product.discountPrice, settings.currency) : formatPriceWithSettings(product.discountPrice, settings)}</span>
              </div>
            ) : (
              settings ? formatPriceAuto(product.price, settings.currency) : formatPriceWithSettings(product.price, settings)
            )}
          </div>
        </div>
        <div className="ml-auto shrink-0">
          <QuickAddController productId={product.id} productTitle={product.title} productImageUrl={product.imageSrc}>
            {({ onClick, Dialog }) => (
              <>
                <AddAnimatedButton onClick={onClick} className="whitespace-nowrap" />
                {Dialog}
              </>
            )}
          </QuickAddController>
        </div>
      </div>
    </motion.div>
  );
}

export function ProductCardV3({ product, className, onToggleFavorite, imageAspect = '3:4' }: BaseProps) {
  const { settings } = useWebshopSettings();
  const [fav, setFav] = React.useState(!!product.favorite);
  const aspect = imageAspect === '1:1' ? 'aspect-square' : imageAspect === '3:4' ? 'aspect-[3/4]' : imageAspect === '4:3' ? 'aspect-[4/3]' : imageAspect === '9:16' ? 'aspect-[9/16]' : 'aspect-[16/9]';
  return (
    <motion.div className={cn("group overflow-hidden rounded-3xl bg-gradient-to-b from-card to-muted/20 border border-border h-full flex flex-col", className)} initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
      <div className="p-4 h-full flex flex-col">
        <div className={cn("relative overflow-hidden rounded-2xl", aspect)}>
          {product.imageSrc ? (
            <img src={product.imageSrc} alt={product.title} className="h-full w-full object-cover" />
          ) : (
            <ProductPlaceholder className="h-full w-full" />
          )}
          <button onClick={() => { const n = !fav; setFav(n); onToggleFavorite?.(product.id, n); }} className="absolute right-3 top-3 rounded-full bg-background/70 p-2 text-foreground shadow">
            <Heart className={cn("h-5 w-5", fav && "fill-current text-destructive")}/>
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">{product.category}</div>
            <div className="text-lg font-semibold">{product.title}</div>
          </div>
          <div className="text-lg font-bold">
            {product.discountPrice ? (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground line-through">
                  {settings ? formatPriceAuto(product.price, settings.currency) : formatPriceWithSettings(product.price, settings)}
                </div>
                <div className="text-lg font-bold text-destructive">
                  {settings ? formatPriceAuto(product.discountPrice, settings.currency) : formatPriceWithSettings(product.discountPrice, settings)}
                </div>
              </div>
            ) : (
              settings ? formatPriceAuto(product.price, settings.currency) : formatPriceWithSettings(product.price, settings)
            )}
          </div>
        </div>
        <QuickAddController productId={product.id} productTitle={product.title} productImageUrl={product.imageSrc}>
          {({ onClick, Dialog }) => (
            <>
              <AddAnimatedButton onClick={onClick} className="mt-auto w-full rounded-xl" />
              {Dialog}
            </>
          )}
        </QuickAddController>
      </div>
    </motion.div>
  );
}

export function ProductCardV4({ product, className, onToggleFavorite, imageAspect = '16:9' }: BaseProps) {
  const { settings } = useWebshopSettings();
  const [fav, setFav] = React.useState(!!product.favorite);
  const aspect = imageAspect === '1:1' ? 'aspect-square' : imageAspect === '3:4' ? 'aspect-[3/4]' : imageAspect === '4:3' ? 'aspect-[4/3]' : imageAspect === '9:16' ? 'aspect-[9/16]' : 'aspect-[16/9]';
  return (
    <motion.div className={cn("group overflow-hidden rounded-xl border border-border bg-card h-full flex flex-col", className)} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className={cn("relative", aspect)}>
        {product.imageSrc ? (
          <img src={product.imageSrc} alt={product.title} className="h-full w-full object-cover" />
        ) : (
          <ProductPlaceholder className="h-full w-full" />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 text-white">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm opacity-80">{product.category}</div>
              <div className="text-lg font-semibold">{product.title}</div>
            </div>
            <div className="rounded-md bg-white/90 px-2 py-1 text-sm font-bold text-black">
              {product.discountPrice ? (
                <div className="space-x-1">
                  <span className="line-through text-xs opacity-70">{settings ? formatPriceAuto(product.price, settings.currency) : formatPriceWithSettings(product.price, settings)}</span>
                  <span>{settings ? formatPriceAuto(product.discountPrice, settings.currency) : formatPriceWithSettings(product.discountPrice, settings)}</span>
                </div>
              ) : (
                settings ? formatPriceAuto(product.price, settings.currency) : formatPriceWithSettings(product.price, settings)
              )}
            </div>
          </div>
        </div>
        <button onClick={() => { const n = !fav; setFav(n); onToggleFavorite?.(product.id, n); }} className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-black shadow">
          <Heart className={cn("h-5 w-5", fav && "fill-current text-destructive")}/>
        </button>
      </div>
      <div className="p-4 mt-auto">
        <QuickAddController productId={product.id} productTitle={product.title} productImageUrl={product.imageSrc}>
          {({ onClick, Dialog }) => (
            <>
              <AddAnimatedButton onClick={onClick} className="mt-2 w-full rounded-lg" />
              {Dialog}
            </>
          )}
        </QuickAddController>
      </div>
    </motion.div>
  );
}

export type ProductCardVariant = "v1" | "v2" | "v3" | "v4";

export function renderProductCardVariant(variant: ProductCardVariant, props: BaseProps) {
  switch (variant) {
    case "v2":
      return <ProductCardV2 {...props} />;
    case "v3":
      return <ProductCardV3 {...props} />;
    case "v4":
      return <ProductCardV4 {...props} />;
    default:
      // v1 is the original ProductCard
      return null;
  }
}


