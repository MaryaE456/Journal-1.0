"use client";

import { useRef, useState, useCallback } from "react";
import { JournalElement, TextElement } from "@/lib/types";
import ElementContent from "./ElementContent";
import { fontClassName } from "@/lib/fontMap";

type DragMode = "move" | "resize" | "rotate" | null;

export default function CanvasElement({
  element,
  containerRef,
  selected,
  onSelect,
  onChange,
  onDelete,
}: {
  element: JournalElement;
  containerRef: React.RefObject<HTMLDivElement>;
  selected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<JournalElement>) => void;
  onDelete: () => void;
}) {
  const modeRef = useRef<DragMode>(null);
  const startRef = useRef({ mouseX: 0, mouseY: 0, x: 0, y: 0, width: 0, height: 0, rotation: 0 });
  const [editingText, setEditingText] = useState(false);

  const getRect = useCallback(() => containerRef.current?.getBoundingClientRect(), [containerRef]);

  const onPointerDownMove = (e: React.PointerEvent) => {
    if (editingText) return;
    e.stopPropagation();
    onSelect();
    modeRef.current = "move";
    startRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation,
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerDownResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    modeRef.current = "resize";
    startRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation,
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerDownRotate = (e: React.PointerEvent) => {
    e.stopPropagation();
    modeRef.current = "rotate";
    startRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation,
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const mode = modeRef.current;
    if (!mode) return;
    const rect = getRect();
    if (!rect) return;
    const s = startRef.current;

    if (mode === "move") {
      const dxPct = ((e.clientX - s.mouseX) / rect.width) * 100;
      const dyPct = ((e.clientY - s.mouseY) / rect.height) * 100;
      onChange({
        x: clamp(s.x + dxPct, -10, 100 - s.width + 10),
        y: clamp(s.y + dyPct, -10, 100 - s.height + 10),
      });
    } else if (mode === "resize") {
      const dxPct = ((e.clientX - s.mouseX) / rect.width) * 100;
      const dyPct = ((e.clientY - s.mouseY) / rect.height) * 100;
      onChange({
        width: clamp(s.width + dxPct, 4, 100),
        height: clamp(s.height + dyPct, 4, 100),
      });
    } else if (mode === "rotate") {
      const centerX = rect.left + ((s.x + s.width / 2) / 100) * rect.width;
      const centerY = rect.top + ((s.y + s.height / 2) / 100) * rect.height;
      const angle = (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI;
      onChange({ rotation: Math.round(angle + 90) });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    modeRef.current = null;
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div
      className="absolute group/el"
      style={{
        left: `${element.x}%`,
        top: `${element.y}%`,
        width: `${element.width}%`,
        height: `${element.height}%`,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex,
        cursor: editingText ? "text" : "grab",
        touchAction: "none",
      }}
      onPointerDown={onPointerDownMove}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={() => element.type === "text" && setEditingText(true)}
    >
      {element.type === "text" && editingText ? (
        <TextEditOverlay
          element={element}
          onCommit={(content) => {
            onChange({ content });
            setEditingText(false);
          }}
        />
      ) : (
        <ElementContent element={element} />
      )}

      {selected && !editingText && (
        <>
          <div className="absolute -inset-1 border-2 border-rust pointer-events-none" />
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute -top-4 -right-4 w-7 h-7 bg-rust text-paper rounded-full text-xs flex items-center justify-center shadow-lift"
            title="Delete"
          >
            ✕
          </button>
          <div
            onPointerDown={onPointerDownRotate}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="absolute left-1/2 -top-9 -translate-x-1/2 w-5 h-5 bg-sage rounded-full cursor-grab shadow-lift"
            title="Rotate"
          />
          <div
            onPointerDown={onPointerDownResize}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="absolute -bottom-2 -right-2 w-5 h-5 bg-kraft-dark rounded-sm cursor-se-resize shadow-lift"
            title="Resize"
          />
        </>
      )}
    </div>
  );
}

function TextEditOverlay({
  element,
  onCommit,
}: {
  element: TextElement;
  onCommit: (content: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  return (
    <textarea
      ref={ref}
      autoFocus
      defaultValue={element.content}
      onFocus={(e) => e.currentTarget.select()}
      onPointerDown={(e) => e.stopPropagation()}
      onBlur={(e) => onCommit(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCommit(element.content);
      }}
      className={`w-full h-full resize-none outline-none bg-white/70 border-2 border-rust p-1 ${fontClassName(
        element.font
      )}`}
      style={{ color: element.color, fontSize: `${element.fontSize}%`, textAlign: element.align }}
    />
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
