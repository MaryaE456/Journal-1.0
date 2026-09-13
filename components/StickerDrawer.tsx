"use client";

import { useEffect, useRef, useState } from "react";
import { BUILT_IN_STICKERS } from "@/lib/stickers";
import { putCustomSticker, getAllCustomStickerIds, getCustomStickerUrl } from "@/lib/db";
import { newId } from "@/lib/id";

export default function StickerDrawer({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (stickerId: string) => void;
}) {
  const [customIds, setCustomIds] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) refreshCustom();
  }, [open]);

  async function refreshCustom() {
    const ids = await getAllCustomStickerIds();
    setCustomIds(ids);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      const id = newId();
      await putCustomSticker(id, file);
    }
    e.target.value = "";
    refreshCustom();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-paper shadow-spread z-40 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-kraft-dark/20">
        <h3 className="font-script text-3xl text-ink">Stickers</h3>
        <button onClick={onClose} className="font-ui text-sm text-ink-light hover:text-ink">
          close ✕
        </button>
      </div>

      <div className="p-5 overflow-y-auto flex-1">
        <p className="font-ui text-xs uppercase tracking-wide text-ink-light mb-3">Starter pack</p>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {BUILT_IN_STICKERS.map((s) => (
            <button
              key={s.id}
              onClick={() => onPick(s.id)}
              title={s.label}
              className="aspect-square bg-white/50 hover:bg-white rounded-sm p-2 shadow-page hover:-translate-y-0.5 transition-transform"
            >
              {s.render()}
            </button>
          ))}
        </div>

        <p className="font-ui text-xs uppercase tracking-wide text-ink-light mb-3">Your uploads</p>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {customIds.map((id) => (
            <CustomStickerButton key={id} id={id} onPick={onPick} />
          ))}
          <button
            onClick={() => fileRef.current?.click()}
            className="aspect-square border-2 border-dashed border-kraft-dark/40 rounded-sm flex items-center justify-center text-2xl text-kraft-dark/60 hover:border-rust hover:text-rust transition-colors"
            title="Upload a sticker image"
          >
            +
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
        <p className="font-ui text-[11px] text-ink-light leading-relaxed">
          Tip: PNGs with transparent backgrounds look best as stickers. Screenshot cute shapes from
          anywhere and drop them in here.
        </p>
      </div>
    </div>
  );
}

function CustomStickerButton({ id, onPick }: { id: string; onPick: (stickerId: string) => void }) {
  const [url, setUrl] = useState<string | undefined>();
  useEffect(() => {
    getCustomStickerUrl(id).then(setUrl);
  }, [id]);
  return (
    <button
      onClick={() => onPick(`custom:${id}`)}
      className="aspect-square bg-white/50 hover:bg-white rounded-sm p-1.5 shadow-page hover:-translate-y-0.5 transition-transform overflow-hidden"
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-full h-full object-contain" />
      ) : (
        <div className="w-full h-full bg-paper-dark animate-pulse" />
      )}
    </button>
  );
}
