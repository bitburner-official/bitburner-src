import type { ContentFilePath } from "../../Paths/ContentFile";
import { assertArray, assertObject } from "../TypeAssertion";

export type StorageCacheOwner = {
  server: string;
  filename: ContentFilePath;
};

export type StorageCacheEntry = {
  readonly content: string;
};

export type SavedStorageCacheEntry = {
  content: string;
  owners: StorageCacheOwner[];
};

// A lazily-computed transform (swc output) of a content string, shared by all of that content's owners.
export type CachedTransform = { scriptCode: string; sourceMap: string | undefined };

/**
 * A shared-content entry. Tracks which files (by owner key) reference `content`.
 * Most content has exactly one owner, so owners is stored as a bare key string and only promoted to a Set when a
 * second distinct owner appears — avoiding a Set allocation for the common single-owner case. "" means "no owners
 * yet" (a real key is never empty: it is `${filename}\n${server}` and filename is non-empty). The entry is discarded
 * on reaching zero owners, and a Set is never demoted back to a string (avoids alloc churn on repeated share/unshare).
 */
class CacheEntry implements StorageCacheEntry {
  private owners: string | Set<string> = "";
  // Set on first compile of this content; reused by every other owner. Lives and dies with the entry, so it is
  // evicted automatically when the last owner is removed and never goes stale (content is immutable per entry).
  transform: CachedTransform | undefined = undefined;

  constructor(readonly content: string) {}

  hasOwner(ownerKey: string): boolean {
    return typeof this.owners === "string" ? this.owners === ownerKey : this.owners.has(ownerKey);
  }

  addOwner(ownerKey: string): void {
    if (typeof this.owners !== "string") this.owners.add(ownerKey);
    else if (this.owners === "") this.owners = ownerKey; // first owner
    else if (this.owners !== ownerKey) this.owners = new Set([this.owners, ownerKey]); // promote on second
  }

  /** Swap one owner key for another without changing owner count (rename / server move). */
  replaceOwner(oldOwnerKey: string, newOwnerKey: string): void {
    if (typeof this.owners === "string") {
      this.owners = newOwnerKey; // single owner stays a string across renames
    } else {
      this.owners.delete(oldOwnerKey);
      this.owners.add(newOwnerKey);
    }
  }

  /** Removes an owner (which must exist). Returns true if the entry is now empty and should be discarded. */
  deleteOwner(ownerKey: string): boolean {
    if (typeof this.owners !== "string") {
      if (!this.owners.delete(ownerKey)) throw new Error(`Storage cache owner does not exist: ${ownerKey}`);
      return this.owners.size === 0;
    }
    if (this.owners !== ownerKey) throw new Error(`Storage cache owner does not exist: ${ownerKey}`);
    return true; // removed the only owner
  }

  *ownerKeys(): IterableIterator<string> {
    if (typeof this.owners === "string") {
      if (this.owners !== "") yield this.owners;
    } else {
      yield* this.owners;
    }
  }
}

const storageCache = new Map<string, CacheEntry>();

function getCacheEntry(content: string): CacheEntry {
  let entry = storageCache.get(content);
  if (!entry) {
    entry = new CacheEntry(content);
    storageCache.set(content, entry);
  }
  return entry;
}

/**
 * Build the per-owner key. Filenames cannot contain whitespace (see path validation in Directory.ts), so placing the
 * filename first with a newline separator yields a collision-free key for any server name — and is far cheaper to
 * build than JSON.stringify (no array allocation, no escaping scan). The key is internal only; it is never persisted.
 */
function ownerKeyFor(server: string, filename: ContentFilePath): string {
  return `${filename}\n${server}`;
}

function removeCacheOwner(
  server: string,
  filename: ContentFilePath,
  content: string,
  ownerKey = ownerKeyFor(server, filename),
): void {
  const entry = storageCache.get(content);
  if (!entry) throw new Error(`Storage cache content does not exist: ${ownerKey}`);

  if (entry.deleteOwner(ownerKey)) storageCache.delete(content); // one call: removes + reports if now empty
}

export function cacheContentFile(server: string, filename: ContentFilePath, content: string): StorageCacheEntry {
  const ownerKey = ownerKeyFor(server, filename);
  const entry = getCacheEntry(content);

  if (entry.hasOwner(ownerKey)) {
    throw new Error(`Storage cache owner already exists: ${ownerKey}`);
  }

  entry.addOwner(ownerKey);
  return entry;
}

export function deleteContentFile(server: string, filename: ContentFilePath, content: string): void {
  removeCacheOwner(server, filename, content);
}

/** Re-point a file's owner to a new content entry when its content changes in place. */
export function recacheContentFile(
  server: string,
  filename: ContentFilePath,
  oldContent: string,
  newContent: string,
): StorageCacheEntry {
  if (oldContent === newContent) return getCacheEntry(newContent); // no-op: still owns the same entry
  const ownerKey = ownerKeyFor(server, filename);
  const newEntry = getCacheEntry(newContent);
  newEntry.addOwner(ownerKey);
  removeCacheOwner(server, filename, oldContent, ownerKey);
  return newEntry;
}

/** Move a file's owner to a new server/filename within the same content entry (rename or server change). */
export function moveCacheOwner(
  oldServer: string,
  oldFilename: ContentFilePath,
  newServer: string,
  newFilename: ContentFilePath,
  content: string,
): StorageCacheEntry {
  const entry = storageCache.get(content);
  const oldOwnerKey = ownerKeyFor(oldServer, oldFilename);
  if (!entry?.hasOwner(oldOwnerKey)) throw new Error(`Storage cache owner does not match content: ${oldOwnerKey}`);

  const newOwnerKey = ownerKeyFor(newServer, newFilename);
  if (oldOwnerKey === newOwnerKey) return entry;
  if (entry.hasOwner(newOwnerKey)) throw new Error(`Storage cache owner already exists: ${newOwnerKey}`);

  entry.replaceOwner(oldOwnerKey, newOwnerKey); // single-owner files stay a string across rename/move
  return entry;
}

export function clearStorageCache(): void {
  storageCache.clear();
}

/** The shared transform for this content, or undefined if it hasn't been computed (or the content has no entry). */
export function getCachedTransform(content: string): CachedTransform | undefined {
  return storageCache.get(content)?.transform;
}

/** Stores the transform on the content's entry. No-op if the content isn't cached (e.g. an unattached file). */
export function cacheTransform(content: string, transform: CachedTransform): void {
  const entry = storageCache.get(content);
  if (entry) entry.transform = transform;
}

export function getStorageCacheSaveData(): SavedStorageCacheEntry[] {
  const result: SavedStorageCacheEntry[] = [];
  for (const entry of storageCache.values()) {
    const owners: StorageCacheOwner[] = [];
    for (const ownerKey of entry.ownerKeys()) {
      // Keys are `${filename}\n${server}`; the filename never contains a newline, so split on the first one.
      const delimiter = ownerKey.indexOf("\n");
      const filename = ownerKey.slice(0, delimiter) as ContentFilePath;
      const server = ownerKey.slice(delimiter + 1);
      owners.push({ server, filename });
    }
    result.push({ content: entry.content, owners });
  }
  return result;
}

export function assertSavedStorageCacheEntry(
  value: unknown,
): asserts value is { content: string; owners: readonly unknown[] } {
  assertObject(value);
  if (typeof value.content !== "string") throw new Error("Invalid storage cache content.");
  assertArray(value.owners);
}

export function assertStorageCacheOwner(value: unknown): asserts value is StorageCacheOwner {
  assertObject(value);
  if (typeof value.server !== "string") throw new Error("Invalid storage cache owner server.");
  if (typeof value.filename !== "string") throw new Error("Invalid storage cache owner filename.");
}
