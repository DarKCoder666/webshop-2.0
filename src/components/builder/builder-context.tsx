"use client";

import React, { createContext, useContext } from "react";
import { BlockInstance } from "@/lib/builder-types";

type TextStyle = {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

type BuilderContextType = {
  isBuilder: boolean;
  blocks: BlockInstance[];
  updateBlockText: (blockId: string, fieldKey: string, value: string, style?: TextStyle) => void;
};

const BuilderContext = createContext<BuilderContextType | null>(null);

type BuilderProviderProps = {
  children: React.ReactNode;
  isBuilder?: boolean;
  blocks?: BlockInstance[];
  onBlockUpdate?: (blockId: string, fieldKey: string, value: string, style?: TextStyle) => void;
};

export function BuilderProvider({ 
  children, 
  isBuilder = false, 
  blocks = [], 
  onBlockUpdate 
}: BuilderProviderProps) {
  const updateBlockText = (blockId: string, fieldKey: string, value: string, style?: TextStyle) => {
    if (onBlockUpdate) {
      onBlockUpdate(blockId, fieldKey, value, style);
    }
  };

  const value = {
    isBuilder,
    blocks,
    updateBlockText,
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
    };
  }
  return context;
}
