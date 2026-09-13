import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F3ECDD",
        "paper-dark": "#E8DEC8",
        kraft: "#B98A5E",
        "kraft-dark": "#8A6238",
        "kraft-deep": "#5E4028",
        ink: "#3E2C23",
        "ink-light": "#6B5645",
        rust: "#C1663D",
        sage: "#8A9A5B",
        tape: "#E8C468",
        "tape-pink": "#E3A9A0",
      },
      fontFamily: {
        script: ["var(--font-caveat)", "cursive"],
        hand: ["var(--font-kalam)", "cursive"],
        type: ["var(--font-special-elite)", "monospace"],
        serif: ["var(--font-playfair)", "serif"],
        ui: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        page: "0 2px 10px rgba(62, 44, 35, 0.15)",
        spread: "0 8px 30px rgba(62, 44, 35, 0.35)",
        lift: "0 6px 16px rgba(62, 44, 35, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
