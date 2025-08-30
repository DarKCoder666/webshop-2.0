"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useBuilder } from "@/components/builder/builder-context";
import { EditableText } from "@/components/builder/editable-text";
import { RenderableText } from "@/components/builder/renderable-text";
import { RichText } from "@/lib/builder-types";
import { getRichTextContent, getRichTextStyle } from "@/lib/text-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type FooterLink = { label: string; href: string };

export type FooterHalfscreenProps = {
  blockId?: string;
  className?: string;
  // Left: rich branding and CTA
  badge?: string | RichText;
  title?: string | RichText;
  description?: string | RichText;
  primaryCta?: { label: string | RichText; href: string };
  secondaryCta?: { label: string | RichText; href: string };
  // Right: immersive background
  imageSrc?: string;
  imageAlt?: string;
  overlayGradient?: boolean;
  // Bottom row
  links?: FooterLink[];
  copyright?: string | RichText;
};

export default function FooterHalfscreen(props: FooterHalfscreenProps) {
  const {
    blockId,
    className,
    badge = { text: "New" },
    title = { text: "Make a bold closing statement" },
    description = { text: "Convert visitors with a dramatic, editorial-style footer." },
    primaryCta = { label: { text: "Get Started" }, href: "#" },
    secondaryCta = { label: { text: "Talk to Sales" }, href: "#" },
    imageSrc = "/random3.jpeg",
    imageAlt = "Decorative",
    overlayGradient = true,
    links = [],
    copyright = { text: "© 2025 Your Brand" },
  } = props;

  const { isBuilder, updateBlockText } = useBuilder();

  return (
    <footer className={cn("relative border-t border-border bg-background", className)}>
      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28">
        <div className="grid items-stretch gap-8 md:grid-cols-2">
          {/* Left: Content */}
          <div className="relative z-10 flex flex-col justify-center py-4">
            {isBuilder ? (
              <EditableText
                key={`badge-${blockId}`}
                blockId={blockId || ""}
                fieldKey="badge"
                onSave={updateBlockText}
                isBuilder={isBuilder}
                as="span"
                className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
                style={getRichTextStyle(badge)}
              >
                {getRichTextContent(badge)}
              </EditableText>
            ) : (
              <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {getRichTextContent(badge)}
              </span>
            )}

            {isBuilder ? (
              <EditableText
                key={`title-${blockId}`}
                blockId={blockId || ""}
                fieldKey="title"
                onSave={updateBlockText}
                isBuilder={isBuilder}
                as="h2"
                className="mt-6 text-4xl font-extrabold tracking-tight md:text-5xl"
                style={getRichTextStyle(title)}
              >
                {getRichTextContent(title)}
              </EditableText>
            ) : (
              <RenderableText content={title} as="h2" className="mt-6 text-4xl font-extrabold tracking-tight md:text-5xl" />
            )}

            {isBuilder ? (
              <EditableText
                key={`description-${blockId}`}
                blockId={blockId || ""}
                fieldKey="description"
                onSave={updateBlockText}
                isBuilder={isBuilder}
                as="p"
                className="mt-4 max-w-xl text-muted-foreground"
                style={getRichTextStyle(description)}
              >
                {getRichTextContent(description)}
              </EditableText>
            ) : (
              <RenderableText content={description} as="p" className="mt-4 max-w-xl text-muted-foreground" />
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 rounded-lg px-6">
                <Link href={primaryCta.href}>{getRichTextContent(primaryCta.label)}</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-lg px-6">
                <Link href={secondaryCta.href}>{getRichTextContent(secondaryCta.label)}</Link>
              </Button>
            </div>
          </div>

          {/* Right: Visual - Half-screen block */}
          <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-border">
            <Image src={imageSrc} alt={imageAlt} fill priority className="object-cover" />
            {overlayGradient && (
              <div className="absolute inset-0 bg-gradient-to-tr from-background/40 via-background/10 to-transparent" />
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          {isBuilder ? (
            <EditableText
              key={`copyright-${blockId}`}
              blockId={blockId || ""}
              fieldKey="copyright"
              onSave={updateBlockText}
              isBuilder={isBuilder}
              as="p"
              style={getRichTextStyle(copyright)}
            >
              {getRichTextContent(copyright)}
            </EditableText>
          ) : (
            <RenderableText content={copyright} />
          )}
          {links.length > 0 && (
            <ul className="flex flex-wrap items-center gap-4">
              {links.map((l, i) => (
                <li key={`${l.label}-${i}`}>
                  <Link href={l.href} className="hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}


