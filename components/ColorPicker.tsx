"use client";

import { useMemo, useState } from "react";
import { BACKGROUND_COLOR_PRESETS } from "@/lib/fontMap";

function hexToHsl(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default function ColorPicker({
  color,
  onChange,
}: {
  color: string;
  onChange: (hex: string) => void;
}) {
  const [h, s, l] = useMemo(() => hexToHsl(color), [color]);
  const [open, setOpen] = useState(false);

  function set(newH: number, newS: number, newL: number) {
    onChange(hslToHex(newH, newS, newL));
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-8 h-8 rounded-full border-2 border-ink/40 shadow-lift flex items-center justify-center"
        style={{ backgroundColor: color }}
        title="Choose a background color"
      >
        <span className="text-[13px] leading-none">🎨</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-9 left-0 z-50 bg-paper rounded-sm shadow-spread p-4 w-64">
            {/* hue wheel-ish preview strip */}
            <div
              className="h-6 rounded-full mb-3"
              style={{ background: "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)" }}
            />
            <label className="block font-ui text-[10px] uppercase tracking-wide text-ink-light mb-1">Hue</label>
            <input
              type="range"
              min={0}
              max={360}
              value={h}
              onChange={(e) => set(Number(e.target.value), s, l)}
              className="w-full mb-3"
              style={{ accentColor: color }}
            />
            <label className="block font-ui text-[10px] uppercase tracking-wide text-ink-light mb-1">
              Saturation
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={s}
              onChange={(e) => set(h, Number(e.target.value), l)}
              className="w-full mb-3"
              style={{ accentColor: color }}
            />
            <label className="block font-ui text-[10px] uppercase tracking-wide text-ink-light mb-1">
              Lightness
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={l}
              onChange={(e) => set(h, s, Number(e.target.value))}
              className="w-full mb-3"
              style={{ accentColor: color }}
            />
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-sm border border-kraft-dark/20" style={{ backgroundColor: color }} />
              <input
                type="text"
                value={color}
                onChange={(e) => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && onChange(e.target.value)}
                className="flex-1 font-ui text-xs bg-white/60 border border-kraft-dark/25 rounded-sm px-2 py-1 outline-none"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {BACKGROUND_COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => onChange(c)}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-page"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
