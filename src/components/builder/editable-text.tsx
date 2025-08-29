"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { getCurrentLanguage, LanguageCode } from '@/lib/stores/language-store';
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { RichText } from "@/lib/builder-types";
import { useI18n } from "@/lib/i18n";
// Type guard to avoid any-casts when reading multilingual content
function isRichTextLike(value: unknown): value is RichText {
  return typeof value === 'object' && value !== null && !React.isValidElement(value);
}

type TextStyle = {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
};

type EditableTextProps = {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  blockId: string;
  fieldKey: string;
  onSave: (
    blockId: string,
    fieldKey: string,
    value: string,
    style?: TextStyle,
    options?: { perLanguage?: boolean; activeLanguage?: LanguageCode; multilingualContent?: Record<LanguageCode, string> }
  ) => void;
  isBuilder?: boolean;
  style?: TextStyle;
  placeholder?: string;
};

const FONT_FAMILIES = [
  { label: "Default", value: "inherit" },
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Open Sans", value: "'Open Sans', sans-serif" },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Merriweather", value: "Merriweather, serif" },
];

const FONT_SIZES = [
  { label: "XS", value: "0.75rem" },
  { label: "SM", value: "0.875rem" },
  { label: "Base", value: "1rem" },
  { label: "LG", value: "1.125rem" },
  { label: "XL", value: "1.25rem" },
  { label: "2XL", value: "1.5rem" },
  { label: "3XL", value: "1.875rem" },
  { label: "4XL", value: "2.25rem" },
  { label: "5XL", value: "3rem" },
  { label: "6XL", value: "3.75rem" },
];

const PRESET_COLORS = [
  { label: "Default", value: "" },
  { label: "Black", value: "#000000" },
  { label: "White", value: "#ffffff" },
  { label: "Gray", value: "#6b7280" },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Yellow", value: "#eab308" },
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Indigo", value: "#6366f1" },
  { label: "Purple", value: "#a855f7" },
  { label: "Pink", value: "#ec4899" },
];

export function EditableText({
  children,
  className = "",
  as: Component = "div",
  blockId,
  fieldKey,
  onSave,
  isBuilder = false,
  style = {},
  placeholder,
}: EditableTextProps) {
  const t = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(String(children || ""));
  const [textStyle, setTextStyle] = useState<TextStyle>(style || {});
  const [showToolbar, setShowToolbar] = useState(false);
  const [isMultilingual, setIsMultilingual] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>('ru');
  const [multilingualContent, setMultilingualContent] = useState<Record<LanguageCode, string>>({ ru: '', en: '', uz: '' });
  const textRef = useRef<HTMLElement>(null); // for non-editing container
  const editRef = useRef<HTMLTextAreaElement>(null); // for editing textarea
  const toolbarRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [measuredWidthPx, setMeasuredWidthPx] = useState<number | null>(null);
  const TOOLBAR_HEIGHT_PX = 44;

  const resizeTextarea = () => {
    const el = editRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${el.scrollHeight}px`;
  };

  // Initialize state from props on mount only
  useEffect(() => {
    const initialText = String(children || "");
    setText(initialText);
    setTextStyle(style || {});
    
    // Initialize multilingual content from existing data
    if (isRichTextLike(children)) {
      const richText = children;
      const content: Record<LanguageCode, string> = {
        ru: richText.ru || richText.text || '',
        en: richText.en || richText.text || '',
        uz: richText.uz || richText.text || '',
      };
      setMultilingualContent(content);
      
      // Check if this is already multilingual content
      const hasMultilingualData = Boolean(richText.ru || richText.en || richText.uz);
      if (hasMultilingualData) {
        setIsMultilingual(true);
        // Set active language to one that has content, or current language
        const currentLang = getCurrentLanguage();
        if (content[currentLang]) {
          setActiveLanguage(currentLang);
          setText(content[currentLang]);
        } else {
          // Find first language with content
          const langWithContent = (['ru', 'en', 'uz'] as LanguageCode[]).find(lang => content[lang]);
          if (langWithContent) {
            setActiveLanguage(langWithContent);
            setText(content[langWithContent]);
          }
        }
      }
    } else {
      // Initialize all languages with the single text value
      setMultilingualContent({ ru: initialText, en: initialText, uz: initialText });
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Focus caret when entering edit mode (textarea approach)
  useEffect(() => {
    if (isEditing && editRef.current) {
      const el = editRef.current;
      // place caret at end
      const len = el.value.length;
      el.focus();
      el.setSelectionRange(len, len);
      resizeTextarea();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    if (isMultilingual) {
      const updatedContent = { ...multilingualContent, [activeLanguage]: text };
      setMultilingualContent(updatedContent);
      onSave(blockId, fieldKey, text, textStyle, { perLanguage: true, activeLanguage, multilingualContent: updatedContent });
    } else {
      onSave(blockId, fieldKey, text, textStyle, { perLanguage: false });
    }
  }, [isMultilingual, multilingualContent, activeLanguage, text, textStyle, blockId, fieldKey, onSave]);

  // Handle click outside to close editing
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        editRef.current &&
        !editRef.current.contains(event.target as Node) &&
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      ) {
        // Clear any pending debounced save
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        // Immediate save on blur
        handleSave();
        setIsEditing(false);
        setShowToolbar(false);
      }
    }

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isEditing, handleSave]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    if (isBuilder) {
      // Measure current rendered width so textarea keeps same width
      if (textRef.current) {
        const rect = textRef.current.getBoundingClientRect();
        setMeasuredWidthPx(rect.width);
      }
      setIsEditing(true);
      setShowToolbar(true);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.currentTarget.value || "";
    setText(newText);
    // Auto-resize textarea to fit content
    resizeTextarea();
    
    // Debounce the parent state update to avoid constant re-renders
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (isMultilingual) {
        const updatedContent = { ...multilingualContent, [activeLanguage]: newText };
        setMultilingualContent(updatedContent);
        onSave(blockId, fieldKey, newText, textStyle, { perLanguage: true, activeLanguage, multilingualContent: updatedContent });
      } else {
        onSave(blockId, fieldKey, newText, textStyle, { perLanguage: false });
      }
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Clear any pending debounced save
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      // Immediate save on Enter
      handleSave();
      setIsEditing(false);
      setShowToolbar(false);
    }
    if (e.key === "Escape") {
      // Clear any pending debounced save
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      setText(String(children || ""));
      setIsEditing(false);
      setShowToolbar(false);
    }
  };

  const updateStyle = (newStyle: Partial<TextStyle>) => {
    setTextStyle(prev => ({ ...prev, ...newStyle }));
  };

  // moved handleSave above

  const handleLanguageSwitch = (lang: LanguageCode) => {
    // Save current language content before switching
    const updatedContent = { ...multilingualContent, [activeLanguage]: text };
    setMultilingualContent(updatedContent);
    
    // Switch to new language
    setActiveLanguage(lang);
    setText(updatedContent[lang] || '');
  };

  const toggleMultilingual = () => {
    if (!isMultilingual) {
      // Switching to multilingual: initialize all languages with current text
      const content = { ru: text, en: text, uz: text };
      setMultilingualContent(content);
      setActiveLanguage(getCurrentLanguage());
    } else {
      // Switching to single language: use current active language content
      setText(multilingualContent[activeLanguage] || text);
    }
    setIsMultilingual(!isMultilingual);
  };

  const toggleBold = () => {
    updateStyle({
      fontWeight: textStyle.fontWeight === "bold" ? "normal" : "bold"
    });
  };

  const combinedStyle = {
    ...textStyle,
    fontSize: textStyle.fontSize || undefined,
    fontWeight: textStyle.fontWeight || undefined,
    fontFamily: textStyle.fontFamily || undefined,
    color: textStyle.color || undefined,
  };

  // If not in builder mode, render as normal text
  if (!isBuilder) {
    return (
      <Component className={className} style={combinedStyle}>
        {text || String(children || "")}
      </Component>
    );
  }

  return (
    <div className="relative" style={showToolbar ? { paddingTop: TOOLBAR_HEIGHT_PX } : undefined}>
      {!isEditing ? (
        <Component
          ref={textRef as React.Ref<HTMLElement>}
          className={cn(
            className,
            isBuilder && "cursor-pointer transition-all duration-200",
            !isEditing && isBuilder && "hover:bg-primary/10 hover:ring-1 hover:ring-primary/30 rounded-md"
          )}
          style={{
            ...combinedStyle,
            whiteSpace: 'pre-wrap',
          }}
          onClick={handleClick}
        >
          {text || String(children || "")}
        </Component>
      ) : (
        <textarea
          ref={editRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          className={cn(
            className,
            "w-full resize-none bg-transparent outline-none rounded-md ring-2 ring-primary ring-opacity-50 p-0 overflow-hidden"
          )}
          style={{
            ...combinedStyle,
            // ensure textarea visually matches text element
            lineHeight: "inherit" as unknown as number | string,
            height: 'auto',
            overflowY: 'hidden',
            whiteSpace: 'pre-wrap',
            width: measuredWidthPx ? `${measuredWidthPx}px` : '100%',
            display: 'block',
            boxSizing: 'border-box',
          }}
          rows={1}
          placeholder={placeholder || t('edit_text_placeholder')}
        />
      )}

      {/* Formatting Toolbar */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            ref={toolbarRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-0 left-0 z-50 flex items-center gap-2 rounded-lg border border-border bg-card p-2 shadow-lg"
            style={{ height: TOOLBAR_HEIGHT_PX }}
          >
            {/* Multilingual toggle */}
            <label className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-border bg-background text-foreground">
              <input
                type="checkbox"
                checked={isMultilingual}
                onChange={toggleMultilingual}
              />
              <span>{t('multilingual')}</span>
            </label>

            {/* Language tabs */}
            {isMultilingual && (
              <div className="flex items-center gap-1 px-2 py-1 rounded border border-border bg-background">
                {(['ru', 'en', 'uz'] as LanguageCode[]).map((lang) => {
                  const hasContent = Boolean(multilingualContent[lang]);
                  const isActive = activeLanguage === lang;
                  return (
                    <button
                      key={lang}
                      onClick={() => handleLanguageSwitch(lang)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        hasContent ? "bg-green-500" : "bg-gray-300"
                      )} />
                      {lang.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Font Size */}
            <select
              value={textStyle.fontSize || ""}
              onChange={(e) => updateStyle({ fontSize: e.target.value || undefined })}
              className={cn(
                "rounded border border-border px-2 py-1 text-xs bg-background text-foreground",
                textStyle.fontSize && "bg-primary/10 border-primary"
              )}
            >
              <option value="">{t('default_option')}</option>
              {FONT_SIZES.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>

            {/* Bold Toggle */}
            <button
              onClick={toggleBold}
              className={cn(
                "rounded px-2 py-1 text-xs font-bold transition-colors",
                textStyle.fontWeight === "bold"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              )}
            >
              B
            </button>

            {/* Font Family */}
            <select
              value={textStyle.fontFamily || "inherit"}
              onChange={(e) => updateStyle({ fontFamily: e.target.value === "inherit" ? undefined : e.target.value })}
              className={cn(
                "rounded border border-border px-2 py-1 text-xs bg-background text-foreground",
                textStyle.fontFamily && textStyle.fontFamily !== "inherit" && "bg-primary/10 border-primary"
              )}
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.value === 'inherit' ? t('default_option') : font.label}
                </option>
              ))}
            </select>

            {/* Color Picker */}
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={textStyle.color || "#000000"}
                onChange={(e) => updateStyle({ color: e.target.value })}
                className="w-6 h-6 rounded border border-border cursor-pointer"
                title={t('text_color')}
              />
              <select
                value={textStyle.color || ""}
                onChange={(e) => updateStyle({ color: e.target.value || undefined })}
                className={cn(
                  "rounded border border-border px-2 py-1 text-xs bg-background text-foreground",
                  textStyle.color && "bg-primary/10 border-primary"
                )}
              >
                {PRESET_COLORS.map((color) => {
                  const label =
                    color.value === '' ? t('default_option') :
                    color.value === '#000000' ? t('color_black') :
                    color.value === '#ffffff' ? t('color_white') :
                    color.value === '#6b7280' ? t('color_gray') :
                    color.value === '#ef4444' ? t('color_red') :
                    color.value === '#f97316' ? t('color_orange') :
                    color.value === '#eab308' ? t('color_yellow') :
                    color.value === '#22c55e' ? t('color_green') :
                    color.value === '#3b82f6' ? t('color_blue') :
                    color.value === '#6366f1' ? t('color_indigo') :
                    color.value === '#a855f7' ? t('color_purple') :
                    color.value === '#ec4899' ? t('color_pink') :
                    color.label;
                  return (
                    <option key={color.value} value={color.value}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>


          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        [contenteditable="true"]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }
        [contenteditable="true"]:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
