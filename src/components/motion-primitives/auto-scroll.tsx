"use client";

import React from "react";
import { cn } from "@/lib/utils";

type AutoScrollProps = {
  children: React.ReactNode;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  durationSec?: number;
  className?: string;
  contentClassName?: string;
};

export function AutoScroll({
  children,
  direction = "vertical",
  reverse = false,
  durationSec = 20,
  className,
  contentClassName,
}: AutoScrollProps) {
  const keyframeName = direction === "vertical" ? "auto-scroll-y" : "auto-scroll-x";
  const animationName = `${keyframeName}-${reverse ? "rev" : "fwd"}`;
  const items = React.Children.toArray(children);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <style>{`
@keyframes auto-scroll-y-fwd { from { transform: translateY(0); } to { transform: translateY(-50%); } }
@keyframes auto-scroll-y-rev { from { transform: translateY(-50%); } to { transform: translateY(0); } }
@keyframes auto-scroll-x-fwd { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes auto-scroll-x-rev { from { transform: translateX(-50%); } to { transform: translateX(0); } }
      `}</style>
      <div
        className={cn(direction === "vertical" ? "flex flex-col" : "flex", contentClassName)}
        style={{
          animation: `${animationName} ${durationSec}s linear infinite`,
          willChange: "transform",
        }}
      >
        {items.map((child, idx) => (
          <React.Fragment key={`a-${idx}`}>{child}</React.Fragment>
        ))}
        {items.map((child, idx) => (
          <React.Fragment key={`b-${idx}`}>{child}</React.Fragment>
        ))}
      </div>
    </div>
  );
}


