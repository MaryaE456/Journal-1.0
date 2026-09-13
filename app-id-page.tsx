"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Entry, Spread } from "@/lib/types";
import { getEntry, getSpreadsForEntry, putSpread, deleteSpread, putEntry } from "@/lib/db";
import { newId } from "@/lib/id";
import PagePreview from "@/components/PagePreview";

function blankPage(): Spread["left"] {
  return { id: newId(), background: "cream", elements: [] };
}

export default function EntryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [spreads, setSpreads] = useState<Spread[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  async function refresh() {
    const e = await getEntry(params.id);
    const sp = await getSpreadsForEntry(params.id);
    setEntry(e ?? null);
    setSpreads(sp);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function addSpread() {
    const now = Date.now();
    const spread: Spread = {
      id: newId(),
      entryId: params.id,
      order: spreads.length,
      left: blankPage(),
      right: blankPage(),
      createdAt: now,
      updatedAt: now,
    };
    await putSpread(spread);
    router.push(`/entry/${params.id}/spread/${spread.id}`);
  }

  async function removeSpread(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this page spread?")) return;
    await deleteSpread(id);
    refresh();
  }

  async function saveTitle() {
    if (!entry || !titleDraft.trim()) {
      setEditingTitle(false);
      return;
    }
    const updated = { ...entry, title: titleDraft.trim(), updatedAt: Date.now() };
    await putEntry(updated);
    setEntry(updated);
    setEditingTitle(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-12 md:px-16">
        <p className="font-hand text-ink-light text-lg">opening the journal…</p>
      </main>
    );
  }

  if (!entry) {
    return (
      <main className="min-h-screen px-6 py-12 md:px-16">
        <p className="font-hand text-xl text-ink">Couldn&apos;t find that entry.</p>
        <Link href="/" className="font-ui text-sm text-rust underline">
          Back to shelf
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12 md:px-16">
      <Link href="/" className="font-ui text-sm text-ink-light hover:text-ink mb-6 inline-block">
        ← back to shelf
      </Link>

      <header className="mb-10 flex items-end justify-between flex-wrap gap-4">
        <div>
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => e.key === "Enter" && saveTitle()}
              className="font-script text-5xl bg-transparent border-b-2 border-rust outline-none text-[#3E2C23]"
            />
          ) : (
            <h1
              className="font-script text-6xl text-[#3E2C23] cursor-text"
              onClick={() => {
                setTitleDraft(entry.title);
                setEditingTitle(true);
              }}
            >
              {entry.title}
            </h1>
          )}
          <p className="font-ui text-sm text-ink-light mt-1">{entry.date}</p>
        </div>
        <button
          onClick={addSpread}
          className="bg-rust text-paper font-hand text-xl px-6 py-3 rounded-sm shadow-lift hover:-translate-y-0.5 transition-transform rotate-1"
        >
          + Add page spread
        </button>
      </header>

      {spreads.length === 0 ? (
        <div className="border-2 border-dashed border-kraft-dark/40 rounded-md p-16 text-center max-w-xl">
          <p className="font-hand text-2xl text-ink mb-2">No pages yet.</p>
          <p className="font-ui text-sm text-ink-light">
            Add your first spread — you can design it freely or let a template lay it out for you.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {spreads.map((spread, i) => (
            <Link
              key={spread.id}
              href={`/entry/${entry.id}/spread/${spread.id}`}
              className="group flex bg-[#5E4028] rounded-sm shadow-spread overflow-hidden aspect-[16/9] max-w-3xl hover:-translate-y-1 transition-transform relative"
            >
              <div className="flex-1 relative border-r border-black/20">
                <PagePreview page={spread.left} />
              </div>
              <div className="flex-1 relative">
                <PagePreview page={spread.right} />
              </div>
              <span className="absolute top-2 left-2 font-ui text-[10px] bg-black/40 text-white px-2 py-0.5 rounded-sm">
                spread {i + 1}
              </span>
              <button
                onClick={(e) => removeSpread(spread.id, e)}
                className="absolute top-2 right-2 font-ui text-[10px] bg-black/40 text-white/0 group-hover:text-white/90 hover:!bg-rust px-2 py-0.5 rounded-sm transition-colors"
              >
                delete
              </button>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
