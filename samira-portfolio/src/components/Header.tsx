"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { type Locale, getDict } from "@/lib/i18n";
import { href, navItems } from "@/lib/nav";
import { site } from "@/content/site";
import LocaleSwitcher from "./LocaleSwitcher";

export default function Header({ locale }: { locale: Locale }) {
  const d = getDict(locale);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const items = navItems(locale, d);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (h: string) => pathname === h || pathname.startsWith(h + "/");

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 transition-colors duration-500",
        scrolled ? "bg-paper/85 backdrop-blur-md" : "bg-transparent"
      )}
    >
      <div
        className={clsx(
          "mx-auto flex max-w-wide items-center justify-between px-6 transition-[padding,border-color] duration-500 sm:px-10",
          scrolled ? "py-3.5 border-b border-line/70" : "py-5 border-b border-transparent"
        )}
      >
        <Link
          href={href(locale)}
          className="group flex flex-col leading-none"
          aria-label={site.name[locale]}
        >
          <span
            className={clsx(
              locale === "fa" ? "font-fa" : "font-serif",
              "text-[1.12rem] tracking-tight text-ink"
            )}
          >
            {site.name[locale]}
          </span>
          <span className="eyebrow mt-1 hidden sm:block">{d.site.role}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex" aria-label={d.menu}>
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={clsx(
                "font-sans text-[0.82rem] tracking-wide transition-colors duration-300 hover:text-ink",
                isActive(it.href) ? "text-ink" : "text-stone"
              )}
              aria-current={isActive(it.href) ? "page" : undefined}
            >
              {it.label}
            </Link>
          ))}
          <span className="h-3 w-px bg-line" aria-hidden />
          <LocaleSwitcher
            locale={locale}
            className="font-sans text-[0.82rem] tracking-wide text-stone transition-colors hover:text-ink"
          />
        </nav>

        {/* Mobile toggle */}
        <button
          className="relative z-50 flex h-9 w-9 items-center justify-center md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? d.close : d.menu}
        >
          <span className="flex flex-col gap-[5px]">
            <span
              className={clsx(
                "block h-px w-6 bg-ink transition-transform duration-300",
                open && "translate-y-[6px] rotate-45"
              )}
            />
            <span className={clsx("block h-px w-6 bg-ink transition-opacity duration-300", open && "opacity-0")} />
            <span
              className={clsx(
                "block h-px w-6 bg-ink transition-transform duration-300",
                open && "-translate-y-[6px] -rotate-45"
              )}
            />
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-paper transition-[opacity,visibility] duration-500 md:hidden",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        <nav
          className="flex h-full flex-col justify-center gap-1 px-8"
          aria-label={d.menu}
        >
          {items.map((it, i) => (
            <Link
              key={it.href}
              href={it.href}
              style={{ transitionDelay: open ? `${120 + i * 55}ms` : "0ms" }}
              className={clsx(
                "font-serif text-4xl tracking-tight transition-all duration-500",
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                isActive(it.href) ? "text-ink" : "text-stone"
              )}
            >
              {it.label}
            </Link>
          ))}
          <div className="rule-clay mt-8" />
          <LocaleSwitcher
            locale={locale}
            className="mt-6 font-sans text-sm uppercase tracking-[0.2em] text-stone"
          />
        </nav>
      </div>
    </header>
  );
}
