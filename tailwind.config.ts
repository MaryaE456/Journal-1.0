import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F3ECDD",
        "paper-dark": "#E8DEC8",
        kraft: "#9C4A55",
        "kraft-dark": "#7A1F2B",
        "kraft-deep": "#3D0E15",
        ink: "#2B1A16",
        "ink-light": "#6B5645",
        rust: "#7A1F2B",
        sage: "#8A9A5B",
        tape: "#E8C468",
        "tape-pink": "#C9525E",
      },
      fontFamily: {
        script: ["var(--font-caveat)", "cursive"],
        hand: ["var(--font-kalam)", "cursive"],
        type: ["var(--font-special-elite)", "monospace"],
        serif: ["var(--font-playfair)", "serif"],
        ui: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-bebas)", "sans-serif"],
        delicate: ["var(--font-cormorant)", "serif"],
        dancing: ["var(--font-dancing-script)", "cursive"],
        pacifico: ["var(--font-pacifico)", "cursive"],
        indie: ["var(--font-indie-flower)", "cursive"],
        amatic: ["var(--font-amatic-sc)", "sans-serif"],
        merriweather: ["var(--font-merriweather)", "serif"],
        quicksand: ["var(--font-quicksand)", "sans-serif"],
        shadows: ["var(--font-shadows-into-light)", "cursive"],
        courier: ["var(--font-courier-prime)", "monospace"],
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
