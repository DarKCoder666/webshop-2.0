"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { EditableText } from "@/components/builder/editable-text";
import { EditableButton } from "@/components/builder/editable-button";
import { useBuilder } from "@/components/builder/builder-context";
import { RenderableText } from "@/components/builder/renderable-text";
import { RenderableButton } from "@/components/builder/renderable-button";
import { ImageManagerDialog, EmptyImageState, type ImageData } from "@/components/image-manager-dialog";
import { RichText, RichButton } from "@/lib/builder-types";
import { getRichTextContent, getRichTextStyle } from "@/lib/text-utils";

export type TextWithImageProps = {
  title?: string | RichText;
  paragraph?: string | RichText;
  cta?: string | RichButton;
  image?: { src: string; alt?: string; _id?: string; name?: string } | null;
  imagePosition?: 'left' | 'right';
  className?: string;
  blockId?: string;
};

export default function TextWithImage({
  title,
  paragraph,
  cta,
  image,
  imagePosition = 'right',
  className,
  blockId,
}: TextWithImageProps) {
  const { isBuilder, updateBlockText, updateBlockProps } = useBuilder();

  const handleImageSelection = (selected: ImageData[]) => {
    const first = selected[0];
    const next = first
      ? { src: first.url, alt: first.name, _id: first._id, name: first.name }
      : null;
    updateBlockProps?.(blockId || "", { image: next });
  };

  const imageEl = (
    <div className={cn("relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted")}> 
      {image ? (
        <Image src={image.src} alt={image.alt || ""} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
      ) : (
        isBuilder ? (
          <EmptyImageState onOpenManager={() => {}} />
        ) : null
      )}
    </div>
  );

  return (
    <section className={cn("relative", className)}>
      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-24">
        <div className={cn("grid grid-cols-1 items-center gap-10 md:grid-cols-2", imagePosition === 'left' ? 'md:[&>div:first-child]:order-1' : '')}>
          {/* Text column */}
          <div>
            {(title || isBuilder) && (
              isBuilder ? (
                <EditableText
                  key={`title-${blockId}`}
                  blockId={blockId || ""}
                  fieldKey="title"
                  onSave={updateBlockText}
                  isBuilder={isBuilder}
                  as="h3"
                  className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                  placeholder="Title..."
                  style={getRichTextStyle(title)}
                >
                  {title as any}
                </EditableText>
              ) : (
                <RenderableText content={title} as="h3" per="char" preset="fade-in-blur" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl" />
              )
            )}

            {(paragraph || isBuilder) && (
              isBuilder ? (
                <EditableText
                  key={`paragraph-${blockId}`}
                  blockId={blockId || ""}
                  fieldKey="paragraph"
                  onSave={updateBlockText}
                  isBuilder={isBuilder}
                  as="p"
                  className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg"
                  placeholder="Supporting paragraph..."
                  style={getRichTextStyle(paragraph)}
                >
                  {paragraph as any}
                </EditableText>
              ) : (
                <RenderableText content={paragraph} as="p" per="word" preset="fade" className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg" />
              )
            )}

            {(cta || isBuilder) && (
              isBuilder ? (
                <EditableButton
                  key={`cta-${blockId}`}
                  blockId={blockId || ""}
                  fieldKey="cta"
                  content={cta as any}
                  onSave={updateBlockText}
                  isBuilder={isBuilder}
                  className="mt-6 h-10 rounded-lg px-4 text-sm font-medium"
                  placeholder="Call to action..."
                  style={{ variant: "default", size: "default", ...(typeof cta === 'object' ? (cta as any)?.style : {}) }}
                  href={typeof cta === 'object' ? (cta as any)?.href : undefined}
                >
                  {getRichTextContent(cta)}
                </EditableButton>
              ) : (
                <RenderableButton content={cta} className="mt-6 h-10 rounded-lg px-4 text-sm font-medium" variant="default" size="default" />
              )
            )}
          </div>

          {/* Image column with dialog */}
          <ImageManagerDialog
            maxImages={1}
            initialSelectedImages={image ? [{ id: image._id || image.src, _id: image._id, url: image.src, name: image.name || image.alt || 'Image', size: 0 }] : []}
            onSelectionChange={handleImageSelection}
            className="relative"
          >
            {imageEl}
          </ImageManagerDialog>
        </div>
      </div>
    </section>
  );
}


