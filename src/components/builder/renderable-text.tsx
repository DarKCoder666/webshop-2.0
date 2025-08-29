"use client";

import React from "react";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { RichText } from "@/lib/builder-types";
import { useLanguageStore } from '@/lib/stores/language-store';

type RenderableTextProps = {
  content: string | RichText | undefined;
  className?: string;
  as?: React.ElementType;
  // TextEffect animation props
  per?: "word" | "char";
  preset?: "fade" | "fade-in-blur" | "slide" | "scale" | "blur";
  delay?: number;
  speedReveal?: number;
  speedSegment?: number;
  // Fallback text when content is empty
  fallback?: string;
};

export function RenderableText({
  content,
  className = "",
  as: Component = "div",
  per = "char",
  preset = "fade-in-blur",
  delay = 0,
  speedReveal = 0.7,
  speedSegment = 0.9,
  fallback = "",
}: RenderableTextProps) {
  // Use language store to make component reactive to language changes
  const currentLanguage = useLanguageStore(s => s.language);

  // Determine if multilingual per-language fields exist
  const hasPerLanguage = React.useMemo(() => {
    if (!content || typeof content === "string") return false;
    const ru = ((content as any).ru ?? "").toString().trim();
    const en = ((content as any).en ?? "").toString().trim();
    const uz = ((content as any).uz ?? "").toString().trim();
    return Boolean(ru || en || uz);
  }, [content]);

  // Extract text with preference for non-empty per-language values
  const text = React.useMemo(() => {
    if (!content) return fallback;
    if (typeof content === "string") return content;

    const ru = ((content as any).ru ?? "").toString();
    const en = ((content as any).en ?? "").toString();
    const uz = ((content as any).uz ?? "").toString();

    const langMap: Record<string, string> = { ru, en, uz };
    const preferred = (langMap[currentLanguage] || "").trim();
    if (preferred) return preferred;

    const firstAvailable = [ru, en, uz].find(v => (v || "").trim());
    if (firstAvailable) return firstAvailable as string;

    if ((content as any).text) return (content as any).text as string;
    return fallback;
  }, [content, fallback, currentLanguage]);

  const style = React.useMemo(() => {
    // Default to preserving newlines and wrapping
    const base: React.CSSProperties = { whiteSpace: 'pre-wrap' };
    if (!content || typeof content === "string") return base;
    
    const contentStyle = content.style || {};
    return {
      ...base,
      fontSize: contentStyle.fontSize,
      fontWeight: contentStyle.fontWeight,
      fontFamily: contentStyle.fontFamily,
      color: contentStyle.color,
    };
  }, [content]);

  // Don't render if no text
  if (!text) return null;

  const combinedClassName = hasPerLanguage ? `${className} is-multilingual` : className;

  return (
    <TextEffect
      key={`text-${text}-${JSON.stringify(style)}`}
      as={typeof Component === "string" ? Component : undefined}
      per={per}
      preset={preset}
      delay={delay}
      speedReveal={speedReveal}
      speedSegment={speedSegment}
      className={combinedClassName}
      style={style}
    >
      {text}
    </TextEffect>
  );
}
