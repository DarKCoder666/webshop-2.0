"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

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
  onSave: (blockId: string, fieldKey: string, value: string, style?: TextStyle) => void;
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
  placeholder = "Click to edit text...",
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(String(children || ""));
  const [textStyle, setTextStyle] = useState<TextStyle>(style || {});
  const [showToolbar, setShowToolbar] = useState(false);
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
    setText(String(children || ""));
    setTextStyle(style || {});
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
        onSave(blockId, fieldKey, text, textStyle);
        setIsEditing(false);
        setShowToolbar(false);
      }
    }

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isEditing, blockId, fieldKey, onSave, text, textStyle, children, style]);

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
      onSave(blockId, fieldKey, newText, textStyle);
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
      onSave(blockId, fieldKey, text, textStyle);
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
          placeholder={placeholder}
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
            {/* Font Size */}
            <select
              value={textStyle.fontSize || ""}
              onChange={(e) => updateStyle({ fontSize: e.target.value || undefined })}
              className={cn(
                "rounded border border-border px-2 py-1 text-xs bg-background text-foreground",
                textStyle.fontSize && "bg-primary/10 border-primary"
              )}
            >
              <option value="">Default</option>
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
                  {font.label}
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
                title="Text Color"
              />
              <select
                value={textStyle.color || ""}
                onChange={(e) => updateStyle({ color: e.target.value || undefined })}
                className={cn(
                  "rounded border border-border px-2 py-1 text-xs bg-background text-foreground",
                  textStyle.color && "bg-primary/10 border-primary"
                )}
              >
                {PRESET_COLORS.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Helper */}
            <div className="ml-2 text-xs text-muted-foreground">Enter to apply • Esc to cancel</div>
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
