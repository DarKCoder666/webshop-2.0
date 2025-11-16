"use client";

import React from "react";
import { EditableText } from "@/components/builder/editable-text";
import { RenderableText } from "@/components/builder/renderable-text";
import { useBuilder } from "@/components/builder/builder-context";
import { RichText } from "@/lib/builder-types";
import { getRichTextContent } from "@/lib/text-utils";
import { Carousel, CarouselContent, CarouselItem, CarouselNavigation } from "@/components/motion-primitives/carousel";

type Review = { name: string | RichText; text: string | RichText };

export type Testimonials3Props = {
  title?: string | RichText;
  subtitle?: string | RichText;
  reviews?: Review[];
  r1Name?: string | RichText; r1Text?: string | RichText;
  r2Name?: string | RichText; r2Text?: string | RichText;
  r3Name?: string | RichText; r3Text?: string | RichText;
  blockId?: string;
};

export default function Testimonials3(props: Testimonials3Props) {
  const { isBuilder, updateBlockText } = useBuilder();
  const { blockId, title, subtitle, reviews } = props;
  // Prefer array-based reviews from dialog; otherwise derive from legacy flat fields
  const base: Review[] = (Array.isArray(reviews) && reviews.length)
    ? reviews
    : (() => {
        const out: Review[] = [];
        for (let i = 1; i <= 8; i++) {
          const name = (props as Record<string, unknown>)[`r${i}Name`] as string | RichText | undefined;
          const text = (props as Record<string, unknown>)[`r${i}Text`] as string | RichText | undefined;
          if (name || text) {
            out.push({ name: name || "", text: text || "" });
          }
        }
        return out;
      })();

  // Using shared Carousel component; manual controls only (no drag, no autoplay)

  return (
    <section className="py-24 md:py-28">
      <div className="container mx-auto px-4 md:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          {isBuilder ? (
            <EditableText
              key={`title-${blockId}`}
              blockId={blockId || ""}
              fieldKey="title"
              onSave={updateBlockText}
              isBuilder
              as="h2"
              className="text-4xl font-extrabold tracking-tight md:text-5xl"
            >
              {title as any}
            </EditableText>
          ) : (
            <RenderableText
              content={title || { en: "Why Clients Love Us" }}
              as="h2"
              per="char"
              preset="fade-in-blur"
              className="text-4xl font-extrabold tracking-tight md:text-5xl"
            />
          )}

          {isBuilder ? (
            <EditableText
              key={`subtitle-${blockId}`}
              blockId={blockId || ""}
              fieldKey="subtitle"
              onSave={updateBlockText}
              isBuilder
              as="p"
              className="mt-2 text-muted-foreground"
            >
              {subtitle as any}
            </EditableText>
          ) : (
            <RenderableText
              content={subtitle || { en: "Discover how customers use our products to build their businesses" }}
              as="p"
              per="word"
              preset="fade"
              className="mt-2 text-muted-foreground"
            />
          )}
        </div>

        <div className="mt-10 relative w-full px-1">
          <Carousel disableDrag autoplay={false} infinite={false}>
            <CarouselContent className="-ml-3 items-start">
              {base.map((r, i) => (
                <CarouselItem key={i} className="basis-full md:basis-1/2 lg:basis-1/3 pl-3">
                  <div className="h-full rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
                    <p className="text-lg md:text-xl leading-relaxed">
                      {getRichTextContent(r.text)}
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {getRichTextContent(r.name).slice(0, 2).toUpperCase()}
                      </div>
                      <div className="text-sm font-semibold">{getRichTextContent(r.name)}</div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselNavigation className="absolute top-0 left-0 w-full -translate-y-12 justify-end gap-2" alwaysShow />
          </Carousel>
        </div>
      </div>
    </section>
  );
}


