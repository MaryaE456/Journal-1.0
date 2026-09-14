"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Entry } from "@/lib/types";
import { getAllEntries, putEntry, deleteEntry, getImageUrl } from "@/lib/db";
import { newId } from "@/lib/id";
import { BUILT_IN_STICKERS } from "@/lib/stickers";

const CARD_STICKERS = ["heart", "star", "bow", "cherries", "sparkle", "vinyl"];

// small cream/beige decorations scattered around the homepage headline —
// distinct from the wine-toned sticker drawer used inside the editor
function CreamStar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <path
        d="M50 8L61 38L93 40L67 60L77 92L50 73L23 92L33 60L7 40L39 38Z"
        stroke="#F3ECDD"
        strokeWidth="4"
        strokeLinejoin="round"
        fill="#E8DEC8"
      />
    </svg>
  );
}

function CreamBow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 70" className={className} fill="none">
      <path d="M48 35C48 35 10 10 6 35C2 60 48 35 48 35Z" stroke="#F3ECDD" strokeWidth="4" fill="#E8DEC8" />
      <path d="M52 35C52 35 90 10 94 35C98 60 52 35 52 35Z" stroke="#F3ECDD" strokeWidth="4" fill="#E8DEC8" />
      <circle cx="50" cy="35" r="9" stroke="#F3ECDD" strokeWidth="4" fill="#F3ECDD" />
    </svg>
  );
}

function CreamDots({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 60" className={className} fill="none">
      <circle cx="10" cy="10" r="6" fill="#F3ECDD" />
      <circle cx="34" cy="24" r="9" fill="#EFE3D0" />
      <circle cx="60" cy="8" r="5" fill="#F3ECDD" />
      <circle cx="82" cy="30" r="7" fill="#EFE3D0" />
      <circle cx="14" cy="46" r="7" fill="#EFE3D0" />
      <circle cx="52" cy="48" r="5" fill="#F3ECDD" />
    </svg>
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

  return (
    <main className="min-h-screen px-6 py-12 md:px-16">
      <header className="mb-16 flex items-start justify-between flex-wrap gap-4 relative pt-6">
        <div className="relative py-6 px-2">
          {/* scattered cream decorations */}
          <CreamBow className="absolute -top-8 left-8 w-14 h-10 -rotate-12 opacity-95" />
          <CreamStar className="absolute -top-6 right-0 w-9 h-9 rotate-12 opacity-90" />
          <CreamStar className="absolute top-1/2 -left-10 w-6 h-6 -rotate-6 opacity-80" />
          <CreamDots className="absolute -bottom-8 left-10 w-24 h-14 opacity-90" />
          <CreamBow className="absolute bottom-0 right-10 w-10 h-8 rotate-45 opacity-80" />

          <h1 className="font-script text-5xl md:text-6xl leading-tight relative z-10" style={{ color: "#F8F1E4" }}>
            Welcome to your own
            <br />
            digital scrapbook
          </h1>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="font-type text-sm tracking-wide uppercase bg-rust text-paper px-6 py-3 rounded-sm shadow-lift hover:-translate-y-0.5 hover:shadow-page transition-transform -rotate-1"
        >
          + New entry
        </button>
      </header>

      {loading ? (
        <p className="font-hand text-lg" style={{ color: "#F8F1E4" }}>
          unpacking your shelf…
        </p>
      ) : entries.length === 0 ? (
        <div className="border-2 border-dashed border-paper/50 rounded-md p-16 text-center max-w-xl">
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
            <EntryCard key={entry.id} entry={entry} onDelete={removeEntry} />
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
    </main>
  );
}

function EntryCard({
  entry,
  onDelete,
}: {
  entry: Entry;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  const [cover, setCover] = useState<string | undefined>();
  const stickerId = CARD_STICKERS[Math.abs(hashCode(entry.id)) % CARD_STICKERS.length];
  const sticker = BUILT_IN_STICKERS.find((s) => s.id === stickerId);
  const tilt = (Math.abs(hashCode(entry.id)) % 7) - 3; // -3..3 deg

  useEffect(() => {
    if (entry.coverImageId) {
      getImageUrl(entry.coverImageId).then(setCover);
    }
  }, [entry.coverImageId]);

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
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="w-full flex-1 object-cover" />
        ) : (
          <div className="w-full flex-1 bg-paper-dark flex items-center justify-center">
            <span className="font-script text-3xl text-kraft-dark/50">?</span>
          </div>
        )}
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
