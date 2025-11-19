"use client";

import React from "react";
import { ComponentInstance, ComponentType } from "@/lib/builder-types";
import { TextComponent } from "./components/text-component";
import { ButtonComponent } from "./components/button-component";
import { ImageComponent } from "./components/image-component";
import { RowComponent } from "./components/row-component";
import { ComponentWrapper } from "./component-wrapper";

export const RenderComponent = ({ 
  component, 
  blockId 
}: { 
  component: ComponentInstance; 
  blockId: string;
}) => {
  let content;
  switch (component.type) {
    case 'text':
      content = <TextComponent component={component} blockId={blockId} />;
      break;
    case 'button':
      content = <ButtonComponent component={component} blockId={blockId} />;
      break;
    case 'image':
      content = <ImageComponent component={component} blockId={blockId} />;
      break;
    case 'row':
      content = <RowComponent component={component} blockId={blockId} />;
      break;
    default:
      content = <div>Unknown component type: {component.type}</div>;
  }

  return (
    <ComponentWrapper component={component} blockId={blockId}>
        {content}
    </ComponentWrapper>
  );
};

export const getComponentSchema = (type: ComponentType) => {
    switch (type) {
        case 'text':
            return {
                type: 'text',
                defaultProps: {
                    content: 'New Text',
                    className: 'text-base text-foreground',
                },
                defaultStyle: {}
            };
        case 'button':
            return {
                type: 'button',
                defaultProps: {
                    content: { text: 'New Button' },
                    className: '',
                },
                defaultStyle: { variant: 'default', size: 'default' }
            };
        case 'image':
            return {
                type: 'image',
                defaultProps: {
                    src: '',
                    alt: 'New Image',
                    className: 'rounded-lg overflow-hidden w-full h-auto object-cover'
                },
                defaultStyle: {}
            };
        case 'row':
            return {
                type: 'row',
                defaultProps: {
                    gap: '16',
                    alignItems: 'center',
                    className: ''
                },
                defaultStyle: {}
            };
    }
}
