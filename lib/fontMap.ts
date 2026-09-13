import { FontKey } from "./types";

export const FONT_OPTIONS: { key: FontKey; label: string; className: string }[] = [
  { key: "script", label: "Script", className: "font-script" },
  { key: "hand", label: "Handwritten", className: "font-hand" },
  { key: "type", label: "Typewriter", className: "font-type" },
  { key: "serif", label: "Elegant serif", className: "font-serif" },
  { key: "ui", label: "Clean sans", className: "font-ui" },
];

export function fontClassName(key: FontKey): string {
  return FONT_OPTIONS.find((f) => f.key === key)?.className ?? "font-hand";
}

export const TEXT_COLOR_OPTIONS = ["#2B1A16", "#7A1F2B", "#8A9A5B", "#6B5645", "#C9525E"];

// Each background STYLE is just a pattern (or no pattern) — the actual color
// is chosen separately with the color picker, so any style can be any color.
export const BACKGROUND_STYLES: { key: import("./types").BackgroundStyle; label: string; patternClassName: string }[] = [
  { key: "plain", label: "Plain", patternClassName: "" },
  { key: "lined", label: "Lined", patternClassName: "bg-lined-page" },
  { key: "grid", label: "Grid", patternClassName: "bg-grid-page" },
  { key: "dotted", label: "Dotted", patternClassName: "bg-dotted-page" },
];

export const BACKGROUND_COLOR_PRESETS = ["#F3ECDD", "#EFD9DC", "#7A1F2B", "#3D0E15", "#E8DEC8", "#C9525E"];
