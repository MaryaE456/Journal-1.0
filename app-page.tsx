"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Entry } from "@/lib/types";
import { getAllEntries, putEntry, deleteEntry, getImageUrl } from "@/lib/db";
import { newId } from "@/lib/id";

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
      <header className="mb-12 flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="font-hand text-ink-light text-lg mb-1">welcome back to your</p>
          <h1 className="font-script text-6xl md:text-7xl text-ink-deep text-[#3E2C23] leading-none">
            Scrapbook Journal
          </h1>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="bg-rust text-paper font-hand text-xl px-6 py-3 rounded-sm shadow-lift hover:-translate-y-0.5 hover:shadow-page transition-transform -rotate-1"
        >
          + New entry
        </button>
      </header>

      {loading ? (
        <p className="font-hand text-ink-light text-lg">unpacking your shelf…</p>
      ) : entries.length === 0 ? (
        <div className="border-2 border-dashed border-kraft-dark/40 rounded-md p-16 text-center max-w-xl">
          <p className="font-hand text-2xl text-ink mb-2">Your shelf is empty.</p>
          <p className="font-ui text-sm text-ink-light">
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

  useEffect(() => {
    if (entry.coverImageId) {
      getImageUrl(entry.coverImageId).then(setCover);
    }
  }, [entry.coverImageId]);

  return (
    <a
      href={`/entry/${entry.id}`}
      className="group block bg-kraft-texture rounded-sm shadow-page hover:shadow-lift hover:-translate-y-1 transition-all p-3 aspect-[3/4] relative"
    >
      <div className="absolute inset-2 bg-paper rounded-[2px] overflow-hidden flex flex-col">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="w-full h-2/3 object-cover" />
        ) : (
          <div className="w-full h-2/3 bg-paper-dark flex items-center justify-center">
            <span className="font-script text-3xl text-kraft-dark/50">?</span>
          </div>
        )}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <p className="font-script text-2xl text-ink leading-tight line-clamp-2">{entry.title}</p>
            <p className="font-ui text-[11px] text-ink-light mt-1">{entry.date}</p>
          </div>
          <button
            onClick={(e) => onDelete(entry.id, e)}
            className="self-end font-ui text-[11px] text-ink-light/0 group-hover:text-ink-light/70 hover:!text-rust transition-colors"
          >
            delete
          </button>
        </div>
      </div>
    </a>
  );
}
