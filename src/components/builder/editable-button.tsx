"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { getCurrentLanguage, LanguageCode } from '@/lib/stores/language-store';
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { RichButton, ButtonStyle } from "@/lib/builder-types";
import { Button } from "@/components/ui/button";
import { PageSelector } from "@/components/builder/page-selector";
import { useI18n } from "@/lib/i18n";

type EditableButtonProps = {
  children: React.ReactNode;
  className?: string;
  blockId: string;
  fieldKey: string;
  // Full content to initialize from (preferred over children)
  content?: string | RichButton;
  onSave: (
    blockId: string,
    fieldKey: string,
    value: string,
    style?: ButtonStyle,
    options?: { perLanguage?: boolean; href?: string; activeLanguage?: LanguageCode; multilingualContent?: Record<LanguageCode, string> }
  ) => void;
  isBuilder?: boolean;
  style?: ButtonStyle;
  href?: string;
  placeholder?: string;
};

const BUTTON_VARIANTS = [
  { label: "Primary", value: "default" as const },
  { label: "Outline", value: "outline" as const },
  { label: "Secondary", value: "secondary" as const },
  { label: "Ghost", value: "ghost" as const },
  { label: "Link", value: "link" as const },
];

const BUTTON_SIZES = [
  { label: "Small", value: "sm" as const },
  { label: "Default", value: "default" as const },
  { label: "Large", value: "lg" as const },
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

export function EditableButton({
  children,
  className = "",
  blockId,
  fieldKey,
  content,
  onSave,
  isBuilder = false,
  style = {},
  href = "",
  placeholder,
}: EditableButtonProps) {
  const t = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(String(children || ""));
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>(style || {});
  const [buttonHref, setButtonHref] = useState(href);
  const [showToolbar, setShowToolbar] = useState(false);
  const [isMultilingual, setIsMultilingual] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>('ru');
  const [multilingualContent, setMultilingualContent] = useState<Record<LanguageCode, string>>({ ru: '', en: '', uz: '' });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const editRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const TOOLBAR_HEIGHT_PX = 44;

  // Type guard to detect RichButton-like content
  function isRichButtonLike(value: unknown): value is RichButton {
    return typeof value === 'object' && value !== null && !React.isValidElement(value);
  }

  // Initialize state from props on mount only
  useEffect(() => {
    const source = (content !== undefined ? content : children) as unknown;
    const initialText = typeof source === 'string' ? source : String(children || "");
    setText(initialText);
    setButtonStyle(style || {});
    setButtonHref(href);
    
    // Initialize multilingual content from existing data
    const rich = isRichButtonLike(source) ? source : null;
    if (rich) {
      const richButton = rich;
      const content = {
        ru: richButton.ru || richButton.text || '',
        en: richButton.en || richButton.text || '',
        uz: richButton.uz || richButton.text || '',
      };
      setMultilingualContent(content);
      
      // Check if this is already multilingual content
      const hasMultilingualData = Boolean(richButton.ru || richButton.en || richButton.uz);
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
      
      // Set other properties
      if (richButton.href) setButtonHref(richButton.href);
    } else {
      // Initialize all languages with the single text value
      setMultilingualContent({ ru: initialText, en: initialText, uz: initialText });
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && editRef.current) {
      const el = editRef.current;
      // place caret at end
      const len = el.value.length;
      el.focus();
      el.setSelectionRange(len, len);
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    if (isMultilingual) {
      const updatedContent = { ...multilingualContent, [activeLanguage]: text };
      setMultilingualContent(updatedContent);
      onSave(blockId, fieldKey, text, buttonStyle, { 
        perLanguage: true, 
        href: buttonHref,
        activeLanguage,
        multilingualContent: updatedContent 
      });
    } else {
      onSave(blockId, fieldKey, text, buttonStyle, { 
        perLanguage: false, 
        href: buttonHref
      });
    }
  }, [isMultilingual, multilingualContent, activeLanguage, text, buttonStyle, buttonHref, blockId, fieldKey, onSave]);

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
      // Re-sync from latest props so previously saved multilingual values load correctly
      const source = (content !== undefined ? content : children) as unknown;
      if (isRichButtonLike(source)) {
        const richButton = source;
        const content = {
          ru: richButton.ru || richButton.text || '',
          en: richButton.en || richButton.text || '',
          uz: richButton.uz || richButton.text || '',
        };
        setMultilingualContent(content);
        const currentLang = getCurrentLanguage();
        const langWithContent = content[currentLang]
          ? currentLang
          : (['ru', 'en', 'uz'] as LanguageCode[]).find((l) => content[l]) as LanguageCode | undefined;
        if (langWithContent) {
          setActiveLanguage(langWithContent);
          setText(content[langWithContent]);
        }
        const hasMultilingualData = Boolean(richButton.ru || richButton.en || richButton.uz);
        setIsMultilingual(hasMultilingualData);
        if (richButton.href) setButtonHref(richButton.href);
      }
      setIsEditing(true);
      setShowToolbar(true);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.currentTarget.value || "";
    setText(newText);
    
    // Debounce the parent state update to avoid constant re-renders
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (isMultilingual) {
        const updatedContent = { ...multilingualContent, [activeLanguage]: newText };
        setMultilingualContent(updatedContent);
        onSave(blockId, fieldKey, newText, buttonStyle, { 
          perLanguage: true, 
          href: buttonHref,
          activeLanguage,
          multilingualContent: updatedContent 
        });
      } else {
        onSave(blockId, fieldKey, newText, buttonStyle, { 
          perLanguage: false, 
          href: buttonHref
        });
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

  const updateStyle = (newStyle: Partial<ButtonStyle>) => {
    setButtonStyle(prev => ({ ...prev, ...newStyle }));
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

  const combinedStyle = {
    fontSize: buttonStyle.fontSize || undefined,
    fontWeight: buttonStyle.fontWeight || undefined,
    fontFamily: buttonStyle.fontFamily || undefined,
    color: buttonStyle.color || undefined,
  };

  // If not in builder mode, render as normal button
  if (!isBuilder) {
    const ButtonComponent = buttonHref ? "a" : Button;
    const buttonProps = buttonHref ? { href: buttonHref } : {};
    
    return (
      <ButtonComponent
        className={className}
        variant={buttonStyle.variant || "default"}
        size={buttonStyle.size || "default"}
        style={combinedStyle}
        {...buttonProps}
      >
        {text || String(children || "")}
      </ButtonComponent>
    );
  }

  return (
    <div className="relative inline-block" style={showToolbar ? { paddingBottom: TOOLBAR_HEIGHT_PX + 8 } : undefined}>
      {!isEditing ? (
        <Button
          ref={buttonRef}
          className={cn(
            className,
            isBuilder && "cursor-pointer transition-all duration-200",
            !isEditing && isBuilder && "hover:ring-1 hover:ring-primary/30"
          )}
          variant={buttonStyle.variant || "default"}
          size={buttonStyle.size || "default"}
          style={combinedStyle}
          onClick={handleClick}
        >
          {text || String(children || "")}
        </Button>
      ) : (
        <input
          ref={editRef}
          type="text"
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "rounded-md border border-primary bg-background px-3 py-1 text-sm outline-none ring-2 ring-primary ring-opacity-50 min-w-[120px]",
            className
          )}
          style={combinedStyle}
          placeholder={placeholder || t('button_text_placeholder')}
        />
      )}

      {/* Toolbar */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            ref={toolbarRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 z-50 flex items-center gap-2 rounded-lg border border-border bg-card p-2 shadow-lg flex-wrap"
            style={{ minHeight: TOOLBAR_HEIGHT_PX }}
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

            {/* Button Variant */}
            <select
              value={buttonStyle.variant || "default"}
              onChange={(e) => updateStyle({ variant: e.target.value as ButtonStyle['variant'] })}
              className={cn(
                "rounded border border-border px-2 py-1 text-xs bg-background text-foreground",
                buttonStyle.variant && buttonStyle.variant !== "default" && "bg-primary/10 border-primary"
              )}
            >
              {BUTTON_VARIANTS.map((variant) => {
                const label =
                  variant.value === 'default' ? t('btn_variant_primary') :
                  variant.value === 'outline' ? t('btn_variant_outline') :
                  variant.value === 'secondary' ? t('btn_variant_secondary') :
                  variant.value === 'ghost' ? t('btn_variant_ghost') :
                  variant.value === 'link' ? t('btn_variant_link') :
                  '';
                return (
                  <option key={variant.value} value={variant.value}>
                    {label || variant.value}
                  </option>
                );
              })}
            </select>

            {/* Button Size */}
            <select
              value={buttonStyle.size || "default"}
              onChange={(e) => updateStyle({ size: e.target.value as ButtonStyle['size'] })}
              className={cn(
                "rounded border border-border px-2 py-1 text-xs bg-background text-foreground",
                buttonStyle.size && buttonStyle.size !== "default" && "bg-primary/10 border-primary"
              )}
            >
              {BUTTON_SIZES.map((size) => {
                const label =
                  size.value === 'sm' ? t('size_small') :
                  size.value === 'default' ? t('size_default') :
                  size.value === 'lg' ? t('size_large') :
                  '';
                return (
                  <option key={size.value} value={size.value}>
                    {label || size.value}
                  </option>
                );
              })}
            </select>

            {/* Color Picker */}
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={buttonStyle.color || "#000000"}
                onChange={(e) => updateStyle({ color: e.target.value })}
                className="w-6 h-6 rounded border border-border cursor-pointer"
                title={t('text_color')}
              />
              <select
                value={buttonStyle.color || ""}
                onChange={(e) => updateStyle({ color: e.target.value || undefined })}
                className={cn(
                  "rounded border border-border px-2 py-1 text-xs bg-background text-foreground",
                  buttonStyle.color && "bg-primary/10 border-primary"
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

            {/* Page Selector */}
            <PageSelector
              value={buttonHref}
              onChange={(val) => {
                setButtonHref(val);
                onSave(blockId, fieldKey, text, buttonStyle, {
                  perLanguage: isMultilingual,
                  href: val,
                  activeLanguage: isMultilingual ? activeLanguage : undefined,
                  multilingualContent: isMultilingual ? multilingualContent : undefined,
                });
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
