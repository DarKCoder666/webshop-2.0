"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { RichButton } from "@/lib/builder-types";
import { useLanguageStore } from '@/lib/stores/language-store';

type RenderableButtonProps = {
  content: string | RichButton | undefined;
  className?: string;
  // Default button props
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  // Fallback text when content is empty
  fallback?: string;
  // Optional click handler for non-link buttons
  onClick?: () => void;
};

export function RenderableButton({
  content,
  className = "",
  variant = "default",
  size = "default", 
  fallback = "",
  onClick,
}: RenderableButtonProps) {
  // Use language store to make component reactive to language changes
  const currentLanguage = useLanguageStore(s => s.language);
  
  // Extract text and style from content
  const text = React.useMemo(() => {
    if (!content) return fallback;
    if (typeof content === "string") return content;
    
    // Try to get content for current language first
    const langContent = (content as any)[currentLanguage];
    if (langContent) return langContent;
    
    // Fall back to text field or first available language content
    if (content.text) return content.text;
    
    // Try other languages as fallback
    const availableContent = (content as any).ru || (content as any).en || (content as any).uz;
    return availableContent || fallback;
  }, [content, fallback, currentLanguage]);

  const buttonProps = React.useMemo(() => {
    if (!content || typeof content === "string") {
      return {
        variant,
        size,
        style: {},
        href: undefined,
        target: undefined,
      };
    }
    
    const richButton = content as RichButton;
    const buttonStyle = richButton.style || {};
    
    return {
      variant: buttonStyle.variant || variant,
      size: buttonStyle.size || size,
      style: {
        fontSize: buttonStyle.fontSize,
        fontWeight: buttonStyle.fontWeight,
        fontFamily: buttonStyle.fontFamily,
        color: buttonStyle.color,
      },
      href: richButton.href,
    };
  }, [content, variant, size]);

  // Don't render if no text
  if (!text) return null;

  // Render as link if href is provided
  if (buttonProps.href) {
    return (
      <Button
        asChild
        variant={buttonProps.variant}
        size={buttonProps.size}
        className={className}
        style={buttonProps.style}
      >
        <a href={buttonProps.href}>
          {text}
        </a>
      </Button>
    );
  }

  // Render as button
  return (
    <Button
      variant={buttonProps.variant}
      size={buttonProps.size}
      className={className}
      style={buttonProps.style}
      onClick={onClick}
    >
      {text}
    </Button>
  );
}
