import { clsx } from "clsx";
import type { Artwork, LayoutMode } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { plateId, plateNo } from "@/lib/format";
import Figure from "./Figure";
import Reveal from "./Reveal";

type Row =
  | { kind: "large"; at: number }
  | { kind: "left" | "right"; at: number }
  | { kind: "pair"; at: [number, number] };

/**
 * Turns an ordered list of photographs into an editorial sequence.
 * The artist controls the ORDER and may give any photograph a hint:
 *   large / pair (with the next one) / left / right / auto.
 * "auto" lets the rhythm fall out of the order: a large opening plate, then pairs,
 * with single plates alternating sides.
 */
export function composeEditorial(images: Artwork[]): Row[] {
  const rows: Row[] = [];
  let side: "left" | "right" = "left";
  for (let i = 0; i < images.length; ) {
    const h = images[i].hint ?? "auto";
    const next = images[i + 1];
    const nextIsSolo = next && ["large", "left", "right"].includes(next.hint ?? "");
    if (h === "large" || (i === 0 && h === "auto")) {
      rows.push({ kind: "large", at: i }); i++;
    } else if (h === "left" || h === "right") {
      rows.push({ kind: h, at: i }); side = h === "left" ? "right" : "left"; i++;
    } else if ((h === "pair" || h === "auto") && next && !nextIsSolo) {
      rows.push({ kind: "pair", at: [i, i + 1] }); i += 2;
    } else {
      rows.push({ kind: side, at: i }); side = side === "left" ? "right" : "left"; i++;
    }
  }
  return rows;
}

export default function Sequence({
  images,
  mode,
  locale,
}: {
  images: Artwork[];
  mode: LayoutMode;
  locale: Locale;
}) {
  const fig = (i: number, extra?: { className?: string; sizes?: string; priority?: boolean; delay?: number }) => (
    <Figure
      id={plateId(i)}
      items={images}
      index={i}
      locale={locale}
      plate={plateNo(i, locale)}
      className={extra?.className}
      sizes={extra?.sizes}
      priority={extra?.priority}
      delay={extra?.delay}
    />
  );

  /* ── Visual essay: one photograph at a time, long pauses ── */
  if (mode === "essay") {
    return (
      <div className="flex flex-col items-center gap-24 sm:gap-40">
        {images.map((_, i) => (
          <div key={i} className="w-full">
            {fig(i, { className: "mx-auto", priority: i === 0 })}
          </div>
        ))}
      </div>
    );
  }

  /* ── Research archive: photograph beside its note ── */
  if (mode === "archive") {
    return (
      <div className="flex flex-col gap-20 sm:gap-32">
        {images.map((art, i) => {
          const flip = i % 2 === 1;
          const note = art.text?.[locale] ?? [];
          return (
            <div key={i} className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
              <div className={clsx("lg:col-span-7", flip && "lg:order-2")}>{fig(i)}</div>
              <Reveal className={clsx("lg:col-span-4", flip ? "lg:order-1 lg:col-start-2" : "lg:col-start-9")}>
                {note.length > 0 && (
                  <div className="prose-quiet">
                    {note.map((t, k) => (
                      <p key={k} className="!text-ui">{t}</p>
                    ))}
                  </div>
                )}
              </Reveal>
            </div>
          );
        })}
      </div>
    );
  }

  /* ── Editorial sequence: singles, pairs, offsets ── */
  const rows = composeEditorial(images);
  return (
    <div className="flex flex-col gap-20 sm:gap-32 lg:gap-40">
      {rows.map((row, r) => {
        if (row.kind === "pair") {
          const [a, b] = row.at;
          // Reading order is never swapped; only which plate drops lower alternates.
          const reversed = r % 2 === 1;
          return (
            <div key={r} className="grid gap-12 sm:grid-cols-2 sm:gap-10 lg:gap-16">
              {/* On a phone the pair stays a pair: the second plate steps in from the edge instead of stacking identically. */}
              <div className={clsx(reversed && "sm:mt-24")}>
                {fig(a, { sizes: "(max-width: 640px) 100vw, 46vw" })}
              </div>
              <div className={clsx("ms-auto w-[84%] sm:w-full", !reversed && "sm:mt-24")}>
                {fig(b, { sizes: "(max-width: 640px) 84vw, 46vw", delay: 0.12 })}
              </div>
            </div>
          );
        }
        if (row.kind === "large") {
          return (
            <div key={r} className="w-full lg:w-[88%]">
              {fig(row.at, { priority: row.at === 0, sizes: "(max-width: 1024px) 100vw, 88vw" })}
            </div>
          );
        }
        return (
          <div key={r} className={clsx("w-full lg:w-[64%]", row.kind === "right" && "lg:ms-auto")}>
            {fig(row.at, { sizes: "(max-width: 1024px) 100vw, 64vw" })}
          </div>
        );
      })}
    </div>
  );
}
