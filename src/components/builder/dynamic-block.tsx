"use client";

import React from "react";
import { RenderBlock } from "./block-registry";
import { BlockInstance } from "@/lib/builder-types";

export function DynamicBlock({ block }: { block: BlockInstance }) {
  return <RenderBlock block={block} />;
}


