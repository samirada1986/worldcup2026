'use strict';
/*
 * Pricing / stock / discount business logic.
 * Ported from the original frontend (findCode, codeErr, totals, shipM) so the
 * backend computes carts, coupons and shipping identically to the prototype.
 */

// Normalise Persian/Arabic-Indic digits to Latin (the frontend's en()).
function en(s) {
  if (s == null) return '';
  return String(s)
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
}

function variantKey(color, size) {
  return String(color) + '|' + String(size);
}

// Shipping methods available, derived from settings.shipCost.
function shipMethods(settings) {
  const c = Number(settings.shipCost) || 0;
  return [
    { id: 'post', name: 'پست پیشتاز', cost: c, eta: '۳ تا ۵ روز کاری' },
    { id: 'express', name: 'ارسال سریع', cost: c + 60000, eta: '۱ تا ۲ روز کاری' },
  ];
}

function findCode(state, code) {
  const c = en(code || '').trim().toUpperCase();
  if (!c) return null;
  return state.discounts.filter((d) => d.code === c)[0] || null;
}

// Returns a Persian error string, or '' when the code is usable.
function codeError(d) {
  if (!d) return 'این کد وجود ندارد.';
  if (!d.active) return 'این کد غیرفعال است.';
  if (d.exp < Date.now()) return 'مهلت این کد تمام شده است.';
  if (d.used >= d.limit) return 'ظرفیت استفاده از این کد پر شده است.';
  return '';
}

function productById(state, id) {
  return state.products.filter((p) => p.id === id)[0] || null;
}

// Available stock for a variant (defaults to 0 when the key is unknown).
function stockOf(product, color, size) {
  if (!product || !product.stock) return 0;
  const v = product.stock[variantKey(color, size)];
  return typeof v === 'number' ? v : 0;
}

/*
 * Resolve raw cart items into priced lines.
 * items: [{ pid, color, size, qty }]
 * Returns { lines, errors } where each line carries the live price and stock.
 */
function resolveLines(state, items) {
  const lines = [];
  const errors = [];
  (items || []).forEach((it, idx) => {
    const p = productById(state, it.pid);
    if (!p || !p.active) {
      errors.push({ index: idx, pid: it.pid, error: 'محصول یافت نشد' });
      return;
    }
    const qty = Math.max(1, parseInt(en(it.qty), 10) || 1);
    const stock = stockOf(p, it.color, it.size);
    const img = ((p.cimg && p.cimg[it.color]) || p.imgs || [])[0] || null;
    lines.push({
      pid: p.id, name: p.name, color: it.color, size: it.size,
      qty, price: p.price, sum: p.price * qty, stock, img,
      inStock: stock >= qty,
    });
  });
  return { lines, errors };
}

/*
 * Compute order totals exactly like the frontend's totals():
 *   sub   = sum of line sums
 *   disc  = round(sub * pct / 100) when the code is valid
 *   ship  = 0 when (sub - disc) >= freeOver, else the method cost
 *   total = sub - disc + ship
 */
function totals(state, lines, code, shipId) {
  const sub = lines.reduce((t, x) => t + x.sum, 0);
  const d = findCode(state, code);
  const codeOk = d && !codeError(d);
  const disc = codeOk ? Math.round((sub * d.pct) / 100) : 0;
  const methods = shipMethods(state.settings);
  const m = methods.filter((x) => x.id === (shipId || 'post'))[0] || methods[0];
  const ship = (sub - disc) >= state.settings.freeOver ? 0 : m.cost;
  return {
    subtotal: sub,
    discount: disc,
    code: disc ? d.code : '',
    shipId: m.id,
    shipMethod: m.name,
    shipping: ship,
    total: sub - disc + ship,
    freeOver: state.settings.freeOver,
    currency: 'IRT',
  };
}

module.exports = {
  en, variantKey, shipMethods, findCode, codeError,
  productById, stockOf, resolveLines, totals,
};
