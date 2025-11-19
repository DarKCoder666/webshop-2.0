"use client";

import React from "react";
import { ComponentInstance } from "@/lib/builder-types";
import { useBuilder } from "../builder-context";
import { RenderableText } from "../renderable-text";
import { EditableText } from "../editable-text";

export function TextComponent({ component, blockId }: { component: ComponentInstance; blockId: string }) {
  const { isBuilder, updateComponent } = useBuilder();
  const content = component.props.content as string | object;

  if (isBuilder) {
    return (
      <EditableText
        blockId={blockId}
        fieldKey="content"
        // We ignore the passed fieldKey and use updateComponent
        onSave={(bid, key, value, style, options) => {
            updateComponent(blockId, component.id, {
                props: {
                    ...component.props,
                    content: options?.multilingualContent || value
                },
                style: { ...component.style, ...style }
            });
        }}
        isBuilder={true}
        style={component.style}
        as={(component.props.as as React.ElementType) || "div"}
        className={component.props.className as string}
      >
        {content}
      </EditableText>
    );
  }

  return (
    <RenderableText 
        content={content} 
        style={component.style} 
        as={(component.props.as as React.ElementType) || "div"}
        className={component.props.className as string}
    />
  );
}

