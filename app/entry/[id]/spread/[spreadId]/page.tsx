"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Spread,
  JournalPage,
  JournalElement,
  PhotoElement,
  TextElement,
  PhotoFrame,
  FontKey,
} from "@/lib/types";
import { getSpread, putSpread, putImage } from "@/lib/db";
import { newId } from "@/lib/id";
import CanvasElement from "@/components/CanvasElement";
import StickerDrawer from "@/components/StickerDrawer";
import TemplateModal from "@/components/TemplateModal";
import ColorPicker from "@/components/ColorPicker";
import { FONT_OPTIONS, TEXT_COLOR_OPTIONS, BACKGROUND_STYLES, SHAPE_OPTIONS } from "@/lib/fontMap";

type Side = "left" | "right";

export default function SpreadEditorPage({ params }: { params: { id: string; spreadId: string } }) {
  const [spread, setSpread] = useState<Spread | null>(null);
  const [activeSide, setActiveSide] = useState<Side>("left");
  const [selected, setSelected] = useState<{ side: Side; id: string } | null>(null);
  const [stickerOpen, setStickerOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getSpread(params.spreadId).then((s) => s && setSpread(s));
  }, [params.spreadId]);

  const scheduleSave = useCallback((next: Spread) => {
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await putSpread({ ...next, updatedAt: Date.now() });
      setSaveState("saved");
    }, 500);
  }, []);

  function updatePage(side: Side, updater: (page: JournalPage) => JournalPage) {
    setSpread((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [side]: updater(prev[side]) };
      scheduleSave(next);
      return next;
    });
  }

  function nextZ(page: JournalPage): number {
    return page.elements.reduce((max, e) => Math.max(max, e.zIndex), 0) + 1;
  }

  function addElement(side: Side, build: (z: number) => JournalElement) {
    updatePage(side, (page) => ({ ...page, elements: [...page.elements, build(nextZ(page))] }));
  }

  function updateElement(side: Side, id: string, patch: Partial<JournalElement>) {
    updatePage(side, (page) => ({
      ...page,
      elements: page.elements.map((e) => (e.id === id ? ({ ...e, ...patch } as JournalElement) : e)),
    }));
  }

  function deleteElement(side: Side, id: string) {
    updatePage(side, (page) => ({ ...page, elements: page.elements.filter((e) => e.id !== id) }));
    setSelected(null);
  }

  function setBackgroundStyle(side: Side, style: JournalPage["background"]["style"]) {
    updatePage(side, (page) => ({ ...page, background: { ...page.background, style } }));
  }

  function setBackgroundColor(side: Side, color: string) {
    updatePage(side, (page) => ({ ...page, background: { ...page.background, color } }));
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    for (const file of files) {
      const id = newId();
      await putImage(id, file);
      addElement(activeSide, (z) => ({
        id: newId(),
        type: "photo",
        imageId: id,
        frame: "polaroid",
        x: 25 + Math.random() * 15,
        y: 20 + Math.random() * 15,
        width: 40,
        height: 40,
        rotation: Math.round(Math.random() * 10 - 5),
        zIndex: z,
      }));
    }
  }

  function handleAddText() {
    addElement(activeSide, (z) => {
      const el: TextElement = {
        id: newId(),
        type: "text",
        content: "",
        font: "hand",
        color: "#2B1A16",
        fontSize: 110,
        align: "left",
        background: "none",
        x: 25,
        y: 25,
        width: 50,
        height: 16,
        rotation: 0,
        zIndex: z,
      };
      setSelected({ side: activeSide, id: el.id });
      return el;
    });
  }

  function handlePickSticker(stickerId: string) {
    const isTape = stickerId.startsWith("washi-strip");
    addElement(activeSide, (z) => ({
      id: newId(),
      type: "sticker",
      stickerId,
      x: 40,
      y: 40,
      width: isTape ? 22 : 14,
      height: isTape ? 7 : 14,
      rotation: Math.round(Math.random() * 16 - 8),
      zIndex: z,
    }));
    setStickerOpen(false);
  }

  function handleTemplateGenerate(result: { left: JournalElement[]; right: JournalElement[] }) {
    setSpread((prev) => {
      if (!prev) return prev;
      const next: Spread = {
        ...prev,
        left: { ...prev.left, elements: [...prev.left.elements, ...result.left] },
        right: { ...prev.right, elements: [...prev.right.elements, ...result.right] },
      };
      scheduleSave(next);
      return next;
    });
  }

  function bringToFront(side: Side, id: string) {
    updatePage(side, (page) => {
      const z = nextZ(page);
      return { ...page, elements: page.elements.map((e) => (e.id === id ? { ...e, zIndex: z } : e)) };
    });
  }

  function sendToBack(side: Side, id: string) {
    updatePage(side, (page) => {
      const minZ = page.elements.reduce((m, e) => Math.min(m, e.zIndex), 0) - 1;
      return { ...page, elements: page.elements.map((e) => (e.id === id ? { ...e, zIndex: minZ } : e)) };
    });
  }

  if (!spread) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-type text-xl text-ink-light">opening this page…</p>
      </main>
    );
  }

  const selectedElement =
    selected && spread[selected.side].elements.find((e) => e.id === selected.id);

  return (
    <main className="min-h-screen flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-5xl flex items-center justify-between mb-5">
        <Link href={`/entry/${params.id}`} className="font-type text-sm text-ink-light hover:text-white">
          ← back to spreads
        </Link>
        <span className="font-type text-xs text-ink-light">
          {saveState === "saving" ? "saving…" : saveState === "saved" ? "saved" : ""}
        </span>
      </div>

      {/* Toolbar */}
      <div className="w-full max-w-5xl bg-paper rounded-sm shadow-page p-3 mb-5 flex flex-wrap items-center gap-2">
        <ToolButton onClick={() => photoInputRef.current?.click()}>+ Photo</ToolButton>
        <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
        <ToolButton onClick={handleAddText}>+ Text</ToolButton>
        <ToolButton onClick={() => setStickerOpen(true)}>+ Sticker</ToolButton>
        <ToolButton onClick={() => setTemplateOpen(true)} accent>
          ✨ Auto-arrange
        </ToolButton>

        <div className="ml-auto flex items-center gap-2">
          <span className="font-type text-xs text-ink-light">editing:</span>
          <div className="flex rounded-sm overflow-hidden border border-kraft-dark/30">
            <button
              onClick={() => setActiveSide("left")}
              className={`font-type text-xs px-3 py-1.5 ${activeSide === "left" ? "bg-rust text-paper" : "bg-white/50 text-ink"}`}
            >
              left page
            </button>
            <button
              onClick={() => setActiveSide("right")}
              className={`font-type text-xs px-3 py-1.5 ${activeSide === "right" ? "bg-rust text-paper" : "bg-white/50 text-ink"}`}
            >
              right page
            </button>
          </div>
        </div>
      </div>

      {/* background pickers */}
      <div className="w-full max-w-5xl flex justify-between mb-3 px-1">
        <BackgroundPicker
          background={spread.left.background}
          onStyleChange={(s) => setBackgroundStyle("left", s)}
          onColorChange={(c) => setBackgroundColor("left", c)}
        />
        <BackgroundPicker
          background={spread.right.background}
          onStyleChange={(s) => setBackgroundStyle("right", s)}
          onColorChange={(c) => setBackgroundColor("right", c)}
        />
      </div>

      {/* contextual panel */}
      {selectedElement && (
        <div className="w-full max-w-5xl bg-paper rounded-sm shadow-page p-3 mb-5">
          {selectedElement.type === "text" && (
            <TextControls
              element={selectedElement}
              onChange={(patch) => updateElement(selected!.side, selected!.id, patch)}
            />
          )}
          {selectedElement.type === "photo" && (
            <PhotoControls
              element={selectedElement}
              onChange={(patch) => updateElement(selected!.side, selected!.id, patch)}
            />
          )}
          <div className="flex gap-2 mt-2 pt-2 border-t border-kraft-dark/15">
            <ToolButton onClick={() => bringToFront(selected!.side, selected!.id)}>Bring to front</ToolButton>
            <ToolButton onClick={() => sendToBack(selected!.side, selected!.id)}>Send to back</ToolButton>
            <ToolButton onClick={() => deleteElement(selected!.side, selected!.id)}>Delete</ToolButton>
          </div>
        </div>
      )}

      {/* the open book */}
      <div className="w-full max-w-5xl bg-[#3D0E15] rounded-sm shadow-spread p-3 md:p-5 flex gap-[2px] relative">
        <PageArea
          side="left"
          page={spread.left}
          containerRef={leftRef}
          isActive={activeSide === "left"}
          selectedId={selected?.side === "left" ? selected.id : null}
          onFocus={() => setActiveSide("left")}
          onSelect={(id) => setSelected(id ? { side: "left", id } : null)}
          onChange={(id, patch) => updateElement("left", id, patch)}
          onDelete={(id) => deleteElement("left", id)}
        />
        <div className="w-2 bg-gradient-to-r from-black/30 via-black/10 to-black/30" />
        <PageArea
          side="right"
          page={spread.right}
          containerRef={rightRef}
          isActive={activeSide === "right"}
          selectedId={selected?.side === "right" ? selected.id : null}
          onFocus={() => setActiveSide("right")}
          onSelect={(id) => setSelected(id ? { side: "right", id } : null)}
          onChange={(id, patch) => updateElement("right", id, patch)}
          onDelete={(id) => deleteElement("right", id)}
        />
      </div>

      <StickerDrawer open={stickerOpen} onClose={() => setStickerOpen(false)} onPick={handlePickSticker} />
      <TemplateModal
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        onGenerate={handleTemplateGenerate}
        startZIndex={Math.max(nextZ(spread.left), nextZ(spread.right))}
      />
    </main>
  );
}

function PageArea({
  side,
  page,
  containerRef,
  isActive,
  selectedId,
  onFocus,
  onSelect,
  onChange,
  onDelete,
}: {
  side: Side;
  page: JournalPage;
  containerRef: React.RefObject<HTMLDivElement>;
  isActive: boolean;
  selectedId: string | null;
  onFocus: () => void;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<JournalElement>) => void;
  onDelete: (id: string) => void;
}) {
  const pattern = BACKGROUND_STYLES.find((b) => b.key === page.background.style)?.patternClassName ?? "";
  return (
    <div
      ref={containerRef}
      onPointerDown={() => {
        onFocus();
        onSelect(null);
      }}
      style={{ backgroundColor: page.background.color }}
      className={`relative flex-1 aspect-[3/4] overflow-hidden ${pattern} ${
        isActive ? "ring-2 ring-inset ring-rust/40" : ""
      }`}
    >
      {[...page.elements]
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((el) => (
          <CanvasElement
            key={el.id}
            element={el}
            containerRef={containerRef}
            selected={selectedId === el.id}
            onSelect={() => {
              onFocus();
              onSelect(el.id);
            }}
            onChange={(patch) => onChange(el.id, patch)}
            onDelete={() => onDelete(el.id)}
          />
        ))}
      {page.elements.length === 0 && (
        <p className="absolute inset-0 flex items-center justify-center font-type text-ink-light/50 text-lg pointer-events-none">
          {side} page
        </p>
      )}
    </div>
  );
}

function ToolButton({
  children,
  onClick,
  accent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-type text-xs uppercase tracking-wide px-4 py-1.5 rounded-sm shadow-page hover:-translate-y-0.5 transition-transform ${
        accent ? "bg-sage text-paper" : "bg-white/60 text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function BackgroundPicker({
  background,
  onStyleChange,
  onColorChange,
}: {
  background: JournalPage["background"];
  onStyleChange: (s: JournalPage["background"]["style"]) => void;
  onColorChange: (c: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5">
        {BACKGROUND_STYLES.map((b) => (
          <button
            key={b.key}
            onClick={() => onStyleChange(b.key)}
            title={b.label}
            style={{ backgroundColor: background.color }}
            className={`w-6 h-6 rounded-full border-2 ${b.patternClassName} ${
              background.style === b.key ? "border-rust" : "border-white/60"
            }`}
          />
        ))}
      </div>
      <div className="w-px h-5 bg-kraft-dark/20" />
      <ColorPicker color={background.color} onChange={onColorChange} />
      <span className="font-type text-[10px] text-ink-light">colors</span>
    </div>
  );
}

function TextControls({
  element,
  onChange,
}: {
  element: TextElement;
  onChange: (patch: Partial<TextElement>) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <select
        value={element.font}
        onChange={(e) => onChange({ font: e.target.value as FontKey })}
        className={`font-type text-sm px-2.5 py-1.5 rounded-sm border border-kraft-dark/25 bg-white/60`}
      >
        {FONT_OPTIONS.map((f) => (
          <option key={f.key} value={f.key}>
            {f.label}
          </option>
        ))}
      </select>
      <div className="flex gap-1">
        {TEXT_COLOR_OPTIONS.map((c) => (
          <button
            key={c}
            onClick={() => onChange({ color: c })}
            style={{ backgroundColor: c }}
            className={`w-6 h-6 rounded-full border-2 ${element.color === c ? "border-ink" : "border-white"}`}
          />
        ))}
      </div>
      <div className="flex gap-1">
        {(["left", "center", "right"] as const).map((a) => (
          <button
            key={a}
            onClick={() => onChange({ align: a })}
            className={`font-type text-xs px-2 py-1 rounded-sm border ${
              element.align === a ? "border-rust bg-rust/10" : "border-kraft-dark/25 bg-white/50"
            }`}
          >
            {a}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-type text-xs text-ink-light">size</span>
        <input
          type="range"
          min={50}
          max={250}
          value={element.fontSize}
          onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
          className="accent-rust"
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {(["none", "paper", "shape", "tape-strip"] as const).map((b) => (
            <button
              key={b}
              onClick={() => onChange({ background: b, shape: b === "shape" ? element.shape ?? "heart" : element.shape })}
              className={`font-type text-xs px-2 py-1 rounded-sm border ${
                element.background === b ? "border-rust bg-rust/10" : "border-kraft-dark/25 bg-white/50"
              }`}
            >
              {b === "paper" ? "lined paper" : b}
            </button>
          ))}
        </div>
        {element.background === "shape" && (
          <div className="flex gap-1">
            {SHAPE_OPTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => onChange({ shape: s.key })}
                className={`font-type text-xs px-2 py-1 rounded-sm border ${
                  (element.shape ?? "heart") === s.key ? "border-rust bg-rust/10" : "border-kraft-dark/25 bg-white/50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PhotoControls({
  element,
  onChange,
}: {
  element: PhotoElement;
  onChange: (patch: Partial<PhotoElement>) => void;
}) {
  return (
    <div className="flex gap-1">
      {(["none", "polaroid", "torn", "tape"] as PhotoFrame[]).map((f) => (
        <button
          key={f}
          onClick={() => onChange({ frame: f })}
          className={`font-type text-xs px-3 py-1.5 rounded-sm border ${
            element.frame === f ? "border-rust bg-rust/10" : "border-kraft-dark/25 bg-white/50"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
