"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { ImageItem } from "@/components/hero-210";
import { AutoScroll } from "@/components/motion-primitives/auto-scroll";
import { EditableText } from "@/components/builder/editable-text";
import { useBuilder } from "@/components/builder/builder-context";
import { RenderableText } from "@/components/builder/renderable-text";
import { RichText } from "@/lib/builder-types";
import { getRichTextContent, getRichTextStyle } from "@/lib/text-utils";

export type Hero85Props = {
  badgeText?: string | RichText;
  title?: string | RichText;
  description?: string | RichText;
  primaryCtaLabel?: string | RichText;
  secondaryCtaLabel?: string | RichText;
  images?: ImageItem[];
  blockId?: string;
};

export default function Hero85({
  badgeText,
  title,
  description,
  primaryCtaLabel,
  secondaryCtaLabel,
  images,
  blockId,
}: Hero85Props) {
  const { isBuilder, updateBlockText } = useBuilder();
  return (
    <section className="py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="mx-auto w-full max-w-xl">
            {(badgeText || isBuilder) && (
              <div key={`badge-${getRichTextContent(badgeText)}`} className="flex w-fit items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-medium">
                {isBuilder ? (
                  <EditableText
                    key={`badgeText-${blockId}`}
                    blockId={blockId || ""}
                    fieldKey="badgeText"
                    onSave={updateBlockText}
                    isBuilder={isBuilder}
                    as="span"
                    className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                    placeholder="Badge text..."
                    style={getRichTextStyle(badgeText)}
                  >
                    {getRichTextContent(badgeText)}
                  </EditableText>
                ) : (
                  <span 
                    className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                    style={getRichTextStyle(badgeText)}
                  >
                    {getRichTextContent(badgeText)}
                  </span>
                )}
                <span className="text-muted-foreground">Solutions for new businesses</span>
              </div>
            )}
            {(title || isBuilder) && (
              isBuilder ? (
                <EditableText
                  key={`title-${blockId}`}
                  blockId={blockId || ""}
                  fieldKey="title"
                  onSave={updateBlockText}
                  isBuilder={isBuilder}
                  as="h1"
                  className="mt-10 mb-4 text-3xl font-semibold lg:text-5xl"
                  placeholder="Enter title..."
                  style={getRichTextStyle(title)}
                >
                  {getRichTextContent(title)}
                </EditableText>
              ) : (
                <RenderableText
                  content={title}
                  as="h1"
                  per="word"
                  preset="fade"
                  className="mt-10 mb-4 text-3xl font-semibold lg:text-5xl"
                />
              )
            )}
            {(description || isBuilder) && (
              isBuilder ? (
                <EditableText
                  key={`description-${blockId}`}
                  blockId={blockId || ""}
                  fieldKey="description"
                  onSave={updateBlockText}
                  isBuilder={isBuilder}
                  as="p"
                  className="mx-auto text-muted-foreground md:text-lg"
                  placeholder="Enter description..."
                  style={getRichTextStyle(description)}
                >
                  {getRichTextContent(description)}
                </EditableText>
              ) : (
                <RenderableText
                  content={description}
                  as="p"
                  per="word"
                  preset="fade"
                  className="mx-auto text-muted-foreground md:text-lg"
                />
              )
            )}
            {(primaryCtaLabel || secondaryCtaLabel || isBuilder) && (
              <AnimatedGroup preset="slide" className="mt-10 flex flex-col gap-2 sm:flex-row">
                {(primaryCtaLabel || isBuilder) && (
                  isBuilder ? (
                    <EditableText
                      key={`primaryCtaLabel-${blockId}`}
                      blockId={blockId || ""}
                      fieldKey="primaryCtaLabel"
                      onSave={updateBlockText}
                      isBuilder={isBuilder}
                      as="span"
                      className="w-full gap-2 sm:w-auto h-11 px-6 rounded-lg bg-primary text-primary-foreground font-semibold cursor-pointer hover:bg-primary/90 transition-colors inline-flex items-center justify-center"
                      placeholder="Primary button..."
                      style={getRichTextStyle(primaryCtaLabel)}
                    >
                      {getRichTextContent(primaryCtaLabel)}
                    </EditableText>
                  ) : (
                    <Button 
                      key={`primary-${getRichTextContent(primaryCtaLabel)}`} 
                      size="lg" 
                      className="w-full gap-2 sm:w-auto"
                      style={getRichTextStyle(primaryCtaLabel)}
                    >
                      {getRichTextContent(primaryCtaLabel)}
                    </Button>
                  )
                )}
                {(secondaryCtaLabel || isBuilder) && (
                  isBuilder ? (
                    <EditableText
                      key={`secondaryCtaLabel-${blockId}`}
                      blockId={blockId || ""}
                      fieldKey="secondaryCtaLabel"
                      onSave={updateBlockText}
                      isBuilder={isBuilder}
                      as="span"
                      className="w-full gap-2 sm:w-auto h-11 px-6 rounded-lg border border-border bg-card text-card-foreground font-semibold cursor-pointer hover:bg-muted transition-colors inline-flex items-center justify-center"
                      placeholder="Secondary button..."
                      style={getRichTextStyle(secondaryCtaLabel)}
                    >
                      {getRichTextContent(secondaryCtaLabel)}
                    </EditableText>
                  ) : (
                    <Button 
                      key={`secondary-${getRichTextContent(secondaryCtaLabel)}`} 
                      variant="outline" 
                      size="lg" 
                      className="w-full gap-2 sm:w-auto"
                      style={getRichTextStyle(secondaryCtaLabel)}
                    >
                      {getRichTextContent(secondaryCtaLabel)}
                    </Button>
                  )
                )}
              </AnimatedGroup>
            )}
          </div>

          {images && images.length > 0 && (
            <>
              <div key={`mobile-imgs-${images.map(i => i.src).join('|').slice(0, 50)}`} className="flex flex-col gap-4 lg:hidden w-screen -ml-6 overflow-hidden">
                <div className="overflow-hidden">
                  <AutoScroll direction="horizontal" durationSec={28} className="w-full" contentClassName="gap-4 pl-6">
                    {images.slice(0, 6).map((img, idx) => (
                      <div key={`m-row1-${idx}`} className="w-72 shrink-0">
                        <img src={img.src} alt={img.alt} className="h-48 w-full rounded-2xl object-cover" />
                      </div>
                    ))}
                  </AutoScroll>
                </div>
                <div className="overflow-hidden">
                  <AutoScroll direction="horizontal" reverse durationSec={28} className="w-full" contentClassName="gap-4 pl-6">
                    {images.slice(3, 9).map((img, idx) => (
                      <div key={`m-row2-${idx}`} className="w-72 shrink-0">
                        <img src={img.src} alt={img.alt} className="h-48 w-full rounded-2xl object-cover" />
                      </div>
                    ))}
                  </AutoScroll>
                </div>
              </div>

              <div key={`desktop-imgs-${images.map(i => i.src).join('|').slice(0, 50)}`} className="hidden grid-cols-2 gap-4 lg:grid">
                <AutoScroll direction="vertical" durationSec={48} className="h-[600px]" contentClassName="gap-4">
                  {images.slice(0, 6).map((img, idx) => (
                    <div key={`d-col1-${idx}`} className="h-[292px] w-full">
                      <img src={img.src} alt={img.alt} className="h-full w-full rounded-3xl object-cover" />
                    </div>
                  ))}
                </AutoScroll>
                <AutoScroll direction="vertical" reverse durationSec={48} className="h-[600px]" contentClassName="gap-4">
                  {images.slice(3, 9).map((img, idx) => (
                    <div key={`d-col2-${idx}`} className="h-[292px] w-full">
                      <img src={img.src} alt={img.alt} className="h-full w-full rounded-3xl object-cover" />
                    </div>
                  ))}
                </AutoScroll>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}


