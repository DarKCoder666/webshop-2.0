"use client";

import React from "react";
import { AnimatedBackground } from "@/components/motion-primitives/animated-background";
import { BLOCK_SCHEMAS, getSchema } from "./block-registry";
import { MorphingPopover, MorphingPopoverContent, MorphingPopoverTrigger } from "@/components/motion-primitives/morphing-popover";

type TopSelectorProps = {
  currentType: string;
  onSelect: (type: string) => void;
};

export function TopSelector({ currentType, onSelect }: TopSelectorProps) {
  return (
    <div className="fixed top-3 left-0 right-0 z-50 flex justify-center">
      <MorphingPopover>
        <MorphingPopoverTrigger asChild>
          <button className="rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-sm shadow-sm backdrop-blur hover:bg-white">
            {getSchema(currentType as any)?.label || "Select Block"}
          </button>
        </MorphingPopoverTrigger>
        <MorphingPopoverContent className="px-2 py-2">
          <AnimatedBackground className="rounded-md bg-zinc-100" enableHover>
            {BLOCK_SCHEMAS.map((schema) => (
              <button
                key={schema.type}
                data-id={schema.type}
                className="flex w-full items-center justify-between gap-4 rounded-md px-3 py-2 text-left text-sm hover:bg-transparent"
                onClick={() => onSelect(schema.type)}
              >
                <span>{schema.label}</span>
                {currentType === schema.type && (
                  <span className="text-xs text-emerald-600">Selected</span>
                )}
              </button>
            ))}
          </AnimatedBackground>
        </MorphingPopoverContent>
      </MorphingPopover>
    </div>
  );
}


