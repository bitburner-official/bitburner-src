/**
 * Minimal non-streaming Glk Dialog implementation backed by localStorage.
 * Implements the subset of the GlkOte Dialog contract that vendor/glkapi.js
 * uses, persisting Zork save files per game. See src/Arcade/Zork/README.md.
 */
export interface ZorkFileRef {
  filename: string;
  usage: string;
  gameid?: string;
}

export class ZorkDialog {
  /** glkapi checks this to pick the non-streaming file API. */
  readonly streaming = false;
  private readonly gameKey: string;

  constructor(gameKey: string) {
    this.gameKey = gameKey;
  }

  private key(ref: ZorkFileRef): string {
    return `zork.${this.gameKey}.${ref.usage}.${ref.filename}`;
  }

  file_construct_ref(filename = "", usage = "", gameid = ""): ZorkFileRef {
    return { filename, usage, gameid };
  }

  file_construct_temp_ref(usage = ""): ZorkFileRef {
    return { filename: `_temp_${usage}`, usage, gameid: "" };
  }

  file_clean_fixed_name(filename: string, __usage: string): string {
    return filename.replace(/["/\\<>:|?*]/g, "");
  }

  file_ref_exists(ref: ZorkFileRef): boolean {
    return localStorage.getItem(this.key(ref)) !== null;
  }

  file_remove_ref(ref: ZorkFileRef): void {
    localStorage.removeItem(this.key(ref));
  }

  /** content is an array of byte values (israw) or a string. Returns success. */
  file_write(ref: ZorkFileRef, content: number[] | string, __israw?: boolean): boolean {
    try {
      const payload =
        typeof content === "string" ? { text: content } : { bytes: btoa(String.fromCharCode(...content)) };
      localStorage.setItem(this.key(ref), JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error("ZorkDialog.file_write failed", e);
      return false;
    }
  }

  file_read(ref: ZorkFileRef, __israw?: boolean): number[] | string | null {
    const raw = localStorage.getItem(this.key(ref));
    if (raw === null) return null;
    try {
      const payload = JSON.parse(raw) as { text?: string; bytes?: string };
      if (typeof payload.text === "string") return payload.text;
      if (typeof payload.bytes === "string") {
        return Array.from(atob(payload.bytes), (c) => c.charCodeAt(0));
      }
      return null;
    } catch {
      return null; // corrupt entry: treat as missing
    }
  }

  /** ZVM autosave hooks; unused (we don't enable do_vm_autosave), kept safe. */
  autosave_read(__signature: string): null {
    return null;
  }
  autosave_write(__signature: string, __snapshot: unknown): void {
    // no-op
  }
}
