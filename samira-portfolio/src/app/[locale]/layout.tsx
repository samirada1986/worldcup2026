import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fraunces, Inter, Vazirmatn } from "next/font/google";
import "../globals.css";
import { isLocale, dir, type Locale, getDict } from "@/lib/i18n";
import { site } from "@/content/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LightboxProvider from "@/components/LightboxProvider";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
  display: "swap",
});
const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-fa",
  display: "swap",
});

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fa" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "en";
  const title =
    l === "fa" ? "سمیرا داداشی — هنرمند تجسمی و عکاس" : "Samira Dadashi — Visual Artist & Photographer";
  const description =
    l === "fa"
      ? "پورتفولیوی سمیرا داداشی، هنرمند تجسمی و عکاسِ ایرانی. کوناتوس و آثار مستند."
      : "Portfolio of Samira Dadashi, Iranian visual artist and photographer. Conatus and documentary work.";
  return {
    title,
    description,
    alternates: {
      canonical: `/${l}`,
      languages: { en: "/en", fa: "/fa", "x-default": "/en" },
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: l === "fa" ? "fa_IR" : "en_US",
      siteName: site.name[l],
      images: [{ url: "/og/default.jpg", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/default.jpg"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  const d = getDict(l);

  return (
    <html lang={l} dir={dir(l)} className={`${fraunces.variable} ${inter.variable} ${vazir.variable}`}>
      <body className={l === "fa" ? "font-fa" : "font-sans"}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:text-paper focus:px-4 focus:py-2 focus:text-sm"
        >
          {d.skipToContent}
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: site.name[l],
              alternateName: site.name[l === "en" ? "fa" : "en"],
              jobTitle: d.site.role,
              address: { "@type": "PostalAddress", addressLocality: "Tehran", addressCountry: "IR" },
              email: `mailto:${site.email}`,
              url: site.url,
              sameAs: [site.instagramUrl],
            }),
          }}
        />
        <LightboxProvider>
          <Header locale={l} />
          <main id="main">{children}</main>
          <Footer locale={l} />
        </LightboxProvider>
      </body>
    </html>
  );
}
