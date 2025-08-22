"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Plus, ShoppingCart, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/components/product-card";
import { TextEffect } from "@/components/motion-primitives/text-effect";

type BaseProps = {
  product: ProductCardData;
  className?: string;
  onToggleFavorite?: (id: string, next: boolean) => void;
  onAddToCart?: (id: string) => void;
  imageAspect?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
};

function AddAnimatedButton({ onClick, className, label = "Add to Cart", addedLabel = "Added" }: { onClick?: () => void; className?: string; label?: string; addedLabel?: string }) {
  const [adding, setAdding] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const [displayedLabel, setDisplayedLabel] = React.useState<string>(label);
  const [trigger, setTrigger] = React.useState<boolean>(true);

  React.useEffect(() => {
    const target = adding ? addedLabel : label;
    if (target === displayedLabel) return;
    setTrigger(false);
    const t = setTimeout(() => {
      setDisplayedLabel(target);
      setTrigger(true);
    }, 200);
    return () => clearTimeout(t);
  }, [adding, label, addedLabel, displayedLabel]);

  const handleAdd = () => {
    setAdding(true);
    onClick?.();
    setTimeout(() => setAdding(false), 2000);
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

export function ProductCardV2({ product, className, onToggleFavorite, onAddToCart, imageAspect = '4:3' }: BaseProps) {
  const [fav, setFav] = React.useState(!!product.favorite);
  const aspect = imageAspect === '1:1' ? 'aspect-square' : imageAspect === '3:4' ? 'aspect-[3/4]' : imageAspect === '4:3' ? 'aspect-[4/3]' : imageAspect === '9:16' ? 'aspect-[9/16]' : 'aspect-[16/9]';
  return (
    <motion.div className={cn("group overflow-hidden rounded-xl border border-border bg-card", className)} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className={cn("relative", aspect)}>
        <img src={product.imageSrc} alt={product.title} className="h-full w-full object-cover" />
        <button onClick={() => { const n = !fav; setFav(n); onToggleFavorite?.(product.id, n); }} className="absolute left-4 top-4 rounded-full bg-card/90 p-2 text-card-foreground shadow ring-1 ring-border">
          <Heart className={cn("h-5 w-5", fav && "fill-current text-destructive")}/>
        </button>
        <div className="absolute bottom-4 left-4 rounded-full bg-card/90 px-3 py-1 text-xs font-medium ring-1 ring-border">{product.category}</div>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <div className="font-semibold">{product.title}</div>
          <div className="text-xs text-muted-foreground">${product.price}</div>
        </div>
        <AddAnimatedButton onClick={() => onAddToCart?.(product.id)} label="Add" />
      </div>
    </motion.div>
  );
}

export function ProductCardV3({ product, className, onToggleFavorite, onAddToCart, imageAspect = '3:4' }: BaseProps) {
  const [fav, setFav] = React.useState(!!product.favorite);
  const aspect = imageAspect === '1:1' ? 'aspect-square' : imageAspect === '3:4' ? 'aspect-[3/4]' : imageAspect === '4:3' ? 'aspect-[4/3]' : imageAspect === '9:16' ? 'aspect-[9/16]' : 'aspect-[16/9]';
  return (
    <motion.div className={cn("group overflow-hidden rounded-3xl bg-gradient-to-b from-card to-muted/20 border border-border", className)} initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
      <div className="p-4">
        <div className={cn("relative overflow-hidden rounded-2xl", aspect)}>
          <img src={product.imageSrc} alt={product.title} className="h-full w-full object-cover" />
          <button onClick={() => { const n = !fav; setFav(n); onToggleFavorite?.(product.id, n); }} className="absolute right-3 top-3 rounded-full bg-background/70 p-2 text-foreground shadow">
            <Heart className={cn("h-5 w-5", fav && "fill-current text-destructive")}/>
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">{product.category}</div>
            <div className="text-lg font-semibold">{product.title}</div>
          </div>
          <div className="text-lg font-bold">${product.price}</div>
        </div>
        <AddAnimatedButton onClick={() => onAddToCart?.(product.id)} className="mt-4 w-full rounded-xl" label="Add to Cart" />
      </div>
    </motion.div>
  );
}

export function ProductCardV4({ product, className, onToggleFavorite, onAddToCart, imageAspect = '16:9' }: BaseProps) {
  const [fav, setFav] = React.useState(!!product.favorite);
  const aspect = imageAspect === '1:1' ? 'aspect-square' : imageAspect === '3:4' ? 'aspect-[3/4]' : imageAspect === '4:3' ? 'aspect-[4/3]' : imageAspect === '9:16' ? 'aspect-[9/16]' : 'aspect-[16/9]';
  return (
    <motion.div className={cn("group overflow-hidden rounded-xl border border-border bg-card", className)} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className={cn("relative", aspect)}>
        <img src={product.imageSrc} alt={product.title} className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 text-white">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm opacity-80">{product.category}</div>
              <div className="text-lg font-semibold">{product.title}</div>
            </div>
            <div className="rounded-md bg-white/90 px-2 py-1 text-sm font-bold text-black">${product.price}</div>
          </div>
        </div>
        <button onClick={() => { const n = !fav; setFav(n); onToggleFavorite?.(product.id, n); }} className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-black shadow">
          <Heart className={cn("h-5 w-5", fav && "fill-current text-destructive")}/>
        </button>
      </div>
      <div className="p-4">
        <AddAnimatedButton onClick={() => onAddToCart?.(product.id)} className="mt-2 w-full rounded-lg" label="Add to Cart" />
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


