"use client";

import React from "react";
import { ComponentInstance, ButtonStyle } from "@/lib/builder-types";
import { useBuilder } from "../builder-context";
import { RenderableButton } from "../renderable-button";
import { EditableButton } from "../editable-button";

export function ButtonComponent({ component, blockId }: { component: ComponentInstance; blockId: string }) {
  const { isBuilder, updateComponent } = useBuilder();
  const content = component.props.content as string | object;

  if (isBuilder) {
    return (
      <EditableButton
        blockId={blockId}
        fieldKey="content"
        content={content}
        onSave={(bid, key, value, style, options) => {
             updateComponent(blockId, component.id, {
                props: {
                    ...component.props,
                    content: options?.multilingualContent ? { ...options.multilingualContent, style, href: options.href } : { text: value, style, href: options?.href }
                },
                style: style
            });
        }}
        isBuilder={true}
        style={component.style as ButtonStyle}
        href={(component.props.href as string) || undefined}
        className={component.props.className as string}
      >
        {/* Fallback text if content is complex object */}
        {typeof content === 'string' ? content : (content as any).text || 'Button'}
      </EditableButton>
    );
  }

  return (
    <RenderableButton 
        content={content} 
        className={component.props.className as string}
    />
  );
}

