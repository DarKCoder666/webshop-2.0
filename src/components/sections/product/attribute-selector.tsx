'use client';

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { ProductVariation } from '@/lib/product-types';

export type AttributeSelectorProps = {
  variations: ProductVariation[];
  className?: string;
  onSelectionChange?: (selection: Record<string, string>) => void;
  onSelectedVariationChange?: (variation: ProductVariation | undefined) => void;
  initialSelection?: Record<string, string>;
};

type AttributeMap = Record<string, string[]>;

function getAttributeNames(variations: ProductVariation[]): string[] {
  const names = new Set<string>();
  for (const v of variations) {
    for (const key of Object.keys(v.attributes || {})) names.add(key);
  }
  return Array.from(names);
}

function buildAttributeMap(variations: ProductVariation[]): AttributeMap {
  const map: AttributeMap = {};
  for (const v of variations) {
    for (const [k, val] of Object.entries(v.attributes || {})) {
      if (!map[k]) map[k] = [];
      if (!map[k].includes(val)) map[k].push(val);
    }
  }
  // Stable sort for deterministic UI
  for (const k of Object.keys(map)) map[k].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  return map;
}

function matchesConstraints(
  variation: ProductVariation,
  constraints: Record<string, string | undefined>
): boolean {
  for (const [k, val] of Object.entries(constraints)) {
    if (!val) continue;
    if ((variation.attributes || {})[k] !== val) return false;
  }
  return true;
}

function findMatchingVariations(
  variations: ProductVariation[],
  constraints: Record<string, string | undefined>
): ProductVariation[] {
  return variations.filter((v) => matchesConstraints(v, constraints));
}

export default function AttributeSelector({
  variations,
  className,
  onSelectionChange,
  onSelectedVariationChange,
  initialSelection,
}: AttributeSelectorProps) {
  const attributeNames = React.useMemo(() => getAttributeNames(variations), [variations]);
  const attributeMap = React.useMemo(() => buildAttributeMap(variations), [variations]);

  const [selection, setSelection] = React.useState<Record<string, string>>(() => ({ ...(initialSelection || {}) }));

  // Compute availability per attribute value given current partial selection
  const availability = React.useMemo(() => {
    const result: Record<string, Record<string, boolean>> = {};
    for (const name of attributeNames) {
      result[name] = {};
      const values = attributeMap[name] || [];
      for (const value of values) {
        const constraints: Record<string, string | undefined> = { ...selection, [name]: value };
        const matches = findMatchingVariations(variations, constraints).filter((v) => v.quantity > 0);
        result[name][value] = matches.length > 0;
      }
    }
    return result;
  }, [attributeNames, attributeMap, selection, variations]);

  // Determine selected variation if all attributes selected and a match exists
  const selectedVariation = React.useMemo(() => {
    const keysSelected = Object.keys(selection).filter((k) => selection[k]);
    if (keysSelected.length === attributeNames.length && attributeNames.length > 0) {
      const matches = findMatchingVariations(variations, selection);
      // Prefer in-stock
      return matches.find((v) => v.quantity > 0) || matches[0];
    }
    return undefined;
  }, [selection, attributeNames, variations]);

  React.useEffect(() => {
    onSelectionChange?.(selection);
  }, [selection, onSelectionChange]);

  React.useEffect(() => {
    onSelectedVariationChange?.(selectedVariation);
  }, [selectedVariation, onSelectedVariationChange]);

  const handlePick = (name: string, value: string) => {
    setSelection((prev) => {
      const alreadySelected = prev[name] === value;
      const next: Record<string, string> = { ...prev };
      if (alreadySelected) delete next[name];
      else next[name] = value;

      // Optional: prune impossible selections on other attributes
      for (const other of attributeNames) {
        if (other === name) continue;
        const val = next[other];
        if (!val) continue;
        const constraints: Record<string, string | undefined> = { ...next };
        const matches = findMatchingVariations(variations, constraints).filter((v) => v.quantity > 0);
        if (matches.length === 0) {
          delete next[other];
        }
      }

      return next;
    });
  };

  if (attributeNames.length === 0) return null;

  return (
    <div className={cn('space-y-4', className)}>
      {attributeNames.map((name) => {
        const values = attributeMap[name] || [];
        return (
          <div key={name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-foreground">
                {name}
              </div>
              {selection[name] && (
                <div className="text-xs text-muted-foreground">Выбрано: {selection[name]}</div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {values.map((val) => {
                const isSelected = selection[name] === val;
                const isAvailable = availability[name]?.[val] ?? false;

                return (
                  <motion.button
                    key={val}
                    type="button"
                    onClick={() => isAvailable && handlePick(name, val)}
                    className={cn(
                      'relative rounded-md border px-3 py-1.5 text-sm transition-colors cursor-pointer',
                      isSelected
                        ? 'border-primary bg-primary/5 text-foreground'
                        : 'border-border bg-card text-foreground hover:border-muted-foreground',
                      !isAvailable && 'opacity-50 grayscale pointer-events-none'
                    )}
                    whileHover={isAvailable ? { scale: 1.02 } : undefined}
                    whileTap={isAvailable ? { scale: 0.98 } : undefined}
                    aria-pressed={isSelected}
                    aria-disabled={!isAvailable}
                  >
                    {val}
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Compact summary */}
      {selectedVariation && (
        <div className="rounded-md border border-border bg-card p-3 text-sm text-muted-foreground">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {Object.entries(selectedVariation.attributes).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1">
                <span className="text-muted-foreground">{k}:</span>
                <span className="font-medium text-foreground">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


