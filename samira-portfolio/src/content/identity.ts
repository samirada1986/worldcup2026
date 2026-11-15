/**
 * Public identity constants: the ONLY content module client components may import.
 *
 * Do not import ./site, ./projects or ./visibility from a "use client" file: those pull the
 * biography, journal and project data into the JavaScript that every visitor downloads, which
 * would publish anything the site is meant to hold back.
 */
import type { Localized } from "@/lib/types";
import settings from "./data/settings.json";

export const site = {
  name: { en: "Samira Dadashi", fa: "سمیرا داداشی" } as Localized,
  role: { en: "Visual artist & photographer", fa: "هنرمند تجسمی و عکاس" } as Localized,
  location: { en: "Tehran, Iran", fa: "تهران، ایران" } as Localized,
  email: settings.email,
  instagram: settings.instagram,
  instagramUrl: `https://instagram.com/${settings.instagram}`,
  // Canonical host: set NEXT_PUBLIC_SITE_URL once the real domain is known; Netlify provides URL automatically.
  url: (process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || "http://localhost:3000").replace(/\/$/, ""),
};
