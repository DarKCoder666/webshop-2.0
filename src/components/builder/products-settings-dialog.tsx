"use client";

import React from "react";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogTitle,
} from "@/components/motion-primitives/morphing-dialog";
import { Input } from "@/components/ui/input";
import { ShoppingBag } from "lucide-react";
import { BlockInstance } from "@/lib/builder-types";
import { cn } from "@/lib/utils";

type ProductsSettingsDialogProps = {
  block: BlockInstance;
  onSave: (props: Record<string, unknown>) => void;
};

export function ProductsSettingsDialog({ block, onSave }: ProductsSettingsDialogProps) {
  const initial = (block.props || {}) as any;
  const [itemsToShow, setItemsToShow] = React.useState<number>(initial.itemsToShow ?? 6);
  const [itemsPerRow, setItemsPerRow] = React.useState<number>(initial.itemsPerRow ?? 3);
  const [cardVariant, setCardVariant] = React.useState<string>(initial.cardVariant ?? "v1");
  const [imageAspect, setImageAspect] = React.useState<string>(initial.imageAspect ?? '4:3');

  const handleSave = async () => {
    await Promise.resolve(onSave({ 
      itemsToShow: Math.max(1, Math.floor(Number(itemsToShow) || 1)),
      itemsPerRow: Math.min(5, Math.max(2, Math.floor(Number(itemsPerRow) || 3))),
      cardVariant,
      imageAspect,
    }));
    setTimeout(() => {
      const closeButton = document.querySelector('[aria-label="Close dialog"]') as HTMLButtonElement | null;
      closeButton?.click();
    }, 50);
  };

  return (
    <MorphingDialog>
      <MorphingDialogTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-card-foreground hover:bg-muted">
        <ShoppingBag className="h-4 w-4" />
      </MorphingDialogTrigger>

      <MorphingDialogContainer>
        <MorphingDialogContent className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full mx-4">
          <MorphingDialogClose />
          <div className="p-6 space-y-6">
            <MorphingDialogTitle className="text-lg font-semibold">Products Settings</MorphingDialogTitle>

            <div className="space-y-2">
              <label className="text-xs font-medium">Number of items to show</label>
              <Input
                type="number"
                min={1}
                value={itemsToShow}
                onChange={(e) => setItemsToShow(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Items per row (desktop)</label>
              <Input
                type="number"
                min={2}
                max={5}
                value={itemsPerRow}
                onChange={(e) => setItemsPerRow(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Mobile and tablet remain adaptive.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Card variant</label>
              <div className="grid grid-cols-2 gap-2">
                {(["v1", "v2", "v3", "v4"] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCardVariant(v)}
                    className={cn("rounded-md border px-3 py-2 text-sm", cardVariant === v ? "border-primary bg-primary/10" : "border-border")}
                  >
                    {v.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Image ratio</label>
              <div className="grid grid-cols-5 gap-2">
                {(["1:1", "3:4", "4:3", "9:16", "16:9"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setImageAspect(r)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-md border p-2 hover:bg-muted transition-colors",
                      imageAspect === r ? "border-primary bg-primary/10" : "border-border"
                    )}
                    aria-label={`Set ratio ${r}`}
                  >
                    <div
                      className={cn(
                        "w-full overflow-hidden rounded-md bg-muted",
                        r === "1:1"
                          ? "aspect-square"
                          : r === "3:4"
                          ? "aspect-[3/4]"
                          : r === "4:3"
                          ? "aspect-[4/3]"
                          : r === "9:16"
                          ? "aspect-[9/16]"
                          : "aspect-[16/9]"
                      )}
                    >
                      <div className="h-full w-full bg-gradient-to-br from-card via-muted to-card" />
                    </div>
                    <span className="text-[11px] text-muted-foreground">{r}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Applies to all card variants.</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Save
              </button>
            </div>
          </div>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}


