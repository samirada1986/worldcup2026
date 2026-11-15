"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useReveal } from "./useReveal";

/**
 * Text reveal: opacity only, short, once. (Photographs use the "mask" unveil inside <Figure>.)
 * `y` is accepted for backwards compatibility and ignored — nothing on this site slides.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "figure" | "section" | "span" | "header";
}) {
  const { ref, state } = useReveal<HTMLElement>();
  const Tag = as as ElementType;
  return (
    <Tag
      ref={ref}
      data-reveal="fade"
      data-state={state}
      style={{ "--d": `${delay}s` } as CSSProperties}
      className={className}
    >
      {children}
    </Tag>
  );
}
