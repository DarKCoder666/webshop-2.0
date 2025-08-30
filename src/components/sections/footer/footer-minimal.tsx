"use client";

import React from "react";
import Link from "next/link";
import { useBuilder } from "@/components/builder/builder-context";
import { EditableText } from "@/components/builder/editable-text";
import { RenderableText } from "@/components/builder/renderable-text";
import { RichText } from "@/lib/builder-types";
import { getRichTextContent, getRichTextStyle } from "@/lib/text-utils";
import { cn } from "@/lib/utils";

type FooterLink = { label: string; href: string };
type Social = { label: string; href: string; platform?: "twitter" | "instagram" | "linkedin" | "github" };

export type FooterMinimalProps = {
  blockId?: string;
  className?: string;
  logoText?: string | RichText;
  description?: string | RichText;
  links?: FooterLink[];
  social?: Social[];
  copyright?: string | RichText;
};

export default function FooterMinimal(props: FooterMinimalProps) {
  const {
    blockId,
    className,
    logoText = { text: "Your Brand" },
    description = { text: "We craft delightful experiences." },
    links = [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
    copyright = { text: "© 2025 Your Brand. All rights reserved." },
  } = props;

  const { isBuilder, updateBlockText } = useBuilder();

  return (
    <footer className={cn("border-t border-border bg-card", className)}>

      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="space-y-2">
            {isBuilder ? (
              <EditableText
                key={`logoText-${blockId}`}
                blockId={blockId || ""}
                fieldKey="logoText"
                onSave={updateBlockText}
                isBuilder={isBuilder}
                as="div"
                className="text-lg font-semibold"
                style={getRichTextStyle(logoText)}
              >
                {getRichTextContent(logoText)}
              </EditableText>
            ) : (
              <RenderableText content={logoText} className="text-lg font-semibold" />
            )}

            {isBuilder ? (
              <EditableText
                key={`description-${blockId}`}
                blockId={blockId || ""}
                fieldKey="description"
                onSave={updateBlockText}
                isBuilder={isBuilder}
                as="p"
                className="max-w-md text-sm text-muted-foreground"
                style={getRichTextStyle(description)}
              >
                {getRichTextContent(description)}
              </EditableText>
            ) : (
              <RenderableText content={description} as="p" className="max-w-md text-sm text-muted-foreground" />
            )}
          </div>

          {links.length > 0 && (
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              {links.map((l, i) => (
                <li key={`${l.label}-${i}`}>
                  <Link href={l.href} className="text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          {isBuilder ? (
            <EditableText
              key={`copyright-${blockId}`}
              blockId={blockId || ""}
              fieldKey="copyright"
              onSave={updateBlockText}
              isBuilder={isBuilder}
              as="p"
              className=""
              style={getRichTextStyle(copyright)}
            >
              {getRichTextContent(copyright)}
            </EditableText>
          ) : (
            <RenderableText content={copyright} as="p" />
          )}
        </div>
      </div>
    </footer>
  );
}


