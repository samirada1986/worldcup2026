"use client";

import Image from "next/image";
import { clsx } from "clsx";
import type { Artwork } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { blur } from "@/lib/blur";
import { useLightbox } from "./LightboxProvider";

/**
 * A single artwork. Preserves the image's own aspect ratio (never cropped),
 * opens the lightbox on click, and carries an optional restrained caption.
 */
export default function Figure({
  items,
  index,
  locale,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  className,
  imgClassName,
  showCaption = true,
  plate,
}: {
  items: Artwork[];
  index: number;
  locale: Locale;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  showCaption?: boolean;
  plate?: string;
}) {
  const { open } = useLightbox();
  const art = items[index];

  return (
    <figure className={clsx("group", className)}>
      <button
        type="button"
        onClick={() => open(items, index, locale)}
        className="relative block w-full cursor-zoom-in overflow-hidden bg-paper-deep"
        aria-label={art.alt[locale]}
      >
        <Image
          src={art.src}
          alt={art.alt[locale]}
          width={art.w}
          height={art.h}
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          blurDataURL={blur[art.src]}
          className={clsx(
            "h-auto w-full transition-[transform,filter] duration-[1.1s] ease-quiet group-hover:scale-[1.012]",
            imgClassName
          )}
        />
      </button>
      {showCaption && (art.caption || plate) && (
        <figcaption className="caption mt-3 flex items-baseline gap-3">
          {plate && <span className="text-stone-light tabular-nums">{plate}</span>}
          {art.caption && <span>{art.caption[locale]}</span>}
        </figcaption>
      )}
    </figure>
  );
}
