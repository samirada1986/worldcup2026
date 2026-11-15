import Image from "next/image";
import Link from "next/link";
import type { Artwork } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { plateId, plateNo } from "@/lib/format";

/**
 * A quiet index of plates, like the contact page of a photobook.
 * Every photograph keeps its own proportion; hovering one softens the others.
 * It is also navigation: each plate links to its place in the sequence.
 */
export default function IndexStrip({
  images,
  base,
  locale,
}: {
  images: Artwork[];
  /** Path of the series page, e.g. "/en/works/documentary". */
  base: string;
  locale: Locale;
}) {
  return (
    <ul className="group/strip no-scrollbar -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 sm:-mx-10 sm:gap-4 sm:px-10">
      {images.map((art, i) => (
        <li key={art.src} className="shrink-0 snap-start">
          <Link
            href={`${base}#${plateId(i)}`}
            aria-label={`${plateNo(i, locale)} — ${art.alt[locale]}`}
            className="block opacity-100 transition-opacity duration-500 group-hover/strip:opacity-45 hover:!opacity-100 focus-visible:!opacity-100"
          >
            <Image
              src={art.src}
              alt=""
              width={art.w}
              height={art.h}
              sizes="160px"
              placeholder={art.blur ? "blur" : "empty"}
              blurDataURL={art.blur}
              className="h-[72px] w-auto bg-paper-deep sm:h-[96px]"
            />
            <span className="caption mt-2 block tabular-nums text-stone-light">{plateNo(i, locale)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
