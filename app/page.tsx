"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Entry } from "@/lib/types";
import { getAllEntries, putEntry, deleteEntry, getImageUrl, putImage } from "@/lib/db";
import { newId } from "@/lib/id";
import { BUILT_IN_STICKERS } from "@/lib/stickers";

const CARD_STICKERS = ["heart", "star", "bow", "cherries", "sparkle", "vinyl"];

// cream/taupe decorations scattered across the homepage — opaque, not
// see-through, matching a soft "collected keepsakes" aesthetic
function SolidStar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <path
        d="M50 8L61 38L93 40L67 60L77 92L50 73L23 92L33 60L7 40L39 38Z"
        fill="#EDE4D3"
        stroke="#C9B896"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GinghamHeart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 90" className={className} fill="none">
      <path
        d="M50 84C50 84 8 56 8 30C8 12 24 4 38 12C44 15.5 50 24 50 24C50 24 56 15.5 62 12C76 4 92 12 92 30C92 56 50 84 50 84Z"
        fill="#D9C7A8"
      />
      <g stroke="#C9B080" strokeWidth="2" opacity="0.6">
        <line x1="20" y1="20" x2="20" y2="70" />
        <line x1="35" y1="12" x2="35" y2="78" />
        <line x1="50" y1="10" x2="50" y2="82" />
        <line x1="65" y1="12" x2="65" y2="78" />
        <line x1="80" y1="20" x2="80" y2="70" />
        <line x1="10" y1="30" x2="90" y2="30" />
        <line x1="8" y1="45" x2="92" y2="45" />
        <line x1="14" y1="60" x2="86" y2="60" />
      </g>
      <path
        d="M50 84C50 84 8 56 8 30C8 12 24 4 38 12C44 15.5 50 24 50 24C50 24 56 15.5 62 12C76 4 92 12 92 30C92 56 50 84 50 84Z"
        stroke="#B9A87F"
        strokeWidth="3"
      />
    </svg>
  );
}

function Spiral({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <path
        d="M50 50C50 30 70 30 70 50C70 75 35 75 35 45C35 15 80 15 80 50C80 90 20 90 20 45"
        stroke="#C9B896"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function MoonCream({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <path
        d="M65 12C42 12 24 30 24 53C24 76 42 94 65 94C48 88 36 72 36 53C36 34 48 18 65 12Z"
        fill="#EDE4D3"
        stroke="#C9B896"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloudCream({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 70" className={className} fill="none">
      <path
        d="M25 55C13 55 8 45 15 37C10 26 22 16 32 20C36 10 55 8 60 19C74 16 84 28 78 38C86 41 85 55 74 55Z"
        fill="#EDE4D3"
        stroke="#C9B896"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function BowCream({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 70" className={className} fill="none">
      <path d="M48 35C48 35 10 10 6 35C2 60 48 35 48 35Z" fill="#EDE4D3" stroke="#C9B896" strokeWidth="2.5" />
      <path d="M52 35C52 35 90 10 94 35C98 60 52 35 52 35Z" fill="#EDE4D3" stroke="#C9B896" strokeWidth="2.5" />
      <circle cx="50" cy="35" r="9" fill="#D9C7A8" stroke="#C9B896" strokeWidth="2.5" />
    </svg>
  );
}

// A loose scatter of doodles across the whole page, collage-cover style —
// fixed so it stays put behind the content while scrolling. Fully opaque.
const SCATTER = [
  { El: SolidStar, top: "6%", left: "4%", size: 36, rotate: -10 },
  { El: BowCream, top: "16%", left: "80%", size: 48, rotate: -8 },
  { El: GinghamHeart, top: "68%", left: "8%", size: 44, rotate: 6 },
  { El: Spiral, top: "24%", left: "92%", size: 34, rotate: 0 },
  { El: MoonCream, top: "50%", left: "94%", size: 30, rotate: 0 },
  { El: CloudCream, top: "10%", left: "42%", size: 46, rotate: 0 },
  { El: SolidStar, top: "82%", left: "88%", size: 26, rotate: 10 },
  { El: GinghamHeart, top: "88%", left: "45%", size: 38, rotate: -6 },
  { El: Spiral, top: "58%", left: "2%", size: 30, rotate: 10 },
  { El: BowCream, top: "92%", left: "10%", size: 34, rotate: 8 },
  { El: SolidStar, top: "42%", left: "50%", size: 22, rotate: 14 },
  { El: MoonCream, top: "6%", left: "62%", size: 26, rotate: -6 },
];

function PageDoodles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {SCATTER.map(({ El, top, left, size, rotate }, i) => (
        <div
          key={i}
          className="absolute"
          style={{ top, left, width: size, height: size, transform: `rotate(${rotate}deg)` }}
        >
          <El className="w-full h-full drop-shadow-sm" />
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  async function refresh() {
    const all = await getAllEntries();
    setEntries(all);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function createEntry() {
    if (!title.trim()) return;
    const now = Date.now();
    const entry: Entry = {
      id: newId(),
      title: title.trim(),
      date,
      createdAt: now,
      updatedAt: now,
    };
    await putEntry(entry);
    setShowNew(false);
    setTitle("");
    router.push(`/entry/${entry.id}`);
  }

  async function removeEntry(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this journal entry and all its pages? This can't be undone.")) return;
    await deleteEntry(id);
    refresh();
  }

  async function handleSetCover(entry: Entry, file: File) {
    const imageId = newId();
    await putImage(imageId, file);
    await putEntry({ ...entry, coverImageId: imageId, updatedAt: Date.now() });
    refresh();
  }

  return (
    <main className="min-h-screen px-6 py-12 md:px-16 relative overflow-hidden">
      <PageDoodles />
      <div className="relative z-10">
      <header className="mb-16 flex flex-col items-center text-center gap-4 relative pt-6">
        <button
          onClick={() => setShowNew(true)}
          className="absolute top-6 right-0 font-type text-sm tracking-wide uppercase bg-rust text-paper px-6 py-3 rounded-sm shadow-lift hover:-translate-y-0.5 hover:shadow-page transition-transform -rotate-1"
        >
          + New entry
        </button>

        <p className="font-delicate italic text-2xl md:text-3xl tracking-wide" style={{ color: "#F0DEE0" }}>
          welcome to your own
        </p>
        <h1 className="font-display text-6xl md:text-8xl tracking-wide leading-none" style={{ color: "#F8F1E4" }}>
          DIGITAL SCRAPBOOK
        </h1>
      </header>

      {loading ? (
        <p className="font-hand text-lg" style={{ color: "#F8F1E4" }}>
          unpacking your shelf…
        </p>
      ) : entries.length === 0 ? (
        <div className="border-2 border-dashed border-paper/50 rounded-md p-16 text-center max-w-xl mx-auto">
          <p className="font-hand text-2xl mb-2" style={{ color: "#F8F1E4" }}>
            Your shelf is empty.
          </p>
          <p className="font-ui text-sm" style={{ color: "#F0DEE0" }}>
            Start your first entry — a trip, a dinner, an ordinary Tuesday worth remembering.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onDelete={removeEntry} onSetCover={handleSetCover} />
          ))}
        </div>
      )}

      {showNew && (
        <div
          className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowNew(false)}
        >
          <div
            className="bg-paper rounded-sm shadow-spread p-8 w-full max-w-sm relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-script text-4xl text-ink mb-4">New entry</h2>
            <label className="block font-ui text-xs uppercase tracking-wide text-ink-light mb-1">
              Title
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createEntry()}
              placeholder="Dinner at Nonna's"
              className="w-full font-hand text-xl bg-white/60 border border-kraft-dark/30 rounded-sm px-3 py-2 mb-4 outline-none focus:border-rust"
            />
            <label className="block font-ui text-xs uppercase tracking-wide text-ink-light mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full font-ui bg-white/60 border border-kraft-dark/30 rounded-sm px-3 py-2 mb-6 outline-none focus:border-rust"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNew(false)}
                className="font-ui text-sm text-ink-light px-4 py-2 hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={createEntry}
                className="font-hand text-lg bg-rust text-paper px-5 py-2 rounded-sm shadow-lift"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}

function EntryCard({
  entry,
  onDelete,
  onSetCover,
}: {
  entry: Entry;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onSetCover: (entry: Entry, file: File) => void;
}) {
  const [cover, setCover] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);
  const stickerId = CARD_STICKERS[Math.abs(hashCode(entry.id)) % CARD_STICKERS.length];
  const sticker = BUILT_IN_STICKERS.find((s) => s.id === stickerId);
  const tilt = (Math.abs(hashCode(entry.id)) % 7) - 3; // -3..3 deg

  useEffect(() => {
    if (entry.coverImageId) {
      getImageUrl(entry.coverImageId).then(setCover);
    }
  }, [entry.coverImageId]);

  function openPicker(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    fileRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onSetCover(entry, file);
  }

  return (
    <a
      href={`/entry/${entry.id}`}
      style={{ transform: `rotate(${tilt}deg)` }}
      className="group block hover:-translate-y-1 hover:rotate-0 transition-all pt-6 relative"
    >
      {/* a big piece of decorative tape "holding" the polaroid up */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-28 h-9 bg-tape/90 -rotate-3 shadow-md z-10 border border-black/5" />

      {/* a little sticker peeking off the corner */}
      <div className="absolute top-3 -right-4 w-9 h-9 z-10 drop-shadow-md rotate-6">{sticker?.render()}</div>

      {/* the polaroid itself */}
      <div className="bg-[#FBF7EE] rounded-[2px] shadow-lift group-hover:shadow-spread transition-shadow p-3 pb-6 aspect-[3/4] flex flex-col">
        <button onClick={openPicker} className="relative w-full flex-1 block overflow-hidden" title="Add a cover photo">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-paper-dark flex flex-col items-center justify-center gap-1">
              <span className="font-script text-3xl text-kraft-dark/50">?</span>
              <span className="font-ui text-[10px] text-kraft-dark/50">tap to add a photo</span>
            </div>
          )}
          <span className="absolute bottom-1 right-1 bg-black/50 text-white font-ui text-[10px] px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
            change
          </span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <div className="pt-3 flex items-end justify-between">
          <div>
            <p className="font-script text-xl text-ink leading-tight line-clamp-1">{entry.title}</p>
            <p className="font-ui text-[10px] text-ink-light mt-0.5">{entry.date}</p>
          </div>
          <button
            onClick={(e) => onDelete(entry.id, e)}
            className="font-ui text-[10px] text-ink-light/0 group-hover:text-ink-light/70 hover:!text-rust transition-colors"
          >
            delete
          </button>
        </div>
      </div>
    </a>
  );
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
