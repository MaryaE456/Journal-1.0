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

export const TEXT_COLOR_OPTIONS = ["#3E2C23", "#C1663D", "#8A9A5B", "#6B5645", "#B98A5E"];

export const PAGE_BACKGROUNDS: { key: string; label: string; className: string }[] = [
  { key: "cream", label: "Cream", className: "bg-paper" },
  { key: "lined", label: "Lined", className: "bg-paper bg-lined-page" },
  { key: "grid", label: "Grid", className: "bg-paper bg-grid-page" },
  { key: "kraft", label: "Kraft", className: "bg-kraft-texture" },
];
