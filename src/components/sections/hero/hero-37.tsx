"use client";

import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { cn } from "@/lib/utils";
import React from "react";
import Image from "next/image";
import { ImageItem } from "@/components/sections/hero/hero-210";
import { motion, useScroll, useTransform } from "motion/react";
import { ImageManagerDialog, EmptyImageState, type ImageData } from "@/components/image-manager-dialog";
import { EditableText } from "@/components/builder/editable-text";
import { EditableButton } from "@/components/builder/editable-button";
import { useBuilder } from "@/components/builder/builder-context";
import { RenderableText } from "@/components/builder/renderable-text";
import { RenderableButton } from "@/components/builder/renderable-button";
import { RichText, RichButton } from "@/lib/builder-types";
import { getRichTextContent, getRichTextStyle } from "@/lib/text-utils";

export type Hero37Props = {
  badge?: string | RichText;
  title?: string | RichText;
  description?: string | RichText;
  primaryCta?: string | RichButton;
  secondaryCta?: string | RichButton;
  className?: string;
  images?: ImageItem[];
  blockId?: string;
};

export default function Hero37({
  badge,
  title,
  description,
  primaryCta,
  secondaryCta,
  className,
  images,
  blockId,
}: Hero37Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);
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
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  // Move side images toward center as user scrolls
  const leftX = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const rightX = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section className={cn("relative overflow-hidden", className)}>
      {/* Subtle background accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-zinc-100/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 opacity-60 [mask-image:linear-gradient(to_top,black,transparent)] bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08)_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-0 md:py-16 text-center">
        {/* Badge */}
        {(badge || isBuilder) && (
          isBuilder ? (
            <EditableText
              key={`badge-${blockId}`}
              blockId={blockId || ""}
              fieldKey="badge"
              onSave={updateBlockText}
              isBuilder={isBuilder}
              as="p"
              className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
              placeholder="Enter badge..."
              style={getRichTextStyle(badge)}
            >
              {badge as any}
            </EditableText>
          ) : (
            <RenderableText
              content={badge}
              as="p"
              per="word"
              preset="fade"
              className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            />
          )
        )}

        {/* Title */}
        {(title || isBuilder) && (
          isBuilder ? (
            <EditableText
              key={`title-${blockId}`}
              blockId={blockId || ""}
              fieldKey="title"
              onSave={updateBlockText}
              isBuilder={isBuilder}
              as="h1"
              className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl"
              placeholder="Enter title..."
              style={getRichTextStyle(title)}
            >
              {title as any}
            </EditableText>
          ) : (
            <RenderableText
              content={title}
              as="h1"
              per="char"
              preset="fade-in-blur"
              speedReveal={0.7}
              speedSegment={0.9}
              className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl"
            />
          )
        )}

        {/* Description */}
        {(description || isBuilder) && (
          isBuilder ? (
            <EditableText
              key={`description-${blockId}`}
              blockId={blockId || ""}
              fieldKey="description"
              onSave={updateBlockText}
              isBuilder={isBuilder}
              as="p"
              className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg"
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
              delay={0.3}
              className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg"
            />
          )
        )}

        {/* Actions */}
        <AnimatedGroup preset="slide" className="mt-6 flex items-center justify-center gap-3">
          {(primaryCta || isBuilder) && (
            isBuilder ? (
              <EditableButton
                key={`primaryCta-${blockId}`}
                blockId={blockId || ""}
                fieldKey="primaryCta"
                content={primaryCta as any}
                onSave={updateBlockText}
                isBuilder={isBuilder}
                className="h-10 rounded-lg px-4 text-sm font-medium"
                placeholder="Primary button text..."
                style={{ 
                  variant: "default", 
                  size: "default",
                  ...(typeof primaryCta === 'object' ? primaryCta?.style : {})
                }}
                href={typeof primaryCta === 'object' ? primaryCta?.href : undefined}
              >
                {getRichTextContent(primaryCta)}
              </EditableButton>
            ) : (
              <RenderableButton
                content={primaryCta}
                className="h-10 rounded-lg px-4 text-sm font-medium"
                variant="default"
                size="default"
              />
            )
          )}
          {(secondaryCta || isBuilder) && (
            isBuilder ? (
              <EditableButton
                key={`secondaryCta-${blockId}`}
                blockId={blockId || ""}
                fieldKey="secondaryCta"
                content={secondaryCta as any}
                onSave={updateBlockText}
                isBuilder={isBuilder}
                className="h-10 rounded-lg px-4 text-sm font-medium"
                placeholder="Secondary button text..."
                style={{ 
                  variant: "outline", 
                  size: "default",
                  ...(typeof secondaryCta === 'object' ? secondaryCta?.style : {})
                }}
                href={typeof secondaryCta === 'object' ? secondaryCta?.href : undefined}
              >
                {getRichTextContent(secondaryCta)}
              </EditableButton>
            ) : (
              <RenderableButton
                content={secondaryCta}
                className="h-10 rounded-lg px-4 text-sm font-medium"
                variant="outline"
                size="default"
              />
            )
          )}
        </AnimatedGroup>

        {/* 3:4 vertical image cards from hero-210 */}
        <div ref={containerRef}>
          {isBuilder ? (
            <ImageManagerDialog
              maxImages={3}
              initialSelectedImages={images?.map(img => ({
                id: img._id || img.src,
                _id: img._id,
                url: img.src,
                name: img.name,
                size: 0
              })) || []}
              onSelectionChange={handleImageSelection}
              className="relative mx-auto mt-20 max-w-5xl"
            >
              {images && images.length >= 3 ? (
                <AnimatedGroup preset="zoom" className="flex items-end justify-center -space-x-8 md:-space-x-12">
                  {[images[0], images[1], images[2]].map((img, i) => (
                    <motion.div
                      key={i}
                      className={cn(
                        "relative aspect-[3/4] overflow-hidden rounded-3xl bg-transparent shadow-xl",
                        // side cards
                        i !== 1 && "w-48 sm:w-64 md:w-72",
                        // center card slightly larger
                        i === 1 && "w-56 sm:w-72 md:w-80",
                        i === 0 && "-rotate-3 translate-y-6 z-0",
                        i === 1 && "z-10",
                        i === 2 && "rotate-3 translate-y-8 z-0"
                      )}
                      style={{
                        x: i === 0 ? leftX : i === 2 ? rightX : 0
                      }}
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 320px"
                        className="object-cover"
                        priority={i === 1}
                      />
                    </motion.div>
                  ))}
                </AnimatedGroup>
              ) : (
                <div className="h-96">
                  <EmptyImageState onOpenManager={() => {}} />
                </div>
              )}
            </ImageManagerDialog>
          ) : images && images.length >= 3 ? (
            <AnimatedGroup preset="zoom" className="relative mx-auto mt-20 flex max-w-5xl items-end justify-center -space-x-8 md:-space-x-12">
              {[images[0], images[1], images[2]].map((img, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "relative aspect-[3/4] overflow-hidden rounded-3xl bg-transparent shadow-xl",
                    // side cards
                    i !== 1 && "w-48 sm:w-64 md:w-72",
                    // center card slightly larger
                    i === 1 && "w-56 sm:w-72 md:w-80",
                    i === 0 && "-rotate-3 translate-y-6 z-0",
                    i === 1 && "z-10",
                    i === 2 && "rotate-3 translate-y-8 z-0"
                  )}
                  style={{
                    x: i === 0 ? leftX : i === 2 ? rightX : 0
                  }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 320px"
                    className="object-cover"
                    priority={i === 1}
                  />
                </motion.div>
              ))}
            </AnimatedGroup>
          ) : null}
        </div>
      </div>
    </section>
  );
}


