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

function ShapeBackground({ shape }: { shape: import("@/lib/types").TextShape }) {
  const common = { preserveAspectRatio: "none" as const, className: "absolute inset-0 w-full h-full" };
  if (shape === "heart") {
    return (
      <svg viewBox="0 0 100 90" {...common}>
        <path
          d="M50 84C50 84 8 56 8 30C8 12 24 4 38 12C44 15.5 50 24 50 24C50 24 56 15.5 62 12C76 4 92 12 92 30C92 56 50 84 50 84Z"
          fill="#EFD9DC"
          stroke="#C9525E"
          strokeWidth="2"
        />
      </svg>
    );
  }
  if (shape === "star") {
    return (
      <svg viewBox="0 0 100 100" {...common}>
        <path
          d="M50 4L63 36L98 39L70 61L80 96L50 76L20 96L30 61L2 39L37 36Z"
          fill="#F3ECDD"
          stroke="#C9B896"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 70" {...common}>
      <path
        d="M25 60C13 60 8 50 15 42C10 31 22 21 32 25C36 15 55 13 60 24C74 21 84 33 78 43C86 46 85 60 74 60Z"
        fill="#F3ECDD"
        stroke="#C9B896"
        strokeWidth="2"
      />
    </svg>
  );
}

function TextContent({ element }: { element: Extract<JournalElement, { type: "text" }> }) {
  if (element.background === "shape") {
    return (
      <div className="relative w-full h-full flex items-center justify-center p-[12%]">
        <ShapeBackground shape={element.shape ?? "heart"} />
        <span
          className={`relative z-10 w-full text-center ${fontClassName(element.font)}`}
          style={{
            color: element.color,
            fontSize: `${element.fontSize}%`,
            lineHeight: 1.2,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {element.content || "…"}
        </span>
      </div>
    );
  }

  const bgClass =
    element.background === "paper"
      ? "bg-paper bg-lined-page px-3 py-2 shadow-page"
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
