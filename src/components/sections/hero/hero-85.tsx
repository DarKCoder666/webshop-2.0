"use client";

import React from "react";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { ImageItem } from "@/components/sections/hero/hero-210";
import { AutoScroll } from "@/components/motion-primitives/auto-scroll";
import { ImageManagerDialog, EmptyImageState, type ImageData } from "@/components/image-manager-dialog";
import { EditableText } from "@/components/builder/editable-text";
import { EditableButton } from "@/components/builder/editable-button";
import { useBuilder } from "@/components/builder/builder-context";
import { RenderableText } from "@/components/builder/renderable-text";
import { RenderableButton } from "@/components/builder/renderable-button";
import { RichText, RichButton } from "@/lib/builder-types";
import { getRichTextContent, getRichTextStyle } from "@/lib/text-utils";

export type Hero85Props = {
  badgeText?: string | RichText;
  title?: string | RichText;
  description?: string | RichText;
  primaryCtaLabel?: string | RichButton;
  secondaryCtaLabel?: string | RichButton;
  images?: ImageItem[];
  blockId?: string;
};

export default function Hero85({
  badgeText,
  title,
  description,
  primaryCtaLabel = { ru: "Начать бесплатно", en: "Start for free", uz: "Bepul boshlash", href: "/catalog" },
  secondaryCtaLabel = { ru: "Запланировать демо", en: "Schedule a demo", uz: "Demo so'rash", href: "/catalog" },
  images,
  blockId,
}: Hero85Props) {
  const { isBuilder, updateBlockText, updateBlockProps } = useBuilder();

  // Convert ImageManager selection to ImageItem format
  const handleImageSelection = (selectedImages: ImageData[]) => {
    const convertedImages: ImageItem[] = selectedImages.map(img => ({
      src: img.url,
      alt: img.name,
      name: img.name,
      _id: img._id
    }));
    
    updateBlockProps?.(blockId || "", { images: convertedImages });
  };
  const expandedImages = React.useMemo(() => {
    const base = images ?? [];
    if (base.length === 0) return [] as ImageItem[];
    const duplicated: ImageItem[] = [...base];
    while (duplicated.length < 12) {
      duplicated.push(...base);
    }
    return duplicated.slice(0, 12);
  }, [images]);
  return (
    <section className="py-0 md:py-16">
      <div className="container mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="mx-auto w-full max-w-xl">
            {/* Badge removed as requested */}
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
                  {title as any}
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
                  {description as any}
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
                    <EditableButton
                      key={`primaryCtaLabel-${blockId}`}
                      blockId={blockId || ""}
                      fieldKey="primaryCtaLabel"
                      content={primaryCtaLabel as any}
                      onSave={updateBlockText}
                      isBuilder={isBuilder}
                      className="w-full gap-2 sm:w-auto"
                      placeholder="Primary button..."
                      style={{ 
                        variant: "default",
                        size: "lg",
                        ...(typeof primaryCtaLabel === 'object' ? primaryCtaLabel?.style : {})
                      }}
                      href={typeof primaryCtaLabel === 'object' ? primaryCtaLabel?.href : undefined}
                    >
                      {getRichTextContent(primaryCtaLabel)}
                    </EditableButton>
                  ) : (
                    <RenderableButton 
                      content={primaryCtaLabel}
                      className="w-full gap-2 sm:w-auto"
                      variant="default"
                      size="lg"
                    />
                  )
                )}
                {(secondaryCtaLabel || isBuilder) && (
                  isBuilder ? (
                    <EditableButton
                      key={`secondaryCtaLabel-${blockId}`}
                      blockId={blockId || ""}
                      fieldKey="secondaryCtaLabel"
                      content={secondaryCtaLabel as any}
                      onSave={updateBlockText}
                      isBuilder={isBuilder}
                      className="w-full gap-2 sm:w-auto"
                      placeholder="Secondary button..."
                      style={{ 
                        variant: "outline",
                        size: "lg",
                        ...(typeof secondaryCtaLabel === 'object' ? secondaryCtaLabel?.style : {})
                      }}
                      href={typeof secondaryCtaLabel === 'object' ? secondaryCtaLabel?.href : undefined}
                    >
                      {getRichTextContent(secondaryCtaLabel)}
                    </EditableButton>
                  ) : (
                    <RenderableButton 
                      content={secondaryCtaLabel}
                      className="w-full gap-2 sm:w-auto"
                      variant="outline"
                      size="lg"
                    />
                  )
                )}
              </AnimatedGroup>
            )}
          </div>

          {isBuilder ? (
            <ImageManagerDialog
              maxImages={12}
              initialSelectedImages={images?.map(img => ({
                id: img._id || img.src,
                _id: img._id,
                url: img.src,
                name: img.name,
                size: 0
              })) || []}
              onSelectionChange={handleImageSelection}
              className="w-full"
            >
              {expandedImages.length > 0 ? (
                <>
                  <div key={`mobile-imgs-${expandedImages.map(i => i.src).join('|').slice(0, 50)}`} className="flex flex-col gap-4 lg:hidden w-screen -ml-6 overflow-hidden">
                    <div className="overflow-hidden">
                      <AutoScroll direction="horizontal" durationSec={28} className="w-full" contentClassName="gap-4 pl-6">
                        {expandedImages.slice(0, 6).map((img, idx) => (
                          <div key={`m-row1-${idx}`} className="w-72 shrink-0">
                            <img src={img.src} alt={img.alt} className="h-48 w-full rounded-2xl object-cover" />
                          </div>
                        ))}
                      </AutoScroll>
                    </div>
                    <div className="overflow-hidden">
                      <AutoScroll direction="horizontal" reverse durationSec={28} className="w-full" contentClassName="gap-4 pl-6">
                        {expandedImages.slice(3, 9).map((img, idx) => (
                          <div key={`m-row2-${idx}`} className="w-72 shrink-0">
                            <img src={img.src} alt={img.alt} className="h-48 w-full rounded-2xl object-cover" />
                          </div>
                        ))}
                      </AutoScroll>
                    </div>
                  </div>

                  <div key={`desktop-imgs-${expandedImages.map(i => i.src).join('|').slice(0, 50)}`} className="hidden grid-cols-2 gap-4 lg:grid">
                    <AutoScroll direction="vertical" durationSec={48} className="h-[600px]" contentClassName="gap-4">
                      {expandedImages.slice(0, 6).map((img, idx) => (
                        <div key={`d-col1-${idx}`} className="h-[292px] w-full">
                          <img src={img.src} alt={img.alt} className="h-full w-full rounded-3xl object-cover" />
                        </div>
                      ))}
                    </AutoScroll>
                    <AutoScroll direction="vertical" reverse durationSec={48} className="h-[600px]" contentClassName="gap-4">
                      {expandedImages.slice(3, 9).map((img, idx) => (
                        <div key={`d-col2-${idx}`} className="h-[292px] w-full">
                          <img src={img.src} alt={img.alt} className="h-full w-full rounded-3xl object-cover" />
                        </div>
                      ))}
                    </AutoScroll>
                  </div>
                </>
              ) : (
                <div className="h-96">
                  <EmptyImageState onOpenManager={() => {}} />
                </div>
              )}
            </ImageManagerDialog>
          ) : expandedImages.length > 0 && (
            <>
              <div key={`mobile-imgs-${expandedImages.map(i => i.src).join('|').slice(0, 50)}`} className="flex flex-col gap-4 lg:hidden w-screen -ml-6 overflow-hidden">
                <div className="overflow-hidden">
                  <AutoScroll direction="horizontal" durationSec={28} className="w-full" contentClassName="gap-4 pl-6">
                    {expandedImages.slice(0, 6).map((img, idx) => (
                      <div key={`m-row1-${idx}`} className="w-72 shrink-0">
                        <img src={img.src} alt={img.alt} className="h-48 w-full rounded-2xl object-cover" />
                      </div>
                    ))}
                  </AutoScroll>
                </div>
                <div className="overflow-hidden">
                  <AutoScroll direction="horizontal" reverse durationSec={28} className="w-full" contentClassName="gap-4 pl-6">
                    {expandedImages.slice(3, 9).map((img, idx) => (
                      <div key={`m-row2-${idx}`} className="w-72 shrink-0">
                        <img src={img.src} alt={img.alt} className="h-48 w-full rounded-2xl object-cover" />
                      </div>
                    ))}
                  </AutoScroll>
                </div>
              </div>

              <div key={`desktop-imgs-${expandedImages.map(i => i.src).join('|').slice(0, 50)}`} className="hidden grid-cols-2 gap-4 lg:grid">
                <AutoScroll direction="vertical" durationSec={48} className="h-[600px]" contentClassName="gap-4">
                  {expandedImages.slice(0, 6).map((img, idx) => (
                    <div key={`d-col1-${idx}`} className="h-[292px] w-full">
                      <img src={img.src} alt={img.alt} className="h-full w-full rounded-3xl object-cover" />
                    </div>
                  ))}
                </AutoScroll>
                <AutoScroll direction="vertical" reverse durationSec={48} className="h-[600px]" contentClassName="gap-4">
                  {expandedImages.slice(3, 9).map((img, idx) => (
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


