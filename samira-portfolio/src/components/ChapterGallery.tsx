"use client";

import { clsx } from "clsx";
import type { Artwork, Chapter } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import Figure from "./Figure";
import Reveal from "./Reveal";

export default function ChapterGallery({
  images,
  mode = "single",
  locale,
}: {
  images: Artwork[];
  mode?: Chapter["mode"];
  locale: Locale;
}) {
  if (mode === "diptych") {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
        {images.map((_, i) => (
          <Reveal key={i} delay={i * 0.08} as="figure">
            <Figure items={images} index={i} locale={locale} sizes="(max-width:768px) 100vw, 45vw" />
          </Reveal>
        ))}
      </div>
    );
  }

  if (mode === "grid") {
    return (
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-8 lg:grid-cols-3">
        {images.map((_, i) => (
          <Reveal key={i} delay={(i % 3) * 0.07} as="figure">
            <Figure items={images} index={i} locale={locale} sizes="(max-width:640px) 45vw, (max-width:1024px) 30vw, 28vw" />
          </Reveal>
        ))}
      </div>
    );
  }

  if (mode === "fullbleed") {
    return (
      <div className="flex flex-col gap-14 sm:gap-20">
        {images.map((art, i) => {
          const feature = art.feature || i === 0;
          return (
            <Reveal key={i} as="figure" className={clsx(!feature && "mx-auto w-full max-w-4xl")}>
              <Figure
                items={images}
                index={i}
                locale={locale}
                sizes={feature ? "100vw" : "(max-width:1024px) 100vw, 60vw"}
              />
            </Reveal>
          );
        })}
      </div>
    );
  }

  if (mode === "stagger") {
    return (
      <div className="flex flex-col gap-16 sm:gap-24">
        {images.map((art, i) => {
          const feature = art.feature || i === 0;
          const align =
            feature ? "mx-auto max-w-5xl" : i % 2 === 1 ? "sm:ms-auto sm:me-0 sm:max-w-2xl" : "sm:me-auto sm:ms-0 sm:max-w-2xl";
          return (
            <Reveal key={i} as="figure" className={clsx("w-full", align)}>
              <Figure
                items={images}
                index={i}
                locale={locale}
                sizes={feature ? "(max-width:1024px) 100vw, 80vw" : "(max-width:1024px) 100vw, 45vw"}
              />
            </Reveal>
          );
        })}
      </div>
    );
  }

  // single
  return (
    <div className="mx-auto max-w-4xl">
      {images.map((_, i) => (
        <Reveal key={i} as="figure">
          <Figure items={images} index={i} locale={locale} sizes="(max-width:1024px) 100vw, 60vw" />
        </Reveal>
      ))}
    </div>
  );
}
