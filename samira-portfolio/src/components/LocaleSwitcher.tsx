"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { locales, type Locale } from "@/lib/i18n";

export default function LocaleSwitcher({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const pathname = usePathname();
  const other = locales.find((l) => l !== locale)!;

  // Swap the leading /{locale} segment, keep the rest of the path.
  const rest = pathname.replace(/^\/(en|fa)(?=\/|$)/, "") || "";
  const target = `/${other}${rest}`;

  const setCookie = () => {
    document.cookie = `locale=${other}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <Link
      href={target}
      onClick={setCookie}
      hrefLang={other}
      className={className}
      aria-label={other === "fa" ? "تغییر زبان به فارسی" : "Switch language to English"}
    >
      {other === "fa" ? "فارسی" : "EN"}
    </Link>
  );
}
