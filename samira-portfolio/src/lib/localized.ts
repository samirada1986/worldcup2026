/**
 * Persian content is optional in the admin panel. Wherever an object has both `en` and `fa`
 * and the Persian side is empty, show the English instead of a blank. Applied once, on load.
 */
const isEmpty = (v: unknown) => v == null || v === "" || (Array.isArray(v) && v.length === 0);

export function withFallback<T>(node: T): T {
  if (Array.isArray(node)) return node.map(withFallback) as unknown as T;
  if (node && typeof node === "object") {
    const o = { ...(node as Record<string, unknown>) };
    for (const k of Object.keys(o)) o[k] = withFallback(o[k]);
    if ("en" in o && "fa" in o && isEmpty(o.fa) && !isEmpty(o.en)) o.fa = o.en;
    return o as T;
  }
  return node;
}
