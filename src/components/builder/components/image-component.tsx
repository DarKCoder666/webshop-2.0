"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { ComponentInstance } from "@/lib/builder-types";
import { useBuilder } from "../builder-context";
import { ImageManagerDialog, EmptyImageState, ImageData } from "@/components/image-manager-dialog";
import { Settings, AlignCenter, AlignLeft, AlignRight, StretchHorizontal, StretchVertical, RectangleHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ImageComponent({ component, blockId }: { component: ComponentInstance; blockId: string }) {
  const { isBuilder, updateComponent } = useBuilder();
  const src = (component.props.src as string) || "";
  const alt = (component.props.alt as string) || "";
  
  // Style props
  const width = (component.style?.width as string) || "100%";
  const height = (component.style?.height as string) || "auto";
  const objectFit = (component.style?.objectFit as string) || "cover";
  const borderRadius = (component.style?.borderRadius as string) || "8px";
  const flexGrow = (component.style?.flexGrow as number) || 1; // Default to grow in flex containers

  const handleImageSelection = (selectedImages: ImageData[]) => {
      if (selectedImages.length > 0) {
          updateComponent(blockId, component.id, {
              props: {
                  ...component.props,
                  src: selectedImages[0].url,
                  alt: selectedImages[0].name
              }
          });
      }
  };

  const updateStyle = (newStyle: React.CSSProperties) => {
      updateComponent(blockId, component.id, {
          style: { ...component.style, ...newStyle }
      });
  };

  const imageContent = src ? (
      <div className="relative w-full h-full">
          <Image
            src={src}
            alt={alt}
            width={800}
            height={600}
            className="w-full h-full"
            style={{
                objectFit: objectFit as any,
                width: '100%',
                height: '100%',
                borderRadius: borderRadius
            }}
          />
      </div>
  ) : (
       <div className="h-64 bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg cursor-pointer w-full">
           <EmptyImageState onOpenManager={() => {}} />
       </div>
  );

  if (isBuilder) {
      return (
          <div className="relative group/image w-full" style={{ flexGrow, flexBasis: '0', minWidth: '200px' }}>
              <ImageManagerDialog
                maxImages={1}
                initialSelectedImages={src ? [{ id: src, url: src, name: alt, size: 0 }] : []}
                onSelectionChange={handleImageSelection}
                className={component.props.className as string}
                triggerOnChildClick={true}
              >
                  <div style={{ width, height }} className="relative">
                      {imageContent}
                  </div>
              </ImageManagerDialog>
              
              {/* Image Settings Toolbar */}
              <div className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity z-40">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8 shadow-md" onClick={(e) => e.stopPropagation()}>
                            <Settings className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" onClick={(e) => e.stopPropagation()}>
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Image Settings</h4>
                                <p className="text-sm text-muted-foreground">Adjust dimensions and display options.</p>
                            </div>
                            <div className="grid gap-2">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="width">Width</Label>
                                    <Input
                                        id="width"
                                        defaultValue={width}
                                        className="col-span-2 h-8"
                                        onChange={(e) => updateStyle({ width: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="height">Height</Label>
                                    <Input
                                        id="height"
                                        defaultValue={height}
                                        className="col-span-2 h-8"
                                        onChange={(e) => updateStyle({ height: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="radius">Radius</Label>
                                    <Input
                                        id="radius"
                                        defaultValue={borderRadius}
                                        className="col-span-2 h-8"
                                        onChange={(e) => updateStyle({ borderRadius: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="fit">Object Fit</Label>
                                    <Select 
                                        defaultValue={objectFit} 
                                        onValueChange={(val) => updateStyle({ objectFit: val })}
                                    >
                                        <SelectTrigger className="col-span-2 h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cover">Cover</SelectItem>
                                            <SelectItem value="contain">Contain</SelectItem>
                                            <SelectItem value="fill">Fill</SelectItem>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="scale-down">Scale Down</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
              </div>
          </div>
      );
  }

  if (!src) return null;

  return (
    <div style={{ width, height, flexGrow, flexBasis: '0', minWidth: '200px' }} className={component.props.className as string}>
        <Image
            src={src}
            alt={alt}
            width={800}
            height={600}
            className="w-full h-full"
            style={{
                objectFit: objectFit as any,
                borderRadius: borderRadius
            }}
        />
    </div>
  );
}
