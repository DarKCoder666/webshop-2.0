"use client";

import React from "react";
import { Package } from "lucide-react";

interface ProductPlaceholderProps {
  className?: string;
  size?: number;
}

export function ProductPlaceholder({ className = "", size = 120 }: ProductPlaceholderProps) {
  return (
    <div 
      className={`flex items-center justify-center bg-gradient-to-br from-muted via-muted/50 to-muted rounded-lg ${className}`}
      style={{ minHeight: size }}
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Package size={size / 3} strokeWidth={1.5} />
        <span className="text-xs font-medium">No Image</span>
      </div>
    </div>
  );
}

export default ProductPlaceholder;
