"use client";

import React from "react";
import { BlockType } from "@/lib/builder-types";
import { BlockSelectorDialog } from "./block-selector-dialog";

export function InsertBlockButton({ onPick }: { onPick: (type: BlockType) => void }) {
  return <BlockSelectorDialog onPick={onPick} />;
}


