"use client";

import React from "react";
import { RichText } from "@/lib/builder-types";
import { getRichTextContent } from "@/lib/text-utils";
import { EditableText } from "@/components/builder/editable-text";
import { RenderableText } from "@/components/builder/renderable-text";
import { useBuilder } from "@/components/builder/builder-context";

type Review = {
  name: string | RichText;
  text: string | RichText;
};

export type Testimonials2Props = {
  title?: string | RichText;
  subtitle?: string | RichText;
  reviews?: Review[];
  // flat fallbacks for settings dialog compatibility
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

export default function Testimonials2(props: Testimonials2Props) {
  const { isBuilder, updateBlockText } = useBuilder();
  const { title, subtitle, reviews, blockId } = props;

  const base: Review[] = (Array.isArray(reviews) && reviews.length)
    ? reviews
    : (() => {
        const out: Review[] = [];
        for (let i = 1; i <= 8; i++) {
          const name = (props as Record<string, unknown>)[`r${i}Name`] as string | RichText | undefined;
          const text = (props as Record<string, unknown>)[`r${i}Text`] as string | RichText | undefined;
          if (name || text) out.push({ name: name || "", text: text || "" });
        }
        return out;
      })();

  return (
    <section className="py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
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
              {getRichTextContent(title) || "What our clients say"}
            </EditableText>
          ) : (
            <RenderableText
              content={title || "What our clients say"}
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
              {getRichTextContent(subtitle) || "Discover how customers are using our products to build their businesses"}
            </EditableText>
          ) : (
            <p className="mt-2 text-muted-foreground">{getRichTextContent(subtitle) || "Discover how customers are using our products to build their businesses"}</p>
          )}
        </div>

        {/* Masonry/Bento layout using CSS columns */}
        <div className="relative mt-10">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
            {base.map((r, i) => (
              <div key={i} className="mb-4 break-inside-avoid">
                <div className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {getRichTextContent(r.name).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="leading-tight text-sm font-semibold">{getRichTextContent(r.name)}</div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{getRichTextContent(r.text)}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Bottom fade gradient */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>
    </section>
  );
}


