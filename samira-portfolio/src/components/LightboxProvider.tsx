"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Artwork } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

type Ctx = { open: (items: Artwork[], index: number, locale: Locale) => void };
const LightboxContext = createContext<Ctx>({ open: () => {} });
export const useLightbox = () => useContext(LightboxContext);

const T = {
  en: { close: "Close", prev: "Previous photograph", next: "Next photograph", of: "of" },
  fa: { close: "بستن", prev: "تصویر قبلی", next: "تصویر بعدی", of: "از" },
} as const;

export default function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Artwork[] | null>(null);
  const [index, setIndex] = useState(0);
  const [locale, setLocale] = useState<Locale>("en");
  const [shown, setShown] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);

  const open = useCallback((it: Artwork[], i: number, l: Locale) => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setItems(it);
    setIndex(i);
    setLocale(l);
    requestAnimationFrame(() => setShown(true));
  }, []);

  const close = useCallback(() => {
    setShown(false);
    window.setTimeout(() => {
      setItems(null);
      returnFocus.current?.focus?.();
    }, 260);
  }, []);

  const n = items?.length ?? 0;
  const next = useCallback(() => setIndex((i) => (n ? (i + 1) % n : i)), [n]);
  const prev = useCallback(() => setIndex((i) => (n ? (i - 1 + n) % n : i)), [n]);

  useEffect(() => {
    if (!items) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const rtl = locale === "fa";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") (rtl ? prev : next)();
      else if (e.key === "ArrowLeft") (rtl ? next : prev)();
      else if (e.key === "Tab") {
        // keep focus inside the dialog
        const f = Array.from(document.querySelectorAll<HTMLElement>("[data-lb] button"));
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [items, next, prev, close, locale]);

  const current = items?.[index];
  const neighbour = items && items.length > 1 ? items[(index + 1) % items.length] : null;
  const t = T[locale];
  const fmt = (v: number) => (locale === "fa" ? v.toLocaleString("fa-IR", { minimumIntegerDigits: 2 }) : String(v).padStart(2, "0"));

  return (
    <LightboxContext.Provider value={{ open }}>
      {children}
      {current && items && (
        <div
          data-lb
          role="dialog"
          aria-modal="true"
          aria-label={current.alt[locale]}
          dir={locale === "fa" ? "rtl" : "ltr"}
          onClick={close}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) {
              const forward = locale === "fa" ? dx > 0 : dx < 0;
              (forward ? next : prev)();
            }
          }}
          className="fixed inset-0 z-[100] flex flex-col transition-opacity duration-300"
          style={{ backgroundColor: "rgb(18 15 12 / 0.97)", opacity: shown ? 1 : 0 }}
        >
          <div className="flex items-center justify-between px-5 py-4 text-paper/70">
            <span className="font-sans text-caption tabular-nums tracking-[0.18em]">
              {fmt(index + 1)} / {fmt(items.length)}
            </span>
            <button
              ref={closeRef}
              onClick={(e) => { e.stopPropagation(); close(); }}
              className="font-sans text-caption uppercase tracking-[0.18em] text-paper/70 transition-colors hover:text-paper"
            >
              {t.close} ✕
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-16" onClick={(e) => e.stopPropagation()}>
            {items.length > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label={t.prev}
                  className="absolute start-1 z-10 flex h-11 w-11 items-center justify-center text-paper/60 transition-colors hover:text-paper sm:start-4"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="rtl:rotate-180"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <button
                  onClick={next}
                  aria-label={t.next}
                  className="absolute end-1 z-10 flex h-11 w-11 items-center justify-center text-paper/60 transition-colors hover:text-paper sm:end-4"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="rtl:rotate-180"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </>
            )}

            <figure key={current.src} className="flex max-h-full flex-col items-center" style={{ maxWidth: current.w }}>
              <Image
                src={current.src}
                alt={current.alt[locale]}
                width={current.w}
                height={current.h}
                sizes={`(max-width: ${current.w}px) 100vw, ${current.w}px`}
                placeholder={current.blur ? "blur" : "empty"}
                blurDataURL={current.blur}
                priority
                className="max-h-[76vh] w-auto max-w-full object-contain"
              />
              {current.caption && (
                <figcaption className="caption mt-4 text-center text-paper/55">{current.caption[locale]}</figcaption>
              )}
            </figure>
            {/* warm the next photograph */}
            {neighbour && (
              <Image src={neighbour.src} alt="" width={neighbour.w} height={neighbour.h} sizes={`${neighbour.w}px`} className="pointer-events-none absolute h-px w-px opacity-0" aria-hidden />
            )}
          </div>
        </div>
      )}
    </LightboxContext.Provider>
  );
}
