"use client";

import React from "react";
import Link from "next/link";
import { useBuilder } from "@/components/builder/builder-context";
import { EditableText } from "@/components/builder/editable-text";
import { RenderableText } from "@/components/builder/renderable-text";
import { RichText } from "@/lib/builder-types";
import { getRichTextContent, getRichTextStyle } from "@/lib/text-utils";
import { cn } from "@/lib/utils";

type ColumnLink = { label: string; href: string };
type Column = { title: string | RichText; links: ColumnLink[] };

export type FooterColumnsProps = {
  blockId?: string;
  className?: string;
  logoText?: string | RichText;
  description?: string | RichText;
  columns?: Column[];
  bottomNote?: string | RichText;
};

export default function FooterColumns(props: FooterColumnsProps) {
  const {
    blockId,
    className,
    logoText = { text: "Your Brand" },
    description = { text: "Thoughtfully crafted ecommerce." },
    columns = [
      { title: { text: "Product" }, links: [{ label: "Features", href: "#" }, { label: "Pricing", href: "#" }, { label: "Integrations", href: "#" }] },
      { title: { text: "Company" }, links: [{ label: "About", href: "#" }, { label: "Careers", href: "#" }, { label: "Press", href: "#" }] },
      { title: { text: "Resources" }, links: [{ label: "Blog", href: "#" }, { label: "Help Center", href: "#" }, { label: "Contact", href: "#" }] },
      { title: { text: "Legal" }, links: [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }, { label: "Cookies", href: "#" }] },
    ],
    bottomNote = { text: "© 2025 Your Brand" },
  } = props;

  const { isBuilder, updateBlockText } = useBuilder();

  return (
    <footer className={cn("border-t border-border bg-card", className)}>
      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4 space-y-3">
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
                className="text-sm text-muted-foreground"
                style={getRichTextStyle(description)}
              >
                {getRichTextContent(description)}
              </EditableText>
            ) : (
              <RenderableText content={description} as="p" className="text-sm text-muted-foreground" />
            )}

            {/* Newsletter removed */}
          </div>

          <div className="md:col-span-8 grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
            {columns.map((col, idx) => (
              <div key={`col-${idx}`} className="space-y-3">
                {isBuilder ? (
                  <EditableText
                    key={`col-title-${idx}-${blockId}`}
                    blockId={blockId || ""}
                    fieldKey={`col${idx}Title`}
                    onSave={updateBlockText}
                    isBuilder={isBuilder}
                    as="div"
                    className="text-sm font-semibold"
                    style={getRichTextStyle(col.title)}
                  >
                    {getRichTextContent(col.title)}
                  </EditableText>
                ) : (
                  <RenderableText content={col.title} className="text-sm font-semibold" />
                )}
                <ul className="space-y-2">
                  {col.links.map((l, i) => (
                    <li key={`col-${idx}-${l.label}-${i}`}>
                      <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          {isBuilder ? (
            <EditableText
              key={`bottomNote-${blockId}`}
              blockId={blockId || ""}
              fieldKey="bottomNote"
              onSave={updateBlockText}
              isBuilder={isBuilder}
              as="p"
              className=""
              style={getRichTextStyle(bottomNote)}
            >
              {getRichTextContent(bottomNote)}
            </EditableText>
          ) : (
            <RenderableText content={bottomNote} as="p" />
          )}
        </div>
      </div>
    </footer>
  );
}


