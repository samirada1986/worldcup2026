"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Artwork } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { blur } from "@/lib/blur";

type Ctx = { open: (items: Artwork[], index: number, locale: Locale) => void };
const LightboxContext = createContext<Ctx>({ open: () => {} });
export const useLightbox = () => useContext(LightboxContext);

export default function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Artwork[] | null>(null);
  const [index, setIndex] = useState(0);
  const [locale, setLocale] = useState<Locale>("en");
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  const open = useCallback((it: Artwork[], i: number, l: Locale) => {
    setItems(it);
    setIndex(i);
    setLocale(l);
  }, []);
  const close = useCallback(() => setItems(null), []);

  const next = useCallback(
    () => setIndex((i) => (items ? (i + 1) % items.length : i)),
    [items]
  );
  const prev = useCallback(
    () => setIndex((i) => (items ? (i - 1 + items.length) % items.length : i)),
    [items]
  );

  useEffect(() => {
    if (!items) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") {
        if (locale === "fa") prev();
        else next();
      } else if (e.key === "ArrowLeft") {
        if (locale === "fa") next();
        else prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [items, next, prev, close, locale]);

  const current = items?.[index];

  return (
    <LightboxContext.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {current && items && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={current.alt[locale]}
            className="fixed inset-0 z-[100] flex flex-col backdrop-blur-sm"
            style={{ backgroundColor: "rgb(18 15 12 / 0.975)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={close}
          >
            <div className="flex items-center justify-between px-5 py-4 text-paper/70">
              <span className="font-sans text-xs tracking-[0.2em]">
                {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
              <button
                ref={closeRef}
                onClick={close}
                className="font-sans text-xs uppercase tracking-[0.2em] text-paper/70 hover:text-paper transition-colors"
                aria-label={locale === "fa" ? "بستن" : "Close"}
              >
                {locale === "fa" ? "بستن ✕" : "Close ✕"}
              </button>
            </div>

            <div
              className="relative flex flex-1 items-center justify-center px-4 pb-4 sm:px-14"
              onClick={(e) => e.stopPropagation()}
            >
              {items.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label={locale === "fa" ? "قبلی" : "Previous"}
                    className="absolute left-2 sm:left-5 z-10 flex h-11 w-11 items-center justify-center rounded-full text-paper/60 hover:text-paper hover:bg-paper/5 transition-colors"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button
                    onClick={next}
                    aria-label={locale === "fa" ? "بعدی" : "Next"}
                    className="absolute right-2 sm:right-5 z-10 flex h-11 w-11 items-center justify-center rounded-full text-paper/60 hover:text-paper hover:bg-paper/5 transition-colors"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </>
              )}

              <motion.figure
                key={current.src}
                className="flex max-h-full max-w-5xl flex-col items-center"
                initial={reduce ? {} : { opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={current.src}
                  alt={current.alt[locale]}
                  width={current.w}
                  height={current.h}
                  placeholder="blur"
                  blurDataURL={blur[current.src]}
                  sizes="100vw"
                  className="max-h-[78vh] w-auto object-contain"
                />
                {current.caption && (
                  <figcaption className="caption mt-4 text-center text-paper/55">
                    {current.caption[locale]}
                  </figcaption>
                )}
              </motion.figure>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </LightboxContext.Provider>
  );
}
