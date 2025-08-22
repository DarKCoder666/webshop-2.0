"use client";

import React from "react";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { RichText } from "@/lib/builder-types";

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
  // Extract text and style from content
  const text = React.useMemo(() => {
    if (!content) return fallback;
    if (typeof content === "string") return content;
    return content.text || fallback;
  }, [content, fallback]);

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

  return (
    <TextEffect
      key={`text-${text}-${JSON.stringify(style)}`}
      as={typeof Component === "string" ? Component : undefined}
      per={per}
      preset={preset}
      delay={delay}
      speedReveal={speedReveal}
      speedSegment={speedSegment}
      className={className}
      style={style}
    >
      {text}
    </TextEffect>
  );
}
