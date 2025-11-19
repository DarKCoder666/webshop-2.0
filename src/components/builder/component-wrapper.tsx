"use client";

import React from "react";
import { ComponentInstance, ComponentType, BlockInstance } from "@/lib/builder-types";
import { useBuilder } from "./builder-context";
import { InsertComponentButton } from "./insert-component-button";
import { getComponentSchema } from "./component-registry";
import { Button } from "@/components/ui/button";
import { Trash, GripVertical } from "lucide-react";
import { findNode } from "@/lib/builder-utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ComponentWrapperProps {
  component: ComponentInstance;
  blockId: string;
  children: React.ReactNode;
}

export function ComponentWrapper({ component, blockId, children }: ComponentWrapperProps) {
  const { isBuilder, blocks, updateComponent, setBlockChildren, removeComponent } = useBuilder();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: component.id, disabled: !isBuilder });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!isBuilder) return <>{children}</>;

  const handleAddSide = (side: 'left' | 'right', type: ComponentType) => {
    const result = findNode(blocks, component.id);
    if (!result || !result.parent) {
        console.error("Could not find component parent", component.id);
        return;
    }

    const { parent, index } = result;
    
    const schema = getComponentSchema(type);
    const newComp: ComponentInstance = {
        id: `comp-${Date.now()}`,
        type: type,
        props: schema?.defaultProps || {},
        style: schema?.defaultStyle || {}
    };

    const isParentRow = (parent as ComponentInstance).type === 'row';

    if (isParentRow) {
        const parentComp = parent as ComponentInstance;
        const currentChildren = parentComp.children || [];
        const newChildren = [...currentChildren];
        const insertIndex = side === 'left' ? index : index + 1;
        newChildren.splice(insertIndex, 0, newComp);
        
        updateComponent(blockId, parentComp.id, { children: newChildren });
    } else {
        const rowSchema = getComponentSchema('row');
        if (!rowSchema) return;

        const rowComp: ComponentInstance = {
            id: `row-${Date.now()}`,
            type: 'row',
            props: {
                ...rowSchema.defaultProps,
                className: "w-full"
            },
            style: {
                ...rowSchema.defaultStyle,
                display: 'flex',
                flexDirection: 'row',
                gap: '16px',
                alignItems: 'center'
            },
            children: side === 'left' ? [newComp, component] : [component, newComp]
        };

        if ('blocks' in parent || parent.id === blockId) {
             const parentBlock = parent as BlockInstance;
             const currentChildren = parentBlock.children || [];
             const newChildren = [...currentChildren];
             newChildren[index] = rowComp;
             setBlockChildren(blockId, newChildren);
        } else {
             const parentComp = parent as ComponentInstance;
             const currentChildren = parentComp.children || [];
             const newChildren = [...currentChildren];
             newChildren[index] = rowComp;
             updateComponent(blockId, parentComp.id, { children: newChildren });
        }
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      removeComponent(blockId, component.id);
  };

  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        className="relative group/wrapper flex-1 min-w-[50px] w-full md:w-auto h-full"
    >
       {/* Vertical Insert Lines - LEFT */}
       <div className="absolute -left-6 top-0 bottom-0 w-10 z-[1000] opacity-0 group-hover/wrapper:opacity-100 hover:opacity-100 flex items-center justify-center group/insert-left transition-all duration-200 pointer-events-none hover:pointer-events-auto">
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-primary/20 group-hover/insert-left:bg-primary/50 rounded-full -translate-x-1/2 transition-colors" />
            <div className="relative z-10 scale-0 group-hover/insert-left:scale-100 transition-transform duration-200 shadow-lg rounded-full bg-background border border-border">
                <InsertComponentButton onPick={(type) => handleAddSide('left', type)} />
            </div>
       </div>

       {/* Vertical Insert Lines - RIGHT */}
       <div className="absolute -right-6 top-0 bottom-0 w-10 z-[1000] opacity-0 group-hover/wrapper:opacity-100 hover:opacity-100 flex items-center justify-center group/insert-right transition-all duration-200 pointer-events-none hover:pointer-events-auto">
             <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-primary/20 group-hover/insert-right:bg-primary/50 rounded-full -translate-x-1/2 transition-colors" />
             <div className="relative z-10 scale-0 group-hover/insert-right:scale-100 transition-transform duration-200 shadow-lg rounded-full bg-background border border-border">
                <InsertComponentButton onPick={(type) => handleAddSide('right', type)} />
             </div>
       </div>

       {/* Controls Overlay - Top Right */}
       <div className="absolute -right-3 -top-3 opacity-0 group-hover/wrapper:opacity-100 z-[1001] transition-opacity scale-75 pointer-events-none group-hover/wrapper:pointer-events-auto hover:scale-100 flex items-center gap-1">
            {/* Drag Handle */}
            <div 
                {...attributes} 
                {...listeners} 
                className="bg-background border border-border shadow-md rounded-md p-1 cursor-grab active:cursor-grabbing hover:bg-accent"
            >
                <GripVertical className="h-3 w-3 text-muted-foreground" />
            </div>
            {/* Delete Button */}
            <Button size="icon" variant="destructive" className="h-6 w-6 rounded-full shadow-md p-1" onClick={handleDelete}>
                <Trash className="h-3 w-3" />
            </Button>
       </div>

       {/* Highlight Ring */}
       <div className={
           "rounded transition-all h-full " +
           (isDragging ? "ring-2 ring-primary opacity-50" : "group-hover/wrapper:ring-1 group-hover/wrapper:ring-primary/40")
       }>
           {children}
       </div>
    </div>
  );
}
