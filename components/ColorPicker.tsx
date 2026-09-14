"use client";

import { useMemo, useRef, useState } from "react";
import { BACKGROUND_COLOR_PRESETS } from "@/lib/fontMap";

interface HSLA {
  h: number;
  s: number;
  l: number;
  a: number;
}

function parseColor(input: string): HSLA {
  if (!input) return { h: 30, s: 40, l: 90, a: 1 };

  const rgbaMatch = input.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s]+([\d.]+))?\)/i);
  if (rgbaMatch) {
    const r = Number(rgbaMatch[1]) / 255;
    const g = Number(rgbaMatch[2]) / 255;
    const b = Number(rgbaMatch[3]) / 255;
    const a = rgbaMatch[4] !== undefined ? Number(rgbaMatch[4]) : 1;
    return { ...rgbToHsl(r, g, b), a };
  }

  if (/^#[0-9a-fA-F]{6}$/.test(input)) {
    const r = parseInt(input.substring(1, 3), 16) / 255;
    const g = parseInt(input.substring(3, 5), 16) / 255;
    const b = parseInt(input.substring(5, 7), 16) / 255;
    return { ...rgbToHsl(r, g, b), a: 1 };
  }

  return { h: 30, s: 40, l: 90, a: 1 };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
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
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
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
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function buildColor(h: number, s: number, l: number, a: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  if (a >= 1) {
    const toHex = (v: number) => v.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  return `rgba(${r}, ${g}, ${b}, ${Math.round(a * 100) / 100})`;
}

export default function ColorPicker({
  color,
  onChange,
}: {
  color: string;
  onChange: (value: string) => void;
}) {
  const { h, s, l, a } = useMemo(() => parseColor(color), [color]);
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  function set(newH: number, newS: number, newL: number, newA: number) {
    onChange(buildColor(newH, newS, newL, newA));
  }

  function pickHueFromEvent(e: React.PointerEvent | React.MouseEvent) {
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    set(Math.round(ratio * 360), s, l, a);
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
            {/* clickable rainbow hue bar */}
            <div
              ref={barRef}
              onPointerDown={(e) => {
                (e.target as Element).setPointerCapture(e.pointerId);
                pickHueFromEvent(e);
              }}
              onPointerMove={(e) => {
                if (e.buttons === 1) pickHueFromEvent(e);
              }}
              className="relative h-8 rounded-full mb-1 cursor-pointer"
              style={{ background: "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)" }}
            >
              <div
                className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white shadow -translate-y-1/2 -translate-x-1/2 pointer-events-none"
                style={{ left: `${(h / 360) * 100}%`, backgroundColor: `hsl(${h}, 100%, 50%)` }}
              />
            </div>
            <p className="font-ui text-[10px] text-ink-light mb-3">tap or drag along the rainbow to set hue</p>

            <label className="block font-ui text-[10px] uppercase tracking-wide text-ink-light mb-1">
              Saturation
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={s}
              onChange={(e) => set(h, Number(e.target.value), l, a)}
              className="w-full mb-3"
              style={{ accentColor: color }}
            />
            <label className="block font-ui text-[10px] uppercase tracking-wide text-ink-light mb-1">Shade</label>
            <input
              type="range"
              min={0}
              max={100}
              value={l}
              onChange={(e) => set(h, s, Number(e.target.value), a)}
              className="w-full mb-3"
              style={{ accentColor: color }}
            />
            <label className="block font-ui text-[10px] uppercase tracking-wide text-ink-light mb-1">Opacity</label>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(a * 100)}
              onChange={(e) => set(h, s, l, Number(e.target.value) / 100)}
              className="w-full mb-3"
              style={{ accentColor: color }}
            />

            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-sm border border-kraft-dark/20"
                style={{
                  backgroundColor: color,
                  backgroundImage:
                    "conic-gradient(#ddd 25%, transparent 0 50%, #ddd 0 75%, transparent 0)",
                  backgroundSize: "8px 8px",
                }}
              />
              <input
                type="text"
                value={color}
                onChange={(e) => onChange(e.target.value)}
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
