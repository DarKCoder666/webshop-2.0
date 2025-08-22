"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextEffect } from "@/components/motion-primitives/text-effect";

export type ProductCardData = {
  id: string;
  title: string;
  category: string;
  price: number;
  imageSrc: string;
  favorite?: boolean;
};

type ProductCardProps = {
  product: ProductCardData;
  className?: string;
  onToggleFavorite?: (id: string, next: boolean) => void;
  onAddToCart?: (id: string) => void;
  imageAspect?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
};

export function ProductCard({
  product,
  className,
  onToggleFavorite,
  onAddToCart,
  imageAspect = '4:3',
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = React.useState<boolean>(!!product.favorite);
  const [adding, setAdding] = React.useState(false);
  const [hoverAdd, setHoverAdd] = React.useState(false);
  const [displayedLabel, setDisplayedLabel] = React.useState<string>("Add to Card");
  const [labelTrigger, setLabelTrigger] = React.useState<boolean>(true);

  React.useEffect(() => {
    const target = adding ? "Added" : "Add to Card";
    if (target === displayedLabel) return;
    setLabelTrigger(false);
    const t = setTimeout(() => {
      setDisplayedLabel(target);
      setLabelTrigger(true);
    }, 220);
    return () => clearTimeout(t);
  }, [adding, displayedLabel]);

  const aspectClass = React.useMemo(() => {
    switch (imageAspect) {
      case '1:1':
        return 'aspect-square';
      case '3:4':
        return 'aspect-[3/4]';
      case '4:3':
        return 'aspect-[4/3]';
      case '9:16':
        return 'aspect-[9/16]';
      case '16:9':
        return 'aspect-[16/9]';
      default:
        return 'aspect-[4/3]';
    }
  }, [imageAspect]);

  const toggleFav = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    onToggleFavorite?.(product.id, next);
  };

  const handleAdd = async () => {
    setAdding(true);
    onAddToCart?.(product.id);
    // small feedback animation
    setTimeout(() => setAdding(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm",
        className
      )}
    >
      <div className={cn("relative overflow-hidden", aspectClass)}>
        <motion.img
          src={product.imageSrc}
          alt={product.title}
          className="h-full w-full object-cover"
          initial={false}
          whileHover={{ scale: 1.05 }}
          animate={adding ? { scale: 1.02 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />

        <button
          type="button"
          onClick={toggleFav}
          className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-card/90 text-card-foreground shadow-md ring-1 ring-border transition-colors hover:bg-card"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <motion.span
            initial={false}
            animate={{ scale: isFavorite ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            className={cn("grid place-items-center", isFavorite ? "text-destructive" : "text-foreground")}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
          </motion.span>
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold leading-tight">{product.title}</h3>
          <div className="text-lg font-bold">${product.price}</div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
      </div>

      <div className="mx-5 border-t border-border" />

      <motion.button
        type="button"
        onClick={handleAdd}
        onMouseEnter={() => setHoverAdd(true)}
        onMouseLeave={() => setHoverAdd(false)}
        className={cn(
          "relative flex w-full items-center gap-2 overflow-hidden px-6 py-4 text-base font-medium transition-colors cursor-pointer",
          hoverAdd || adding ? "text-primary-foreground" : undefined
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* background fill with theme color on hover/click */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: hoverAdd || adding ? 1 : 0 }}
          transition={{ duration: 0.25 }}
        />

        {/* removed center burst/pulse animation per request */}

        {/* icon micro-interaction */}
        <motion.span
          initial={false}
          animate={adding ? { scale: 1.05 } : hoverAdd ? { y: -1 } : { y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="relative grid place-items-center"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {adding ? (
              <motion.span
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 24 }}
              >
                <Check className="h-5 w-5" />
              </motion.span>
            ) : (
              <motion.span key="plus" initial={false} animate={hoverAdd ? { scale: 1.05 } : { scale: 1 }}>
                <Plus className="h-5 w-5" />
              </motion.span>
            )}
          </AnimatePresence>
          {/* subtle glow under icon on hover */}
          <motion.span
            aria-hidden
            className="absolute -z-10 size-6 rounded-full bg-primary/20"
            initial={false}
            animate={hoverAdd ? { scale: 1.4, opacity: 1 } : { scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
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
    </motion.div>
  );
}

export default ProductCard;


