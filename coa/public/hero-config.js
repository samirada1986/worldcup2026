/*
 * COA — signature hero configuration.
 * EDIT THIS FILE (no code changes needed) to curate the clothing-rack hero.
 *
 * Garments are referenced by STABLE product id. At runtime the hero tries to
 * read live name / price / availability from the store API (/api/products);
 * when that is unavailable (e.g. a static host) it falls back to the `snapshot`
 * below. If a referenced product is missing or inactive, the hero drops it
 * gracefully and keeps the composition balanced.
 */
window.COA_HERO_CONFIG = {
  // Curated mix across categories — order = hanging order on the rail.
  // `img` is an image key under /assets/img/<key>.jpg (overrides the product's
  // default image for the hero frame). `enter` picks an arrival path.
  garments: [
    { id: 'p6', img: 'trench', enter: 'left'  },  // ترنچ‌کت  (outerwear)
    { id: 'p3', img: 'satin',  enter: 'up'    },  // تاپ سیلک (tops)
    { id: 'p1', img: 'cream',  enter: 'drop'  },  // دامن ساتن فون (skirts) — hero piece, centre
    { id: 'p4', img: 'pgreen', enter: 'up'    },  // نیم‌زیپ پلار (knitwear)
    { id: 'p5', img: 'polar',  enter: 'right' },  // کاردیگن پلار (cardigan)
  ],

  // Editorial copy (RTL Persian). See docs for alternative slogan directions.
  copy: {
    eyebrow: 'مجموعهٔ فصل',
    // Headline reflects COA's positioning: form, fabric, colour — your mood.
    headline: 'کوآ،\nبه رنگِ حالِ تو.',
    sub: 'کوآ برای فرم، پارچه و رنگ طراحی می‌کند — نه برای شلوغی. مجموعه‌ای از دامن، تاپ، پلار و ترنچ، در رنگ‌هایی که با آن‌ها شناخته می‌شود.',
    ctaPrimary: { label: 'مشاهدهٔ مجموعه', href: '/#/shop' },
    ctaSecondary: { label: 'خرید همه', href: '/#/shop' },
  },

  // On static hosts (no API) these values are shown. Keep in sync with the shop,
  // or let the API override them when the backend is running.
  snapshot: {
    p1: { name: 'دامن ساتن فون',   price: 1850000, cat: 'دامن' },
    p3: { name: 'تاپ سیلک',        price: 1800000, cat: 'تاپ'  },
    p4: { name: 'نیم‌زیپ پلار',     price: 2900000, cat: 'پلار' },
    p5: { name: 'کاردیگن پلار',     price: 2700000, cat: 'کاردیگان' },
    p6: { name: 'ترنچ‌کت ماه کامل', price: 4800000, cat: 'ترنچ‌کت' },
  },

  productHref: (id) => `/#/product/${id}`,
  settleSeconds: 4.2, // total opening choreography target (3–5s per brief)
};
