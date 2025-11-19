"use client";

import React, { createContext, useContext } from "react";
import { BlockInstance, ComponentInstance } from "@/lib/builder-types";
import { LanguageCode } from "@/lib/stores/language-store";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { findNode } from "@/lib/builder-utils";
import { arrayMove } from "@dnd-kit/sortable";

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
  updateComponent: (blockId: string, componentId: string, updates: Partial<ComponentInstance>) => void;
  addComponent: (blockId: string, component: ComponentInstance, index?: number) => void;
  removeComponent: (blockId: string, componentId: string) => void;
  setBlockChildren: (blockId: string, children: ComponentInstance[]) => void;
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
  onComponentUpdate?: (blockId: string, componentId: string, updates: Partial<ComponentInstance>) => void;
  onAddComponent?: (blockId: string, component: ComponentInstance, index?: number) => void;
  onRemoveComponent?: (blockId: string, componentId: string) => void;
  onSetBlockChildren?: (blockId: string, children: ComponentInstance[]) => void;
};

export function BuilderProvider({ 
  children, 
  isBuilder = false, 
  blocks = [], 
  onBlockUpdate,
  onBlockPropsUpdate,
  onComponentUpdate,
  onAddComponent,
  onRemoveComponent,
  onSetBlockChildren
}: BuilderProviderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8, // Drag needs to move 8px before starting, allowing clicks
        }
    }),
    useSensor(KeyboardSensor)
  );

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

  const updateComponent = (blockId: string, componentId: string, updates: Partial<ComponentInstance>) => {
    if (onComponentUpdate) {
      onComponentUpdate(blockId, componentId, updates);
    }
  };

  const addComponent = (blockId: string, component: ComponentInstance, index?: number) => {
    if (onAddComponent) {
      onAddComponent(blockId, component, index);
    }
  };

  const removeComponent = (blockId: string, componentId: string) => {
    if (onRemoveComponent) {
      onRemoveComponent(blockId, componentId);
    }
  };

  const setBlockChildren = (blockId: string, children: ComponentInstance[]) => {
    if (onSetBlockChildren) {
      onSetBlockChildren(blockId, children);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeNode = findNode(blocks, activeId);
    const overNode = findNode(blocks, overId);

    if (!activeNode || !overNode) return;

    // Scenario 1: Reordering within the same parent
    if (activeNode.parent?.id === overNode.parent?.id) {
        const parent = activeNode.parent;
        if (!parent) return;

        const currentChildren = parent.children || [];
        const oldIndex = activeNode.index;
        const newIndex = overNode.index;
        
        const newChildren = arrayMove(currentChildren, oldIndex, newIndex);
        
        // Determine blockId from path
        const blockId = activeNode.path[0];

        // Check if parent is a Block (top level) or a Component (nested)
        // If parent is BlockInstance, it has 'type' as BlockType. 
        // If parent is ComponentInstance, it has 'type' as ComponentType.
        // But we can also check if 'id' matches the blockId.
        if (parent.id === blockId) {
            setBlockChildren(blockId, newChildren);
        } else {
            // It's a nested component
            updateComponent(blockId, parent.id, { children: newChildren });
        }
    }
    // Scenario 2: Moving to different parent (Cross-Container Drag)
    // For now, we can limit to same-parent reordering to ensure stability first.
    // But user asked for "drag and drop items from one side or to the other".
    // Implementing generic move requires updating two parents.
    else if (activeNode.parent && overNode.parent) {
        const sourceParent = activeNode.parent;
        const targetParent = overNode.parent;
        
        const sourceChildren = [...(sourceParent.children || [])];
        const targetChildren = [...(targetParent.children || [])];
        
        // Remove from source
        const [movedItem] = sourceChildren.splice(activeNode.index, 1);
        
        // Add to target
        // We want to insert relative to overNode
        // If moving down, insert after. If up, insert before? 
        // Or just insert at index of overNode.
        targetChildren.splice(overNode.index, 0, movedItem);
        
        const sourceBlockId = activeNode.path[0];
        const targetBlockId = overNode.path[0];
        
        // Update Source
        if (sourceParent.id === sourceBlockId) {
            setBlockChildren(sourceBlockId, sourceChildren);
        } else {
            updateComponent(sourceBlockId, sourceParent.id, { children: sourceChildren });
        }
        
        // Update Target
        if (targetParent.id === targetBlockId) {
            setBlockChildren(targetBlockId, targetChildren);
        } else {
            updateComponent(targetBlockId, targetParent.id, { children: targetChildren });
        }
    }
  };

  const value = {
    isBuilder,
    blocks,
    updateBlockText,
    updateBlockProps,
    updateComponent,
    addComponent,
    removeComponent,
    setBlockChildren,
  };

  return (
    <BuilderContext.Provider value={value}>
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        {children}
      </DndContext>
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
      updateComponent: () => {},
      addComponent: () => {},
      removeComponent: () => {},
      setBlockChildren: () => {},
    };
  }
  return context;
}
