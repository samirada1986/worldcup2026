import type { Config } from "tailwindcss";

/**
 * Design system for Samira Dadashi — contemporary photography portfolio.
 * Restrained, tactile, museum-like. Warm paper + ink, a single quiet clay accent.
 * Colours are defined as CSS variables (see globals.css) so individual projects
 * (e.g. Conatus) can shift mood without leaving the identity.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--paper) / <alpha-value>)",
        "paper-deep": "rgb(var(--paper-deep) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--ink-soft) / <alpha-value>)",
        stone: "rgb(var(--stone) / <alpha-value>)",
        "stone-light": "rgb(var(--stone-light) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        clay: "rgb(var(--clay) / <alpha-value>)",
        charcoal: "rgb(var(--charcoal) / <alpha-value>)",
        "charcoal-soft": "rgb(var(--charcoal-soft) / <alpha-value>)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        fa: ["var(--font-fa)", "Tahoma", "sans-serif"],
      },
      /**
       * Type scale (modular, ≈1.25). Nothing on the site is set outside this scale.
       *   caption  12 / metadata, plate numbers
       *   meta     13 / captions, labels, footer
       *   ui       15 / navigation, buttons
       *   body     17 / reading text (serif)
       *   lede     22 / introductions
       *   display-md   28 → 40   section / project headings
       *   display-lg   34 → 52   page titles
       *   display-xl   40 → 64   the artist's name on the home page only
       */
      fontSize: {
        caption: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.04em" }],
        meta: ["0.8125rem", { lineHeight: "1.6", letterSpacing: "0.02em" }],
        ui: ["0.9375rem", { lineHeight: "1.4", letterSpacing: "0.01em" }],
        body: ["1.0625rem", { lineHeight: "1.72" }],
        lede: ["clamp(1.2rem, 1.6vw, 1.4rem)", { lineHeight: "1.45" }],
        "display-md": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        "display-lg": ["clamp(2.1rem, 4.2vw, 3.25rem)", { lineHeight: "1.06", letterSpacing: "-0.015em" }],
        "display-xl": ["clamp(2.5rem, 5.4vw, 4rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
      },
      maxWidth: {
        reading: "38rem",
        wide: "90rem",
      },
      letterSpacing: {
        caption: "0.08em",
        label: "0.2em",
      },
      transitionTimingFunction: {
        quiet: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "veil-in": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
