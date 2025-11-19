"use client";

import React from "react";
import { ComponentInstance } from "@/lib/builder-types";
import { useBuilder } from "@/components/builder/builder-context";
import { RenderComponent, getComponentSchema } from "@/components/builder/component-registry";
import { InsertComponentButton } from "@/components/builder/insert-component-button";
import { cn } from "@/lib/utils";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";

export function RowComponent({ component, blockId }: { component: ComponentInstance; blockId: string }) {
  const { isBuilder, updateComponent } = useBuilder();
  const children = component.children || [];
  const gap = (component.props.gap as string) || "4";
  const alignItems = (component.props.alignItems as string) || "center";

  // Empty State for Row
  if (isBuilder && children.length === 0) {
      return (
        <div className="flex w-full items-center justify-center p-4 border-2 border-dashed border-muted rounded-lg opacity-50 hover:opacity-100 transition-opacity min-h-[80px]">
            <InsertComponentButton onPick={(type) => {
                    const schema = getComponentSchema(type);
                    const newComp: ComponentInstance = {
                        id: `comp-${Date.now()}`,
                        type: type,
                        props: schema?.defaultProps || {},
                        style: schema?.defaultStyle || {}
                    };
                    updateComponent(blockId, component.id, { children: [newComp] });
            }} />
        </div>
      );
  }

  const content = (
    <div 
        className={cn("flex flex-col md:flex-row w-full", component.props.className as string)}
        style={{ 
            ...component.style,
            gap: `${gap}px`,
            alignItems
        }}
    >
        {children.map((child) => (
            <RenderComponent key={child.id} component={child} blockId={blockId} />
        ))}
    </div>
  );

  if (isBuilder) {
      return (
          <SortableContext items={children.map(c => c.id)} strategy={horizontalListSortingStrategy}>
              {content}
          </SortableContext>
      );
  }

  return content;
}
