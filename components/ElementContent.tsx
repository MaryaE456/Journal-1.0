"use client";

import { useEffect, useState } from "react";
import { JournalElement } from "@/lib/types";
import { getImageUrl, getCustomStickerUrl } from "@/lib/db";
import { fontClassName } from "@/lib/fontMap";
import { BUILT_IN_STICKERS } from "@/lib/stickers";

export default function ElementContent({ element }: { element: JournalElement }) {
  if (element.type === "photo") return <PhotoContent element={element} />;
  if (element.type === "text") return <TextContent element={element} />;
  return <StickerContent element={element} />;
}

function PhotoContent({ element }: { element: Extract<JournalElement, { type: "photo" }> }) {
  const [url, setUrl] = useState<string | undefined>();

  useEffect(() => {
    let active = true;
    getImageUrl(element.imageId).then((u) => active && setUrl(u));
    return () => {
      active = false;
    };
  }, [element.imageId]);

  const frameClass =
    element.frame === "polaroid"
      ? "bg-white p-[6%] pb-[16%] shadow-lift"
      : element.frame === "tape"
      ? "bg-white p-[3%] shadow-lift"
      : element.frame === "torn"
      ? "bg-paper p-[3%] shadow-lift torn-top torn-bottom"
      : "shadow-lift";

  return (
    <div className={`relative w-full h-full ${frameClass}`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-full h-full object-cover select-none pointer-events-none" draggable={false} />
      ) : (
        <div className="w-full h-full bg-paper-dark animate-pulse" />
      )}
      {element.frame === "tape" && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-6 bg-tape/80 rotate-[-3deg] shadow-sm" />
      )}
    </div>
  );
}

function TextContent({ element }: { element: Extract<JournalElement, { type: "text" }> }) {
  const bgClass =
    element.background === "paper"
      ? "bg-paper/90 px-3 py-2 shadow-page"
      : element.background === "highlight"
      ? "bg-tape/50 px-2 py-1"
      : element.background === "tape-strip"
      ? "bg-tape/70 px-2 py-1"
      : "";

  return (
    <div
      className={`w-full h-full flex items-center ${bgClass} ${fontClassName(element.font)}`}
      style={{
        color: element.color,
        justifyContent: element.align === "center" ? "center" : element.align === "right" ? "flex-end" : "flex-start",
        textAlign: element.align,
        fontSize: `${element.fontSize}%`,
        lineHeight: 1.25,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflow: "hidden",
      }}
    >
      <span className="w-full">{element.content || "…"}</span>
    </div>
  );
}

function StickerContent({ element }: { element: Extract<JournalElement, { type: "sticker" }> }) {
  const [customUrl, setCustomUrl] = useState<string | undefined>();
  const isCustom = element.stickerId.startsWith("custom:");

  useEffect(() => {
    if (isCustom) {
      const imageId = element.stickerId.slice("custom:".length);
      getCustomStickerUrl(imageId).then(setCustomUrl);
    }
  }, [element.stickerId, isCustom]);

  if (isCustom) {
    return customUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={customUrl} alt="" className="w-full h-full object-contain select-none pointer-events-none" draggable={false} />
    ) : (
      <div className="w-full h-full bg-paper-dark/50 animate-pulse rounded-full" />
    );
  }

  const def = BUILT_IN_STICKERS.find((s) => s.id === element.stickerId);
  return <div className="w-full h-full pointer-events-none [&>svg]:w-full [&>svg]:h-full">{def?.render()}</div>;
}
