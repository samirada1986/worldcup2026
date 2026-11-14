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
      fontSize: {
        // fluid display sizes
        "display-xl": ["clamp(3rem, 9vw, 7.5rem)", { lineHeight: "0.98", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.4rem, 6vw, 4.75rem)", { lineHeight: "1.02", letterSpacing: "-0.015em" }],
        "display-md": ["clamp(1.9rem, 4vw, 3rem)", { lineHeight: "1.08", letterSpacing: "-0.01em" }],
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
