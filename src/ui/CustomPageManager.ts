/** Registry for script-created sidebar pages. */

export interface CustomPage {
  /** Unique identifier — same as title. */
  id: string;
  title: string;
  content: string;
  /** PID of the script that created this page. */
  pid: number;
}

type Listener = () => void;

class CustomPageRegistry {
  private readonly pages = new Map<string, CustomPage>();
  private readonly listeners = new Set<Listener>();
  // Cached snapshot array — only replaced on mutation so useSyncExternalStore
  // can bail out on unchanged renders.
  private snapshot: readonly CustomPage[] = [];

  /** Open a page or update its content.  Called by ns.ui.openPage(). */
  openPage(pid: number, title: string, content = ""): void {
    const existing = this.pages.get(title);
    if (existing) {
      existing.content = content;
    } else {
      this.pages.set(title, { id: title, title, content, pid });
    }
    this.invalidate();
  }

  /** Close a page.  Called by ns.ui.closePage() and on script exit. */
  closePage(title: string): void {
    if (this.pages.delete(title)) this.invalidate();
  }

  /** Remove all pages owned by the given PID.  Called on script termination. */
  closePagesByPid(pid: number): void {
    let changed = false;
    for (const [id, page] of this.pages) {
      if (page.pid === pid) {
        this.pages.delete(id);
        changed = true;
      }
    }
    if (changed) this.invalidate();
  }

  /** Retrieve a page by its id/title. */
  getPage(id: string): CustomPage | undefined {
    return this.pages.get(id);
  }

  // ── useSyncExternalStore interface ─────────────────────────────────────────

  /** Stable subscribe function for useSyncExternalStore. */
  readonly subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** Stable snapshot getter — same array reference while nothing has changed. */
  readonly getSnapshot = (): readonly CustomPage[] => this.snapshot;

  // ── private ────────────────────────────────────────────────────────────────

  private invalidate(): void {
    this.snapshot = [...this.pages.values()];
    for (const listener of this.listeners) listener();
  }
}

export const CustomPageManager = new CustomPageRegistry();
