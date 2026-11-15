import type { Locale } from "./i18n";

/** Two-digit plate number, in Persian digits for the Persian site. */
export function plateNo(i: number, locale: Locale): string {
  const n = i + 1;
  return locale === "fa" ? n.toLocaleString("fa-IR", { minimumIntegerDigits: 2, useGrouping: false }) : String(n).padStart(2, "0");
}

export const plateId = (i: number) => `plate-${i + 1}`;
