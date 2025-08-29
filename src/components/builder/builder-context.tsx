"use client";

import React, { createContext, useContext } from "react";
import { BlockInstance } from "@/lib/builder-types";
import { LanguageCode } from "@/lib/stores/language-store";

type TextStyle = {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
};

type BuilderContextType = {
  isBuilder: boolean;
  blocks: BlockInstance[];
  updateBlockText: (
    blockId: string,
    fieldKey: string,
    value: string,
    style?: TextStyle,
    options?: { 
      perLanguage?: boolean;
      activeLanguage?: LanguageCode;
      multilingualContent?: Record<LanguageCode, string>;
      href?: string;
    }
  ) => void;
  updateBlockProps?: (blockId: string, props: Record<string, unknown>) => void;
};

const BuilderContext = createContext<BuilderContextType | null>(null);

type BuilderProviderProps = {
  children: React.ReactNode;
  isBuilder?: boolean;
  blocks?: BlockInstance[];
  onBlockUpdate?: (
    blockId: string,
    fieldKey: string,
    value: string,
    style?: TextStyle,
    options?: { 
      perLanguage?: boolean;
      activeLanguage?: LanguageCode;
      multilingualContent?: Record<LanguageCode, string>;
      href?: string;
    }
  ) => void;
  onBlockPropsUpdate?: (blockId: string, props: Record<string, unknown>) => void;
};

export function BuilderProvider({ 
  children, 
  isBuilder = false, 
  blocks = [], 
  onBlockUpdate,
  onBlockPropsUpdate
}: BuilderProviderProps) {
  const updateBlockText = (
    blockId: string,
    fieldKey: string,
    value: string,
    style?: TextStyle,
    options?: { 
      perLanguage?: boolean;
      activeLanguage?: LanguageCode;
      multilingualContent?: Record<LanguageCode, string>;
      href?: string;
    }
  ) => {
    if (onBlockUpdate) {
      onBlockUpdate(blockId, fieldKey, value, style, options);
    }
  };

  const updateBlockProps = (blockId: string, props: Record<string, unknown>) => {
    if (onBlockPropsUpdate) {
      onBlockPropsUpdate(blockId, props);
    }
  };

  const value = {
    isBuilder,
    blocks,
    updateBlockText,
    updateBlockProps,
  };

  return (
    <BuilderContext.Provider value={value}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) {
    return {
      isBuilder: false,
      blocks: [],
      updateBlockText: () => {},
      updateBlockProps: () => {},
    };
  }
  return context;
}
