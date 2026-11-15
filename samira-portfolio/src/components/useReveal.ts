"use client";

import { useEffect, useRef, useState } from "react";

export type RevealState = "visible" | "armed" | "shown";

/**
 * Releases an element once, as it enters the viewport.
 *
 * - Server render and first paint are always fully visible (no flash, no hidden LCP image).
 * - Anything already on screen at load is left alone.
 * - Anything below the fold is armed on the client, then released a single time.
 * - Reduced motion: never armed.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [state, setState] = useState<RevealState>("visible");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight * 0.92) return; // already in view
    setState("armed");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, state };
}
