'use strict';
/*
 * COA store — seed data.
 * Ported verbatim from the original standalone prototype's in-browser seed()
 * so the backend starts with exactly the same catalogue, customers, orders,
 * discount codes and settings the demo frontend used to hold in localStorage.
 * Currency: Iranian Toman (IRT). Stock is keyed by "<colorName>|<size>".
 */

const DAY = 86400000;

// Order status pipeline (code, Persian label), in order.
const STATUSES = [
  ['placed', 'ثبت سفارش'],
  ['confirmed', 'تأیید سفارش'],
  ['preparing', 'در حال آماده‌سازی'],
  ['handed', 'تحویل به شرکت حمل‌ونقل'],
  ['transit', 'در مسیر ارسال'],
  ['delivered', 'تحویل داده شده'],
];

function stIdx(s) {
  for (let i = 0; i < STATUSES.length; i++) if (STATUSES[i][0] === s) return i;
  return -1;
}
function stName(s) {
  if (s === 'cancelled') return 'لغو شده';
  for (let i = 0; i < STATUSES.length; i++) if (STATUSES[i][0] === s) return STATUSES[i][1];
  return s;
}

// Build a stock map { "color|size": qty } by walking colors × sizes and
// consuming the flat quantity array (cycling if shorter), exactly as the
// original mkStock() did.
function mkStock(colors, sizes, arr) {
  const o = {};
  let k = 0;
  colors.forEach((c) => {
    sizes.forEach((s) => {
      o[c.name + '|' + s] = arr[k++ % arr.length];
    });
  });
  return o;
}

function seed() {
  const now = Date.now();
  const S2 = ['۱', '۲'];
  const FS = ['فری‌سایز'];
  const skirtCare = 'شست‌وشو با دست و آب خنک. از چلاندن خودداری کنید. اتو با حرارت کم از پشت پارچه.';

  const CATS = [
    { id: 'skirt', name: 'دامن ساتن' },
    { id: 'top', name: 'تاپ ابریشمی' },
    { id: 'polar', name: 'پلار' },
    { id: 'cardigan', name: 'کاردیگان' },
    { id: 'trench', name: 'ترنچ‌کت' },
  ];

  const P = [
    {
      id: 'p1', name: 'دامن ساتن فون', cat: 'skirt', price: 1850000, fabric: 'ساتن پشت‌کرپ', sku: 'COA-SK-01',
      imgs: ['cream', 'garden', 'swatch'],
      colors: [
        { name: 'کرم', hex: '#EFE6CF' }, { name: 'آبی آسمانی', hex: '#BCD3EE' }, { name: 'صورتی', hex: '#F2C9D0' },
        { name: 'سرمه‌ای', hex: '#1F2A44' }, { name: 'ماچا', hex: '#A9B58C' }, { name: 'لیمویی', hex: '#C9CC2E' },
        { name: 'نقره‌ای', hex: '#A9A4A4' }, { name: 'زیتونی', hex: '#6B6A3F' }, { name: 'قهوه‌ای', hex: '#4A3226' },
      ],
      cimg: {
        'کرم': ['cream', 'garden'], 'آبی آسمانی': ['blue', 'mblue'], 'صورتی': ['spink', 'pink'],
        'سرمه‌ای': ['navya'], 'ماچا': ['matcham', 'matcha'], 'لیمویی': ['limon'], 'نقره‌ای': ['silver'],
        'زیتونی': ['molive'], 'قهوه‌ای': ['mbrown'],
      },
      sizes: S2,
      desc: 'دامن ساتن با برش فون که از کمر آرام باز می‌شود و با هر قدم موج می‌گیرد. ساتنی که پشتش کرپ است.',
      care: skirtCare, fit: 'سایز ۱: دور کمر ۷۰. سایز ۲: دور کمر ۷۵. قد دامن ۸۵ سانتی‌متر.',
      isNew: true, active: true, ts: now - 2 * DAY,
    },
    {
      id: 'p2', name: 'دامن ساتن راسته', cat: 'skirt', price: 1850000, fabric: 'ساتن پشت‌کرپ', sku: 'COA-SK-02',
      imgs: ['navyb', 'garden', 'swatch'],
      colors: [
        { name: 'سرمه‌ای', hex: '#1F2A44' }, { name: 'یاسی', hex: '#B9A3C9' },
        { name: 'بنفش', hex: '#5E2A57' }, { name: 'سبز مریمی', hex: '#A3AD8E' },
      ],
      cimg: {
        'سرمه‌ای': ['navyb'], 'یاسی': ['garden', 'swatch'], 'بنفش': ['garden', 'swatch'], 'سبز مریمی': ['garden', 'swatch'],
      },
      sizes: S2,
      desc: 'مدل راسته دامن ساتن با خطی صاف از کمر تا پایین.',
      care: skirtCare, fit: 'سایز ۱: دور کمر ۷۰. سایز ۲: دور کمر ۷۵. قد دامن ۸۵ سانتی‌متر.',
      isNew: true, active: true, ts: now - 5 * DAY,
    },
    {
      id: 'p3', name: 'تاپ سیلک', cat: 'top', price: 1800000, fabric: 'سیلک', sku: 'COA-TP-01',
      imgs: ['satin'],
      colors: [
        { name: 'کاکائویی', hex: '#7A5236' }, { name: 'صورتی', hex: '#F2C9D0' }, { name: 'یاسی', hex: '#B9A3C9' },
        { name: 'آبی آسمانی', hex: '#BCD3EE' }, { name: 'مشکی', hex: '#1C1C1C' },
      ],
      sizes: S2,
      desc: 'تاپ بندی برای کامل کردن استایل‌های روزمره و مهمانی. با دامن ساتن یا شلوار جین.',
      care: 'خشک‌شویی یا شست‌وشوی ملایم با دست.', fit: 'فیت آزاد.',
      isNew: true, active: true, ts: now - 4 * DAY,
    },
    {
      id: 'p4', name: 'نیم‌زیپ پلار', cat: 'polar', price: 2900000, fabric: 'پلار', sku: 'COA-PL-01',
      imgs: ['pgreen', 'poster', 'polar'],
      colors: [{ name: 'سبز', hex: '#0A7A45' }, { name: 'سرمه‌ای', hex: '#1F2433' }],
      cimg: { 'سبز': ['pgreen', 'poster'], 'سرمه‌ای': ['polar'] },
      sizes: FS,
      desc: 'گرم، راحت و آزاد. یقه راه‌راه ۱۰ سانتی و جیب‌های کاربردی.',
      care: 'شست‌وشو با ماشین در ۳۰ درجه. بدون خشک‌کن.', fit: 'فری‌سایز. عرض ۶۲، قد ۶۵ و آستین ۶۷ سانتی‌متر.',
      isNew: true, active: true, ts: now - 6 * DAY,
    },
    {
      id: 'p5', name: 'کاردیگن پلار', cat: 'cardigan', price: 2700000, fabric: 'پلار', sku: 'COA-CD-01',
      imgs: ['polar'],
      colors: [{ name: 'سرمه‌ای', hex: '#1F2433' }, { name: 'سبز', hex: '#0A7A45' }],
      sizes: FS,
      desc: 'کاردیگن جیب‌دار؛ لایه رویی برای پاییز و لایه اصلی برای زمستان. در تصویر، مدل پایینی.',
      care: 'شست‌وشو با ماشین در ۳۰ درجه. بدون خشک‌کن.', fit: 'فری‌سایز.',
      isNew: false, active: true, ts: now - 30 * DAY,
    },
    {
      id: 'p6', name: 'ترنچ‌کت ماه کامل', cat: 'trench', price: 4800000, fabric: 'پارچه ضدآب، آستردار', sku: 'COA-TR-01',
      imgs: ['trench', 'street', 'trio'],
      colors: [{ name: 'قهوه‌ای', hex: '#6F4E36' }, { name: 'سبز', hex: '#9C9E88' }, { name: 'سرمه‌ای', hex: '#2B3048' }],
      cimg: { 'قهوه‌ای': ['trench', 'street'], 'سبز': ['tsage', 'trio'], 'سرمه‌ای': ['trio'] },
      sizes: FS,
      desc: 'بارانی بلند، کاملاً ضدآب و آسترکشی‌شده، با کمربند هم‌رنگ. آستر راه‌راه یا چهارخانه.',
      care: 'فقط خشک‌شویی.', fit: 'فری‌سایز.',
      isNew: false, active: true, ts: now - 12 * DAY,
    },
  ];

  const stocks = [
    [4, 3, 3, 2, 2, 0, 5, 1, 2, 2, 3, 1, 0, 0, 2, 1, 1, 2],
    [3, 2, 0, 1, 1, 0, 2, 2],
    [2, 1, 3, 0, 1, 1, 0, 2, 2, 2],
    [5, 4],
    [2, 0],
    [1, 2, 1],
  ];
  P.forEach((p, i) => {
    p.stock = mkStock(p.colors, p.sizes, stocks[i]);
    p.seoT = p.name + ' | COA';
    p.seoD = p.desc;
  });

  const C = [
    { id: 'c1', name: 'مشتری نمایشی', mobile: '09120000000', ts: now - 40 * DAY },
    { id: 'c2', name: 'مشتری نمایشی دو', mobile: '09121111111', ts: now - 25 * DAY },
    { id: 'c3', name: 'مشتری نمایشی سه', mobile: '09122222222', ts: now - 9 * DAY },
  ];
  const adr = { province: 'تهران', city: 'تهران', address: 'نشانی نمایشی، خیابان نمونه، پلاک ۱', postal: '1234567890' };

  // Build a seed order (same shape the frontend produced).
  function ord(n, d, cid, items, st, ship) {
    const c = C.filter((x) => x.id === cid)[0];
    let sub = 0;
    const lines = items.map((a) => {
      const p = P.filter((x) => x.id === a[0])[0];
      sub += p.price * a[3];
      return {
        pid: p.id, name: p.name, color: a[1], size: a[2], qty: a[3], price: p.price,
        img: ((p.cimg && p.cimg[a[1]]) || p.imgs)[0],
      };
    });
    const hist = [];
    const i = stIdx(st === 'cancelled' ? 'placed' : st);
    for (let k = 0; k <= i; k++) hist.push({ s: STATUSES[k][0], ts: now - d * DAY + k * DAY * 0.4 });
    if (st === 'cancelled') hist.push({ s: 'cancelled', ts: now - d * DAY + DAY * 0.3 });
    return {
      id: 'COA-' + n, ts: now - d * DAY, customerId: cid, name: c.name, mobile: c.mobile, address: adr,
      items: lines, subtotal: sub, discount: 0, code: '', shipping: ship, total: sub + ship,
      shipMethod: 'پست پیشتاز', payMethod: 'درگاه پرداخت (نمایشی)', paid: true, status: st, history: hist, notes: [],
    };
  }

  const O = [
    ord(1001, 13, 'c2', [['p6', 'قهوه‌ای', 'فری‌سایز', 1]], 'delivered', 0),
    ord(1002, 11, 'c1', [['p1', 'صورتی', '۱', 1], ['p3', 'کاکائویی', '۱', 1]], 'delivered', 0),
    ord(1003, 8, 'c3', [['p4', 'سرمه‌ای', 'فری‌سایز', 1]], 'delivered', 0),
    ord(1004, 6, 'c2', [['p1', 'آبی آسمانی', '۲', 2]], 'transit', 0),
    ord(1005, 3, 'c3', [['p5', 'سرمه‌ای', 'فری‌سایز', 1]], 'cancelled', 90000),
    ord(1006, 1, 'c1', [['p4', 'سبز', 'فری‌سایز', 1]], 'confirmed', 90000),
  ];

  return {
    v: 1,
    products: P,
    customers: C,
    orders: O,
    seq: 1007,
    addresses: [{
      id: 'a1', label: 'خانه', name: 'مشتری نمایشی', mobile: '09120000000',
      province: 'تهران', city: 'تهران', address: 'نشانی نمایشی، خیابان نمونه، پلاک ۱', postal: '1234567890',
    }],
    discounts: [
      { code: 'COA10', pct: 10, limit: 50, used: 3, exp: now + 30 * DAY, active: true },
      { code: 'WELCOME', pct: 5, limit: 10, used: 10, exp: now + 10 * DAY, active: true },
    ],
    moves: [{ ts: now - 5 * DAY, pid: 'p4', v: 'سرمه‌ای|فری‌سایز', d: -2, why: 'تعدیل دستی' }],
    settings: { store: 'COA', insta: 'coa.is.coa', shipCost: 90000, freeOver: 3000000, low: 2, notifyOrder: true, notifyLow: true },
    categories: CATS,
  };
}

module.exports = { seed, STATUSES, stIdx, stName, mkStock, DAY };
