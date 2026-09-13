// "Auto-layout" mode doesn't call an external AI — it arranges your photos and
// text boxes into hand-designed scrapbook templates, picking whichever template
// best matches how many photos/text boxes you asked for, then gently randomizing
// rotation/offset so results don't feel copy-pasted. This can be swapped later
// for a real model call without changing the editor code, since it returns the
// same Slot[] shape either way.

export type Side = "left" | "right";

export interface Slot {
  side: Side;
  kind: "photo" | "text";
  x: number; // % of the single page's width
  y: number; // % of the single page's height
  width: number;
  height: number;
  rotation: number;
}

interface Template {
  photoSlots: number;
  textSlots: number;
  slots: Slot[];
}

// Each template is hand-placed to feel like a real scrapbook spread: photos
// overlapping slightly, text tucked at an angle, nothing perfectly grid-aligned.
const TEMPLATES: Template[] = [
  {
    photoSlots: 1,
    textSlots: 1,
    slots: [
      { side: "left", kind: "photo", x: 14, y: 14, width: 60, height: 55, rotation: -3 },
      { side: "left", kind: "text", x: 12, y: 72, width: 70, height: 20, rotation: 1 },
      { side: "right", kind: "photo", x: 20, y: 20, width: 62, height: 58, rotation: 2 },
    ],
  },
  {
    photoSlots: 2,
    textSlots: 1,
    slots: [
      { side: "left", kind: "photo", x: 10, y: 10, width: 55, height: 45, rotation: -4 },
      { side: "left", kind: "text", x: 14, y: 60, width: 65, height: 30, rotation: 1 },
      { side: "right", kind: "photo", x: 18, y: 14, width: 60, height: 48, rotation: 3 },
      { side: "right", kind: "photo", x: 30, y: 55, width: 48, height: 38, rotation: -2 },
    ],
  },
  {
    photoSlots: 3,
    textSlots: 2,
    slots: [
      { side: "left", kind: "photo", x: 8, y: 8, width: 50, height: 42, rotation: -3 },
      { side: "left", kind: "photo", x: 42, y: 42, width: 45, height: 38, rotation: 4 },
      { side: "left", kind: "text", x: 10, y: 74, width: 75, height: 20, rotation: -1 },
      { side: "right", kind: "photo", x: 20, y: 10, width: 60, height: 46, rotation: 2 },
      { side: "right", kind: "text", x: 14, y: 62, width: 68, height: 30, rotation: 1 },
    ],
  },
  {
    photoSlots: 4,
    textSlots: 2,
    slots: [
      { side: "left", kind: "photo", x: 8, y: 8, width: 42, height: 36, rotation: -4 },
      { side: "left", kind: "photo", x: 50, y: 14, width: 42, height: 36, rotation: 3 },
      { side: "left", kind: "text", x: 12, y: 52, width: 74, height: 20, rotation: -1 },
      { side: "left", kind: "photo", x: 20, y: 74, width: 44, height: 22, rotation: 2 },
      { side: "right", kind: "photo", x: 12, y: 10, width: 50, height: 42, rotation: -2 },
      { side: "right", kind: "text", x: 16, y: 56, width: 68, height: 36, rotation: 1 },
    ],
  },
  {
    photoSlots: 6,
    textSlots: 3,
    slots: [
      { side: "left", kind: "photo", x: 6, y: 6, width: 40, height: 34, rotation: -3 },
      { side: "left", kind: "photo", x: 50, y: 10, width: 40, height: 34, rotation: 2 },
      { side: "left", kind: "text", x: 10, y: 46, width: 76, height: 18, rotation: -1 },
      { side: "left", kind: "photo", x: 12, y: 68, width: 34, height: 28, rotation: 3 },
      { side: "left", kind: "text", x: 50, y: 68, width: 40, height: 28, rotation: -2 },
      { side: "right", kind: "photo", x: 8, y: 8, width: 44, height: 36, rotation: 2 },
      { side: "right", kind: "photo", x: 54, y: 6, width: 38, height: 32, rotation: -3 },
      { side: "right", kind: "text", x: 10, y: 48, width: 40, height: 22, rotation: 1 },
      { side: "right", kind: "photo", x: 54, y: 44, width: 38, height: 30, rotation: 2 },
      { side: "right", kind: "text", x: 12, y: 74, width: 76, height: 20, rotation: -1 },
    ],
  },
];

function pickTemplate(photoCount: number, textCount: number): Template {
  let best = TEMPLATES[0];
  let bestScore = Infinity;
  for (const t of TEMPLATES) {
    const score = Math.abs(t.photoSlots - photoCount) * 2 + Math.abs(t.textSlots - textCount);
    if (score < bestScore) {
      bestScore = score;
      best = t;
    }
  }
  return best;
}

const jitter = (n: number) => n + (Math.random() * 4 - 2);

/**
 * Returns a list of slots to fill in order, one per requested photo then one
 * per requested text box. If you ask for more of something than the template
 * has room for, extras are cycled through the same slots with a little
 * jitter so they still look intentional rather than stacked exactly.
 */
export function generateLayout(photoCount: number, textCount: number): Slot[] {
  const template = pickTemplate(photoCount, textCount);
  const photoSlots = template.slots.filter((s) => s.kind === "photo");
  const textSlots = template.slots.filter((s) => s.kind === "text");

  const result: Slot[] = [];

  for (let i = 0; i < photoCount; i++) {
    const base = photoSlots[i % photoSlots.length];
    const cycle = Math.floor(i / photoSlots.length);
    result.push({
      ...base,
      x: Math.min(85, jitter(base.x + cycle * 3)),
      y: Math.min(80, jitter(base.y + cycle * 3)),
      rotation: jitter(base.rotation),
    });
  }

  for (let i = 0; i < textCount; i++) {
    const base = textSlots[i % textSlots.length];
    const cycle = Math.floor(i / textSlots.length);
    result.push({
      ...base,
      x: Math.min(80, jitter(base.x + cycle * 3)),
      y: Math.min(85, jitter(base.y + cycle * 3)),
      rotation: jitter(base.rotation),
    });
  }

  return result;
}
