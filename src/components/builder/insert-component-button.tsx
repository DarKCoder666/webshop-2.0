"use client";

import React from "react";
import { ComponentSelectorDialog } from "./component-selector-dialog";
import { ComponentType } from "@/lib/builder-types";

export function InsertComponentButton({ onPick }: { onPick: (type: ComponentType) => void }) {
    return <ComponentSelectorDialog onPick={onPick} />;
}

