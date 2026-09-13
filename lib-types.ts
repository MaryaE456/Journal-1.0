// Core data model for the scrapbook journal.
// A "page" here is one side of an open book (left or right).
// A "spread" is one left+right pair — the unit an event/outing gets one or more of.

export type FontKey = "script" | "hand" | "type" | "serif" | "ui";

export type PhotoFrame = "none" | "polaroid" | "torn" | "tape";

export type PageBackground =
  | "cream"
  | "lined"
  | "kraft"
  | "grid";

interface BaseElement {
  id: string;
  /** position + size are percentages (0-100) of the page's width/height,
   * so layouts hold up across screen sizes */
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  zIndex: number;
}

export interface PhotoElement extends BaseElement {
  type: "photo";
  imageId: string; // key into the images object store
  frame: PhotoFrame;
}

export interface TextElement extends BaseElement {
  type: "text";
  content: string;
  font: FontKey;
  color: string;
  fontSize: number; // px, at 100% page width reference
  align: "left" | "center" | "right";
  background: "none" | "paper" | "highlight" | "tape-strip";
}

export interface StickerElement extends BaseElement {
  type: "sticker";
  stickerId: string; // built-in sticker id, or "custom:<imageId>"
}

export type JournalElement = PhotoElement | TextElement | StickerElement;

export interface JournalPage {
  id: string;
  background: PageBackground;
  elements: JournalElement[];
}

export interface Spread {
  id: string;
  entryId: string;
  order: number;
  left: JournalPage;
  right: JournalPage;
  createdAt: number;
  updatedAt: number;
}

export interface Entry {
  id: string;
  title: string;
  date: string; // yyyy-mm-dd, the date of the event/outing
  createdAt: number;
  updatedAt: number;
  coverImageId?: string;
}
