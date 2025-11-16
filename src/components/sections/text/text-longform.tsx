"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { EditableText } from "@/components/builder/editable-text";
import { useBuilder } from "@/components/builder/builder-context";
import { RenderableText } from "@/components/builder/renderable-text";
import { RichText } from "@/lib/builder-types";
import { getRichTextStyle } from "@/lib/text-utils";

export type TextLongformProps = {
  kicker?: string | RichText;
  title?: string | RichText;
  prose?: string | RichText;
  aside?: string | RichText;
  className?: string;
  blockId?: string;
};

export default function TextLongform({
  kicker,
  title,
  prose,
  aside,
  className,
  blockId,
}: TextLongformProps) {
  const { isBuilder, updateBlockText } = useBuilder();

  return (
    <section className={cn("relative", className)}>
      <div className="container mx-auto px-4 md:px-10 lg:px-16 py-16 md:py-24">
        {(kicker || isBuilder) && (
          isBuilder ? (
            <EditableText
              key={`kicker-${blockId}`}
              blockId={blockId || ""}
              fieldKey="kicker"
              onSave={updateBlockText}
              isBuilder={isBuilder}
              as="p"
              className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary"
              placeholder="Section kicker..."
              style={getRichTextStyle(kicker)}
            >
              {kicker as any}
            </EditableText>
          ) : (
            <RenderableText
              content={kicker}
              as="p"
              per="word"
              preset="fade"
              className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary"
            />
          )
        )}

        {(title || isBuilder) && (
          isBuilder ? (
            <EditableText
              key={`title-${blockId}`}
              blockId={blockId || ""}
              fieldKey="title"
              onSave={updateBlockText}
              isBuilder={isBuilder}
              as="h3"
              className="max-w-4xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              placeholder="Longform title..."
              style={getRichTextStyle(title)}
            >
              {title as any}
            </EditableText>
          ) : (
            <RenderableText
              content={title}
              as="h3"
              per="char"
              preset="fade-in-blur"
              className="max-w-4xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            />
          )
        )}

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {(prose || isBuilder) && (
              isBuilder ? (
                <EditableText
                  key={`prose-${blockId}`}
                  blockId={blockId || ""}
                  fieldKey="prose"
                  onSave={updateBlockText}
                  isBuilder={isBuilder}
                  as="div"
                  className="prose prose-zinc max-w-none dark:prose-invert"
                  placeholder="Write longform content..."
                  style={getRichTextStyle(prose)}
                >
                  {prose as any}
                </EditableText>
              ) : (
                <RenderableText
                  content={prose}
                  as="div"
                  per="word"
                  preset="fade"
                  className="prose prose-zinc max-w-none dark:prose-invert"
                />
              )
            )}
          </div>
          <div>
            {(aside || isBuilder) && (
              isBuilder ? (
                <EditableText
                  key={`aside-${blockId}`}
                  blockId={blockId || ""}
                  fieldKey="aside"
                  onSave={updateBlockText}
                  isBuilder={isBuilder}
                  as="div"
                  className="rounded-xl border border-border bg-card/60 p-4 text-sm text-muted-foreground"
                  placeholder="Optional side notes..."
                  style={getRichTextStyle(aside)}
                >
                  {aside as any}
                </EditableText>
              ) : (
                <RenderableText
                  content={aside}
                  as="div"
                  per="word"
                  preset="fade"
                  className="rounded-xl border border-border bg-card/60 p-4 text-sm text-muted-foreground"
                />
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


