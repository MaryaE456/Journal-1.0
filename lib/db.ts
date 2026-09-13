import { Entry, Spread } from "./types";

const DB_NAME = "scrapbook-journal";
const DB_VERSION = 1;

const STORE_ENTRIES = "entries";
const STORE_SPREADS = "spreads";
const STORE_IMAGES = "images";
const STORE_STICKERS = "customStickers";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available (are you server-side rendering?)"));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_ENTRIES)) {
        db.createObjectStore(STORE_ENTRIES, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_SPREADS)) {
        const spreadStore = db.createObjectStore(STORE_SPREADS, { keyPath: "id" });
        spreadStore.createIndex("entryId", "entryId", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        db.createObjectStore(STORE_IMAGES, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_STICKERS)) {
        db.createObjectStore(STORE_STICKERS, { keyPath: "id" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  return dbPromise;
}

function tx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = fn(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
  );
}

function txAll<T>(storeName: string, mode: IDBTransactionMode, fn: (store: IDBObjectStore) => void, collect: () => Promise<T>): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        fn(store);
        transaction.oncomplete = () => resolve(undefined as unknown as T);
        transaction.onerror = () => reject(transaction.error);
      })
  ).then(() => collect());
}

// ---------- Entries ----------

export async function getAllEntries(): Promise<Entry[]> {
  const entries = await tx<Entry[]>(STORE_ENTRIES, "readonly", (s) => s.getAll());
  return entries.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getEntry(id: string): Promise<Entry | undefined> {
  return tx<Entry | undefined>(STORE_ENTRIES, "readonly", (s) => s.get(id));
}

export async function putEntry(entry: Entry): Promise<void> {
  await tx(STORE_ENTRIES, "readwrite", (s) => s.put(entry));
}

export async function deleteEntry(id: string): Promise<void> {
  const spreads = await getSpreadsForEntry(id);
  const db = await openDB();
  await Promise.all(
    spreads.map(
      (sp) =>
        new Promise<void>((resolve, reject) => {
          const t = db.transaction(STORE_SPREADS, "readwrite");
          const req = t.objectStore(STORE_SPREADS).delete(sp.id);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        })
    )
  );
  await tx(STORE_ENTRIES, "readwrite", (s) => s.delete(id));
}

// ---------- Spreads ----------

export async function getSpreadsForEntry(entryId: string): Promise<Spread[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE_SPREADS, "readonly");
    const idx = t.objectStore(STORE_SPREADS).index("entryId");
    const req = idx.getAll(entryId);
    req.onsuccess = () => resolve((req.result as Spread[]).sort((a, b) => a.order - b.order));
    req.onerror = () => reject(req.error);
  });
}

export async function getSpread(id: string): Promise<Spread | undefined> {
  return tx<Spread | undefined>(STORE_SPREADS, "readonly", (s) => s.get(id));
}

export async function putSpread(spread: Spread): Promise<void> {
  await tx(STORE_SPREADS, "readwrite", (s) => s.put(spread));
}

export async function deleteSpread(id: string): Promise<void> {
  await tx(STORE_SPREADS, "readwrite", (s) => s.delete(id));
}

// ---------- Images (photos the user uploads) ----------

export async function putImage(id: string, blob: Blob): Promise<void> {
  await tx(STORE_IMAGES, "readwrite", (s) => s.put({ id, blob }));
}

export async function getImageBlob(id: string): Promise<Blob | undefined> {
  const record = await tx<{ id: string; blob: Blob } | undefined>(STORE_IMAGES, "readonly", (s) => s.get(id));
  return record?.blob;
}

export async function deleteImage(id: string): Promise<void> {
  await tx(STORE_IMAGES, "readwrite", (s) => s.delete(id));
}

// ---------- Custom stickers the user uploads ----------

export async function putCustomSticker(id: string, blob: Blob): Promise<void> {
  await tx(STORE_STICKERS, "readwrite", (s) => s.put({ id, blob }));
}

export async function getAllCustomStickerIds(): Promise<string[]> {
  const all = await tx<{ id: string }[]>(STORE_STICKERS, "readonly", (s) => s.getAll());
  return all.map((r) => r.id);
}

export async function getCustomStickerBlob(id: string): Promise<Blob | undefined> {
  const record = await tx<{ id: string; blob: Blob } | undefined>(STORE_STICKERS, "readonly", (s) => s.get(id));
  return record?.blob;
}

// ---------- Object URL cache ----------
// Keeps one blob: URL per image id alive for the session so <img> tags don't
// need to re-read IndexedDB on every render.

const urlCache = new Map<string, string>();

export async function getImageUrl(id: string): Promise<string | undefined> {
  if (urlCache.has(id)) return urlCache.get(id);
  const blob = await getImageBlob(id);
  if (!blob) return undefined;
  const url = URL.createObjectURL(blob);
  urlCache.set(id, url);
  return url;
}

export async function getCustomStickerUrl(id: string): Promise<string | undefined> {
  const cacheKey = "sticker:" + id;
  if (urlCache.has(cacheKey)) return urlCache.get(cacheKey);
  const blob = await getCustomStickerBlob(id);
  if (!blob) return undefined;
  const url = URL.createObjectURL(blob);
  urlCache.set(cacheKey, url);
  return url;
}
