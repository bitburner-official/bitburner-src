import type { BaseServer } from "./Server/BaseServer";
import { Generic_fromJSON, Generic_toJSON, type IReviverValue, constructorsForReviver } from "./utils/JSONReviver";
import type { TextFilePath } from "./Paths/TextFilePath";
import { ContentFile } from "./Paths/ContentFile";
import {
  cacheContentFile,
  deleteContentFile,
  moveCacheOwner,
  recacheContentFile,
  type StorageCacheEntry,
} from "./utils/helpers/storageCache";

/** Represents a plain text file that is typically stored on a server. */
export class TextFile extends ContentFile {
  private storageCacheEntry: StorageCacheEntry | null = null;
  private uncachedText = "";

  /** The full file name. */
  filename: TextFilePath;

  server: string;

  get text(): string {
    return this.storageCacheEntry?.content ?? this.uncachedText;
  }

  set text(text: string) {
    if (this.server === "") {
      this.uncachedText = text;
      return;
    }

    this.storageCacheEntry = this.storageCacheEntry
      ? recacheContentFile(this.server, this.filename, this.storageCacheEntry.content, text)
      : cacheContentFile(this.server, this.filename, text);
    this.uncachedText = "";
  }

  // Shared interface on Script and TextFile for accessing content
  get content() {
    this.metadata.read();
    return this.text;
  }
  set content(text: string) {
    this.metadata.edit();
    this.text = text;
  }

  constructor(filename = "default.txt" as TextFilePath, txt = "", server = "") {
    super();
    this.filename = filename;
    this.server = server;
    this.text = txt;
  }

  setFilename(filename: TextFilePath): void {
    if (this.filename === filename) return;
    if (this.storageCacheEntry) {
      this.storageCacheEntry = moveCacheOwner(this.server, this.filename, this.server, filename, this.text);
    }
    this.filename = filename;
  }

  setServer(server: string): void {
    if (this.server === server) return;
    if (this.storageCacheEntry) {
      this.storageCacheEntry = moveCacheOwner(this.server, this.filename, server, this.filename, this.text);
    }
    this.server = server;
    if (!this.storageCacheEntry && this.uncachedText !== "" && server !== "") {
      this.text = this.uncachedText;
    }
  }

  /** Serialize the current file to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("TextFile", this, TextFile.savedKeysNoText);
  }

  deleteFromServer(server: BaseServer): boolean {
    if ((this.server !== "" && this.server !== server.hostname) || !server.textFiles.has(this.filename)) return false;
    if (this.storageCacheEntry) {
      deleteContentFile(this.server, this.filename, this.text);
      this.storageCacheEntry = null;
    }
    server.textFiles.delete(this.filename);
    return true;
  }

  static savedKeys = ["filename", "server", "text", "metadata"] as const;
  // New saves omit inline text (it lives once in the top-level storageCache) and also omit `server`: loadAllServers
  // unconditionally calls setServer(hostname) on every text file, so the server is re-derived on load.
  // (Script keeps `server` instead, because scripts are only re-assigned a server when their hostname was ill-formed.)
  static savedKeysNoText = ["filename", "metadata"] as const;

  /** Initializes a TextFile from a JSON save state. */
  static fromJSON(value: IReviverValue): TextFile {
    return Generic_fromJSON(TextFile, value.data, TextFile.savedKeys);
  }
}

constructorsForReviver.TextFile = TextFile;
