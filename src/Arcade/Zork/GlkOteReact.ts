/**
 * A GlkOte-protocol display implementation that feeds React state instead of
 * manipulating the DOM (replaces glkote.js, which requires jQuery).
 * vendor/glkapi.js calls the GlkOte contract methods; the terminal UI calls
 * the send* methods. Protocol: https://eblong.com/zarf/glk/glkote/docs.html
 */
import type { ZorkDialog } from "./ZorkDialog";

export interface StyledRun {
  style: string;
  text: string;
}

export interface TerminalState {
  gridLines: StyledRun[][];
  bufferLines: StyledRun[][];
  inputRequest: { id: number; gen: number; type: "line" | "char"; maxlen: number; initial: string } | null;
  filePrompt: { filemode: string; filetype: string } | null;
  disabled: boolean;
  error: string | null;
}

export type TerminalListener = (state: TerminalState) => void;

type RunOrString = string | { style?: string; text?: string };
interface WindowUpdate {
  id: number;
  type: "grid" | "buffer" | "graphics";
  rock: number;
  gridwidth?: number;
  gridheight?: number;
}
interface ContentUpdate {
  id: number;
  clear?: boolean;
  lines?: { line: number; content?: RunOrString[] }[];
  text?: { append?: boolean; flowbreak?: boolean; content?: RunOrString[] }[];
}
interface InputUpdate {
  id: number;
  gen: number;
  type: "line" | "char";
  maxlen?: number;
  initial?: string;
}
export interface GlkOteUpdate {
  type: "update" | "pass" | "retry" | "error";
  gen?: number;
  windows?: WindowUpdate[];
  content?: ContentUpdate[];
  input?: InputUpdate[];
  specialinput?: { type: string; filemode: string; filetype: string };
  disable?: boolean;
  message?: string;
}
interface GlkOteEvent {
  type: string;
  gen: number;
  [key: string]: unknown;
}
interface AcceptInterface {
  accept: (event: GlkOteEvent) => void;
}

// Fixed 80x25 terminal metrics; glkapi derives grid rows/cols from these.
const METRICS = {
  width: 720,
  height: 450,
  outspacingx: 0,
  outspacingy: 0,
  inspacingx: 0,
  inspacingy: 0,
  gridcharwidth: 9,
  gridcharheight: 18,
  gridmarginx: 0,
  gridmarginy: 0,
  buffercharwidth: 9,
  buffercharheight: 18,
  buffermarginx: 0,
  buffermarginy: 0,
};

// Cap scrollback so multi-hour sessions don't grow unbounded.
const MAX_BUFFER_LINES = 2000;

function parseRuns(content: RunOrString[] | undefined): StyledRun[] {
  const runs: StyledRun[] = [];
  if (!content) return runs;
  let i = 0;
  while (i < content.length) {
    const item = content[i];
    if (typeof item === "string") {
      // Alternating "style", "text" string pairs.
      const text = content[i + 1];
      runs.push({ style: item, text: typeof text === "string" ? text : "" });
      i += 2;
    } else {
      runs.push({ style: item.style ?? "normal", text: item.text ?? "" });
      i += 1;
    }
  }
  return runs;
}

export class GlkOteReact {
  private readonly dialog: ZorkDialog;
  private listener: TerminalListener | null;
  private iface: AcceptInterface | null = null;
  private generation = 0;
  private windows = new Map<number, WindowUpdate>();
  private state: TerminalState = {
    gridLines: [],
    bufferLines: [],
    inputRequest: null,
    filePrompt: null,
    disabled: false,
    error: null,
  };

  constructor(dialog: ZorkDialog, listener: TerminalListener) {
    this.dialog = dialog;
    this.listener = listener;
  }

  /* ---- GlkOte contract, called by vendor/glkapi.js ---- */

  init(iface: AcceptInterface): void {
    this.iface = iface;
    iface.accept({ type: "init", gen: 0, metrics: METRICS, support: [] });
  }

  update(arg: GlkOteUpdate): void {
    if (arg.type === "error") {
      this.state.error = arg.message ?? "Unknown interpreter error";
      this.emit();
      return;
    }
    if (arg.type !== "update") return;
    if (typeof arg.gen === "number") this.generation = arg.gen;

    if (arg.windows) {
      this.windows.clear();
      for (const win of arg.windows) this.windows.set(win.id, win);
    }
    if (arg.content) {
      for (const update of arg.content) this.applyContent(update);
    }
    // Input requests fully replace the previous set each update.
    this.state.inputRequest = null;
    if (arg.input) {
      for (const req of arg.input) {
        const win = this.windows.get(req.id);
        // Zork only reads from the buffer window; prefer it if several ask.
        if (!this.state.inputRequest || win?.type === "buffer") {
          this.state.inputRequest = {
            id: req.id,
            gen: req.gen,
            type: req.type,
            maxlen: req.maxlen ?? 200,
            initial: req.initial ?? "",
          };
        }
      }
    }
    this.state.filePrompt =
      arg.specialinput?.type === "fileref_prompt"
        ? { filemode: arg.specialinput.filemode, filetype: arg.specialinput.filetype }
        : null;
    this.state.disabled = !!arg.disable || (!this.state.inputRequest && !this.state.filePrompt);
    this.emit();
  }

  log(__msg: string): void {
    // Interpreter debug output: intentionally dropped.
  }
  warning(msg: string): void {
    console.warn("Zork glkapi warning:", msg);
  }
  error(msg: string): void {
    this.state.error = String(msg);
    this.emit();
  }
  getlibrary(name: string): unknown {
    return name === "Dialog" ? this.dialog : null;
  }
  getinterface(): AcceptInterface | null {
    return this.iface;
  }
  save_allstate(): undefined {
    return undefined; // autosave not enabled
  }

  /* ---- Outgoing events, called by the terminal UI / session ---- */

  sendLine(text: string): void {
    const req = this.state.inputRequest;
    if (!this.iface || !req || req.type !== "line") return;
    this.iface.accept({ type: "line", gen: this.generation, window: req.id, value: text });
  }

  sendChar(key: string): void {
    const req = this.state.inputRequest;
    if (!this.iface || !req || req.type !== "char") return;
    this.iface.accept({ type: "char", gen: this.generation, window: req.id, value: key });
  }

  sendFileref(value: { filename: string; usage: string } | null): void {
    if (!this.iface) return;
    this.iface.accept({ type: "specialresponse", gen: this.generation, response: "fileref_prompt", value });
  }

  detach(): void {
    this.listener = null;
    this.iface = null;
  }

  /* ---- Internals ---- */

  private applyContent(update: ContentUpdate): void {
    const win = this.windows.get(update.id);
    if (!win) return;
    if (win.type === "grid") {
      const height = win.gridheight ?? 1;
      while (this.state.gridLines.length < height) this.state.gridLines.push([]);
      this.state.gridLines.length = height;
      for (const line of update.lines ?? []) {
        if (line.line >= 0 && line.line < height) this.state.gridLines[line.line] = parseRuns(line.content);
      }
    } else if (win.type === "buffer") {
      if (update.clear) this.state.bufferLines = [];
      for (const para of update.text ?? []) {
        const runs = parseRuns(para.content);
        if (para.append && this.state.bufferLines.length > 0) {
          this.state.bufferLines[this.state.bufferLines.length - 1].push(...runs);
        } else {
          this.state.bufferLines.push(runs);
        }
      }
      if (this.state.bufferLines.length > MAX_BUFFER_LINES) {
        this.state.bufferLines = this.state.bufferLines.slice(-MAX_BUFFER_LINES);
      }
    }
  }

  private emit(): void {
    if (!this.listener) return;
    this.listener({
      ...this.state,
      gridLines: this.state.gridLines.map((l) => [...l]),
      bufferLines: this.state.bufferLines.map((l) => [...l]),
    });
  }
}
