"use client";

import React from "react";
import { AutoScroll } from "@/components/motion-primitives/auto-scroll";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { RenderableText } from "@/components/builder/renderable-text";
import { EditableText } from "@/components/builder/editable-text";
import { EditableButton } from "@/components/builder/editable-button";
import { RenderableButton } from "@/components/builder/renderable-button";
import { useBuilder } from "@/components/builder/builder-context";
import { RichText } from "@/lib/builder-types";
import { getRichTextContent, getRichTextStyle } from "@/lib/text-utils";
import { cn } from "@/lib/utils";

export type Testimonial = {
  name: string | RichText;
  text: string | RichText;
};

export type TestimonialsProps = {
  title?: string | RichText;
  subtitle?: string | RichText;
  ctaLabel?: string | RichText;
  reviews?: Testimonial[];
  // We keep flat editable fields in props for the builder's simple update flow
  r1Name?: string | RichText; r1Text?: string | RichText;
  r2Name?: string | RichText; r2Text?: string | RichText;
  r3Name?: string | RichText; r3Text?: string | RichText;
  r4Name?: string | RichText; r4Text?: string | RichText;
  r5Name?: string | RichText; r5Text?: string | RichText;
  r6Name?: string | RichText; r6Text?: string | RichText;
  r7Name?: string | RichText; r7Text?: string | RichText;
  r8Name?: string | RichText; r8Text?: string | RichText;
  blockId?: string;
};

function Card({ name, text, className }: { name: string | RichText; text: string | RichText; className?: string; }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm", className)}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          {getRichTextContent(name).slice(0, 2).toUpperCase()}
        </div>
        <div className="leading-tight text-sm font-semibold">{getRichTextContent(name)}</div>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{getRichTextContent(text)}</p>
    </div>
  );
}

export default function Testimonials(props: TestimonialsProps) {
  const {
    title, subtitle, ctaLabel,
    reviews,
    r1Name, r1Text,
    r2Name, r2Text,
    r3Name, r3Text,
    r4Name, r4Text,
    r5Name, r5Text,
    r6Name, r6Text,
    r7Name, r7Text,
    r8Name, r8Text,
    blockId,
  } = props;
  const { isBuilder, updateBlockText } = useBuilder();

  // Build base reviews from array or legacy flat keys
  const base: Testimonial[] = (Array.isArray(reviews) && reviews.length)
    ? reviews
    : (() => {
        const out: Testimonial[] = [];
        const pairs: Array<[string | RichText | undefined, string | RichText | undefined]> = [
          [r1Name, r1Text], [r2Name, r2Text], [r3Name, r3Text], [r4Name, r4Text],
          [r5Name, r5Text], [r6Name, r6Text], [r7Name, r7Text], [r8Name, r8Text],
        ];
        for (const [n, t] of pairs) {
          if (n || t) out.push({ name: n || "", text: t || "" });
        }
        return out;
      })();

  // Ensure at least 4 per row by repeating items
  const ensureLength = (arr: Testimonial[], min: number) => {
    if (arr.length >= min) return arr;
    const out: Testimonial[] = [];
    for (let i = 0; i < min; i++) out.push(arr[i % Math.max(arr.length, 1)]);
    return out;
  };

  const row1 = ensureLength(base.slice(0, Math.ceil(base.length / 2)) || base, Math.min(10, Math.max(0, base.length)) || 0);
  const row2 = ensureLength(base.slice(Math.ceil(base.length / 2)) || base, Math.min(10, Math.max(0, base.length)) || 0);

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
              style={getRichTextStyle(title)}
            >
              {title as any}
            </EditableText>
          ) : (
            <RenderableText
              content={title || { en: "Meet our happy clients" }}
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
              style={getRichTextStyle(subtitle)}
            >
              {subtitle as any}
            </EditableText>
          ) : (
            <RenderableText
              content={subtitle || { en: "All of our 1000+ clients are happy" }}
              as="p"
              per="word"
              preset="fade"
              className="mt-2 text-muted-foreground"
            />
          )}
        </div>

        <div className="mt-10 space-y-6">
          {/* Full-bleed container */}
          <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
            {/* Row 1 moves to the right (reverse=true in AutoScroll) */}
            <AutoScroll direction="horizontal" reverse durationSec={28} className="w-full" contentClassName="gap-4 px-6 md:px-12">
              {row1.map((t, i) => (
                <div key={`r1-${i}`} className="w-[320px] shrink-0">
                  <Card name={t.name} text={t.text} />
                </div>
              ))}
            </AutoScroll>
          </div>

          <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
            {/* Row 2 moves to the left (reverse=false) */}
            <AutoScroll direction="horizontal" durationSec={28} className="w-full" contentClassName="gap-4 px-6 md:px-12">
              {row2.map((t, i) => (
                <div key={`r2-${i}`} className="w-[320px] shrink-0">
                  <Card name={t.name} text={t.text} />
                </div>
              ))}
            </AutoScroll>
          </div>
        </div>

        {(ctaLabel || isBuilder) && (
          <AnimatedGroup preset="slide" className="mt-8 flex justify-center">
            {isBuilder ? (
              <EditableButton
                key={`ctaLabel-${blockId}`}
                blockId={blockId || ""}
                fieldKey="ctaLabel"
                content={ctaLabel as any}
                onSave={updateBlockText}
                isBuilder
                className="h-10 rounded-lg px-4 text-sm font-medium"
                placeholder="CTA text..."
                style={{ variant: "default", size: "default" }}
              >
                {getRichTextContent(ctaLabel)}
              </EditableButton>
            ) : (
              <RenderableButton
                content={ctaLabel as any}
                className="h-10 rounded-lg px-4 text-sm font-medium"
                variant="default"
                size="default"
              />
            )}
          </AnimatedGroup>
        )}
      </div>
    </section>
  );
}


