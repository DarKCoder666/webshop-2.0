"use client";

import React from "react";
import { motion } from "motion/react";
import ProductCard, { ProductCardData } from "@/components/product-card";
import { renderProductCardVariant, ProductCardVariant } from "@/components/product-card-variants";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { EditableText } from "@/components/builder/editable-text";
import { useBuilder } from "@/components/builder/builder-context";
import { RenderableText } from "@/components/builder/renderable-text";
import { RichText } from "@/lib/builder-types";
import { getRichTextContent, getRichTextStyle } from "@/lib/text-utils";

export type ProductsListProps = {
  title?: string | RichText;
  subtitle?: string | RichText;
  itemsToShow?: number;
  itemsPerRow?: number; // desktop only
  cardVariant?: ProductCardVariant;
  imageAspect?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  products?: ProductCardData[];
  blockId?: string;
};

export default function ProductsList({
  title = { text: "Best Sellers" },
  subtitle = { text: "Discover our most-loved items" },
  itemsToShow = 6,
  itemsPerRow = 3,
  products = [],
  cardVariant = "v1",
  imageAspect = '4:3',
  blockId,
}: ProductsListProps) {
  const { isBuilder, updateBlockText } = useBuilder();
  const visible = products.slice(0, Math.max(0, itemsToShow || 0));
  const gridCols = () => {
    const n = Math.min(5, Math.max(2, Number(itemsPerRow ?? 3)));
    // map to tailwind classes for lg breakpoint
    switch (n) {
      case 2:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2";
      case 3:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
      case 5:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5";
      default:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }
  };

  return (
    <section className="container mx-auto px-6 md:px-10 lg:px-16 py-16">
      <div className="mb-10 flex flex-col items-center text-center">
        {(title || isBuilder) && (
          isBuilder ? (
            <EditableText
              key={`pl-title-${blockId}`}
              blockId={blockId || ""}
              fieldKey="title"
              onSave={updateBlockText}
              isBuilder={isBuilder}
              as="h2"
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
              placeholder="Enter title..."
              style={getRichTextStyle(title)}
            >
              {getRichTextContent(title)}
            </EditableText>
          ) : (
            <RenderableText
              content={title}
              as="h2"
              per="word"
              preset="fade-in-blur"
              speedReveal={1}
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
              fallback="Our Products"
            />
          )
        )}

        {(subtitle || isBuilder) && (
          isBuilder ? (
            <EditableText
              key={`pl-subtitle-${blockId}`}
              blockId={blockId || ""}
              fieldKey="subtitle"
              onSave={updateBlockText}
              isBuilder={isBuilder}
              as="p"
              className="mt-3 max-w-2xl text-muted-foreground"
              placeholder="Enter description..."
              style={getRichTextStyle(subtitle)}
            >
              {getRichTextContent(subtitle)}
            </EditableText>
          ) : (
            <RenderableText
              content={subtitle}
              as="p"
              per="word"
              preset="fade"
              delay={0.1}
              className="mt-3 max-w-2xl text-muted-foreground"
            />
          )
        )}
      </div>

      <div className={`${gridCols()} gap-6 md:gap-8`}>
        {visible.map((p) => (
          cardVariant === "v1" ? (
            <ProductCard key={p.id} product={p} imageAspect={imageAspect} />
          ) : (
            <div key={p.id}>
              {renderProductCardVariant(cardVariant, { product: p, imageAspect })}
            </div>
          )
        ))}
      </div>
    </section>
  );
}


