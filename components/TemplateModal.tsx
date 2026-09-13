"use client";

import { useRef, useState } from "react";
import { generateLayout } from "@/lib/templates";
import { putImage } from "@/lib/db";
import { newId } from "@/lib/id";
import { JournalElement } from "@/lib/types";

export default function TemplateModal({
  open,
  onClose,
  onGenerate,
  startZIndex,
}: {
  open: boolean;
  onClose: () => void;
  onGenerate: (result: { left: JournalElement[]; right: JournalElement[] }) => void;
  startZIndex: number;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [textCount, setTextCount] = useState(2);
  const [working, setWorking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  async function handleGenerate() {
    setWorking(true);
    try {
      const photoCount = files.length;
      const slots = generateLayout(photoCount, textCount);

      // upload photos to IndexedDB first, collecting their ids in order
      const imageIds: string[] = [];
      for (const file of files) {
        const id = newId();
        await putImage(id, file);
        imageIds.push(id);
      }

      const left: JournalElement[] = [];
      const right: JournalElement[] = [];
      let z = startZIndex;
      let photoIdx = 0;
      let textIdx = 0;

      for (const slot of slots) {
        z += 1;
        if (slot.kind === "photo") {
          const imageId = imageIds[photoIdx % Math.max(imageIds.length, 1)];
          photoIdx += 1;
          if (!imageId) continue;
          const el: JournalElement = {
            id: newId(),
            type: "photo",
            imageId,
            frame: photoIdx % 2 === 0 ? "polaroid" : "torn",
            x: slot.x,
            y: slot.y,
            width: slot.width,
            height: slot.height,
            rotation: slot.rotation,
            zIndex: z,
          };
          (slot.side === "left" ? left : right).push(el);
        } else {
          if (textIdx >= textCount) continue;
          textIdx += 1;
          const el: JournalElement = {
            id: newId(),
            type: "text",
            content: "",
            font: textIdx % 2 === 0 ? "hand" : "script",
            color: "#3E2C23",
            fontSize: 110,
            align: "left",
            background: "none",
            x: slot.x,
            y: slot.y,
            width: slot.width,
            height: slot.height,
            rotation: slot.rotation,
            zIndex: z,
          };
          (slot.side === "left" ? left : right).push(el);
        }
      }

      onGenerate({ left, right });
      setFiles([]);
      onClose();
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-paper rounded-sm shadow-spread p-8 w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-script text-4xl text-ink mb-1">Auto-arrange this spread</h2>
        <p className="font-ui text-sm text-ink-light mb-6">
          Upload your photos, tell it how many text boxes you want, and it'll lay the spread out for
          you. You can still drag anything afterward.
        </p>

        <label className="block font-ui text-xs uppercase tracking-wide text-ink-light mb-2">
          Photos
        </label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-kraft-dark/40 rounded-sm p-6 text-center cursor-pointer hover:border-rust transition-colors mb-2"
        >
          <p className="font-hand text-lg text-ink">
            {files.length > 0 ? `${files.length} photo${files.length > 1 ? "s" : ""} selected` : "Click to choose photos"}
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
        {files.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {files.map((f, i) => (
              <span key={i} className="font-ui text-[11px] bg-paper-dark px-2 py-1 rounded-sm text-ink-light">
                {f.name}
              </span>
            ))}
          </div>
        )}

        <label className="block font-ui text-xs uppercase tracking-wide text-ink-light mb-2 mt-4">
          Number of text boxes: {textCount}
        </label>
        <input
          type="range"
          min={0}
          max={4}
          value={textCount}
          onChange={(e) => setTextCount(Number(e.target.value))}
          className="w-full mb-6 accent-rust"
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="font-ui text-sm text-ink-light px-4 py-2 hover:text-ink">
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={working || files.length === 0}
            className="font-hand text-lg bg-rust text-paper px-5 py-2 rounded-sm shadow-lift disabled:opacity-50"
          >
            {working ? "Arranging…" : "Generate layout"}
          </button>
        </div>
      </div>
    </div>
  );
}
