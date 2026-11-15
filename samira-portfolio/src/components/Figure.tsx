"use client";

import Image from "next/image";
import { clsx } from "clsx";
import type { CSSProperties } from "react";
import type { Artwork } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { useLightbox } from "./LightboxProvider";
import { useReveal } from "./useReveal";

/**
 * One photograph, treated as an object.
 *
 *  - Never cropped: the image keeps its own aspect ratio.
 *  - Never enlarged past its own pixel width, so a small file is never stretched soft.
 *  - Unveils once with a slow mask; opens the viewer on click.
 *  - Caption shows the plate number and only text the artist supplied.
 */
export default function Figure({
  items,
  index,
  locale,
  sizes,
  priority = false,
  className,
  plate,
  showCaption = true,
  delay = 0,
  id,
}: {
  items: Artwork[];
  index: number;
  locale: Locale;
  /** Override the responsive `sizes` hint (e.g. when the photograph sits in a narrow column). */
  sizes?: string;
  priority?: boolean;
  className?: string;
  plate?: string;
  showCaption?: boolean;
  delay?: number;
  id?: string;
}) {
  const { open } = useLightbox();
  const art = items[index];
  const { ref, state } = useReveal<HTMLButtonElement>();
  const hint = sizes ?? `(max-width: ${art.w}px) 100vw, ${art.w}px`;

  return (
    <figure id={id} className={clsx("group scroll-mt-24", className)} style={{ maxWidth: art.w }}>
      <button
        ref={ref}
        type="button"
        onClick={() => open(items, index, locale)}
        data-reveal="mask"
        data-state={priority ? "visible" : state}
        style={{ "--d": `${delay}s` } as CSSProperties}
        className="relative block w-full cursor-zoom-in overflow-hidden bg-paper-deep"
        aria-label={art.alt[locale]}
      >
        <Image
          src={art.src}
          alt={art.alt[locale]}
          width={art.w}
          height={art.h}
          sizes={hint}
          priority={priority}
          placeholder={art.blur ? "blur" : "empty"}
          blurDataURL={art.blur}
          className="h-auto w-full"
        />
      </button>
      {showCaption && (art.caption || plate) && (
        <figcaption className="caption mt-3 flex items-baseline gap-3">
          {plate && (
            <span className="tabular-nums text-stone-light transition-colors duration-500 group-hover:text-ink">
              {plate}
            </span>
          )}
          {art.caption && <span>{art.caption[locale]}</span>}
        </figcaption>
      )}
    </figure>
  );
}
