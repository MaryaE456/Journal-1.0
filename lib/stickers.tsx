import React from "react";

export interface StickerDef {
  id: string;
  label: string;
  render: () => React.ReactNode;
}

// Simple hand-drawn-style line art, built entirely from inline SVG so the
// starter pack needs no external images or network access.

const stroke = "#3E2C23";

export const BUILT_IN_STICKERS: StickerDef[] = [
  {
    id: "heart",
    label: "Heart",
    render: () => (
      <svg viewBox="0 0 100 100" fill="none">
        <path
          d="M50 88C50 88 12 62 12 35C12 18 26 8 40 14C46 16.5 50 24 50 24C50 24 54 16.5 60 14C74 8 88 18 88 35C88 62 50 88 50 88Z"
          stroke={stroke}
          strokeWidth="4"
          fill="#E3A9A0"
        />
      </svg>
    ),
  },
  {
    id: "star",
    label: "Star",
    render: () => (
      <svg viewBox="0 0 100 100" fill="none">
        <path
          d="M50 8L61 38L93 40L67 60L77 92L50 73L23 92L33 60L7 40L39 38Z"
          stroke={stroke}
          strokeWidth="4"
          strokeLinejoin="round"
          fill="#E8C468"
        />
      </svg>
    ),
  },
  {
    id: "sparkle",
    label: "Sparkle",
    render: () => (
      <svg viewBox="0 0 100 100" fill="none">
        <path
          d="M50 6C52 30 56 44 90 50C56 56 52 70 50 94C48 70 44 56 10 50C44 44 48 30 50 6Z"
          stroke={stroke}
          strokeWidth="4"
          strokeLinejoin="round"
          fill="#F3ECDD"
        />
      </svg>
    ),
  },
  {
    id: "leaf",
    label: "Leaf",
    render: () => (
      <svg viewBox="0 0 100 100" fill="none">
        <path
          d="M20 85C10 55 25 15 82 12C85 62 55 88 20 85Z"
          stroke={stroke}
          strokeWidth="4"
          fill="#8A9A5B"
        />
        <path d="M25 82C40 60 55 40 80 15" stroke={stroke} strokeWidth="3" />
      </svg>
    ),
  },
  {
    id: "flower",
    label: "Flower",
    render: () => (
      <svg viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="28" r="16" stroke={stroke} strokeWidth="3.5" fill="#E3A9A0" />
        <circle cx="50" cy="72" r="16" stroke={stroke} strokeWidth="3.5" fill="#E3A9A0" />
        <circle cx="28" cy="50" r="16" stroke={stroke} strokeWidth="3.5" fill="#E3A9A0" />
        <circle cx="72" cy="50" r="16" stroke={stroke} strokeWidth="3.5" fill="#E3A9A0" />
        <circle cx="50" cy="50" r="14" stroke={stroke} strokeWidth="3.5" fill="#E8C468" />
      </svg>
    ),
  },
  {
    id: "sun",
    label: "Sun",
    render: () => (
      <svg viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="22" stroke={stroke} strokeWidth="4" fill="#E8C468" />
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * Math.PI) / 4;
          const x1 = 50 + Math.cos(angle) * 32;
          const y1 = 50 + Math.sin(angle) * 32;
          const x2 = 50 + Math.cos(angle) * 44;
          const y2 = 50 + Math.sin(angle) * 44;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth="4" strokeLinecap="round" />;
        })}
      </svg>
    ),
  },
  {
    id: "cloud",
    label: "Cloud",
    render: () => (
      <svg viewBox="0 0 100 100" fill="none">
        <path
          d="M25 65C13 65 8 55 15 47C10 36 22 26 32 30C36 20 55 18 60 29C74 26 84 38 78 48C86 51 85 65 74 65Z"
          stroke={stroke}
          strokeWidth="4"
          fill="#F3ECDD"
        />
      </svg>
    ),
  },
  {
    id: "arrow-squiggle",
    label: "Squiggle arrow",
    render: () => (
      <svg viewBox="0 0 100 100" fill="none">
        <path
          d="M8 30C30 10 40 55 60 40C75 28 65 65 90 62"
          stroke={stroke}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M76 52L92 62L78 74" stroke={stroke} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    id: "washi-strip",
    label: "Washi tape",
    render: () => (
      <svg viewBox="0 0 140 40" fill="none">
        <rect x="2" y="2" width="136" height="36" fill="#E8C468" opacity="0.85" />
        <rect x="2" y="2" width="136" height="36" stroke={stroke} strokeOpacity="0.15" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: "washi-strip-pink",
    label: "Washi tape (pink)",
    render: () => (
      <svg viewBox="0 0 140 40" fill="none">
        <rect x="2" y="2" width="136" height="36" fill="#E3A9A0" opacity="0.85" />
        <rect x="2" y="2" width="136" height="36" stroke={stroke} strokeOpacity="0.15" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: "moon",
    label: "Moon",
    render: () => (
      <svg viewBox="0 0 100 100" fill="none">
        <path
          d="M65 12C42 12 24 30 24 53C24 76 42 94 65 94C48 88 36 72 36 53C36 34 48 18 65 12Z"
          stroke={stroke}
          strokeWidth="4"
          strokeLinejoin="round"
          fill="#B98A5E"
        />
      </svg>
    ),
  },
  {
    id: "camera",
    label: "Camera",
    render: () => (
      <svg viewBox="0 0 100 100" fill="none">
        <rect x="12" y="30" width="76" height="52" rx="6" stroke={stroke} strokeWidth="4" fill="#F3ECDD" />
        <rect x="34" y="18" width="24" height="14" rx="2" stroke={stroke} strokeWidth="4" fill="#F3ECDD" />
        <circle cx="50" cy="57" r="17" stroke={stroke} strokeWidth="4" fill="#8A9A5B" />
        <circle cx="76" cy="42" r="3" fill={stroke} />
      </svg>
    ),
  },
  {
    id: "book",
    label: "Book",
    render: () => (
      <svg viewBox="0 0 100 100" fill="none">
        <path d="M50 22C40 14 20 14 12 20V80C20 74 40 74 50 82" stroke={stroke} strokeWidth="4" strokeLinejoin="round" fill="#C1663D" />
        <path d="M50 22C60 14 80 14 88 20V80C80 74 60 74 50 82" stroke={stroke} strokeWidth="4" strokeLinejoin="round" fill="#C1663D" />
        <line x1="50" y1="22" x2="50" y2="82" stroke={stroke} strokeWidth="3" />
      </svg>
    ),
  },
  {
    id: "coffee",
    label: "Coffee cup",
    render: () => (
      <svg viewBox="0 0 100 100" fill="none">
        <path d="M22 38H68V64C68 76 60 84 45 84C30 84 22 76 22 64Z" stroke={stroke} strokeWidth="4" fill="#F3ECDD" />
        <path d="M68 44C82 44 84 62 68 62" stroke={stroke} strokeWidth="4" fill="none" />
        <path d="M32 30C30 24 36 22 34 16" stroke={stroke} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M46 30C44 24 50 22 48 16" stroke={stroke} strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "note",
    label: "Music note",
    render: () => (
      <svg viewBox="0 0 100 100" fill="none">
        <circle cx="28" cy="76" r="12" stroke={stroke} strokeWidth="4" fill="#8A9A5B" />
        <circle cx="66" cy="68" r="12" stroke={stroke} strokeWidth="4" fill="#8A9A5B" />
        <path d="M40 76V22L78 14V60" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "paperclip",
    label: "Paperclip",
    render: () => (
      <svg viewBox="0 0 100 100" fill="none">
        <path
          d="M30 45L62 13C72 3 88 3 96 13C104 23 104 37 94 47L48 93C41 100 30 100 23 93C16 86 16 75 23 68L60 31C63 28 68 28 71 31C74 34 74 39 71 42L40 73"
          stroke={stroke}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function getStickerById(id: string): StickerDef | undefined {
  return BUILT_IN_STICKERS.find((s) => s.id === id);
}
