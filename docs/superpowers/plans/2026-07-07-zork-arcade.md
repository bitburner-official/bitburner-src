# Zork 1–3 Arcade Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zork I, II, and III playable from the New Tokyo Arcade menu via the Parchment project's pure-JS ZVM interpreter, in a Bitburner-themed React terminal.

**Architecture:** Vendored `zvm.js` (ifvms 1.1.6) makes `glk_*` calls into vendored `glkapi.js` (GlkOte 2.3.7); we implement the GlkOte display interface (`GlkOteReact`) as a state parser that feeds a React terminal component, and a minimal Dialog (`ZorkDialog`) that persists saves to localStorage. `ArcadeRoot.tsx` gets three new menu entries. Spec: `docs/superpowers/specs/2026-07-07-zork-arcade-design.md`.

**Tech Stack:** React 17, TypeScript 5.9, MUI 5, webpack 5, jest 29 (jsdom). No new npm dependencies.

## Global Constraints

- No new entries in `package.json` dependencies or devDependencies.
- Vendored files (`src/Arcade/Zork/vendor/zvm.js`, `src/Arcade/Zork/vendor/glkapi.js`) are kept **verbatim** — never lint, format, or hand-edit them.
- All MIT-licensed material lives under `src/Arcade/Zork/`; `LICENSE.md` there scopes MIT to that folder only.
- All UI colors come from `Settings.theme` (import: `import { Settings } from "../../Settings/Settings";`) — no hardcoded colors except black text on the inverse status bar.
- No gating, no rewards: cabinets always playable.
- Existing commands must stay green: `npm run lint:report`, `npm run format:report`, `npm run test`.
- Commit after every task (no `--no-verify`).

## Reference: verified third-party APIs

Facts verified by reading the packages (do not re-derive):

- **ZVM** (`ifvms@1.1.6`, `dist/zvm.js`, CommonJS export of a constructor):
  `const vm = new ZVM(); vm.prepare(storyBytes, options); Glk.init(options)` where
  `options = { vm, Glk, GlkOte, Dialog }`. `Glk.init` sets `options.accept` and calls
  `GlkOte.init(options)`; the display then sends `{type:"init", gen:0, metrics}` through
  `accept`, which starts the VM. Everything runs synchronously until the VM blocks on
  `glk_select`, at which point `GlkOte.update(state)` is called.
- **glkapi.js** (GlkOte 2.3.7): exports `{ Glk, GlkClass }` (CommonJS, `new GlkClass()`
  per session). Calls on the display object: `init(iface)`, `update(state)`, `log(msg)`,
  `warning(msg)`, `error(msg)`, `getlibrary(name)` (asked for `"Dialog"` and `"Blorb"`),
  `save_allstate()`. Calls on Dialog (non-streaming, `Dialog.streaming === false`):
  `file_construct_ref(filename, usage, gameid)`, `file_construct_temp_ref(usage)`,
  `file_ref_exists(ref)`, `file_remove_ref(ref)`, `file_write(ref, content, israw)`,
  `file_read(ref, israw)`, `file_clean_fixed_name(filename, usage)`. Save/restore
  prompts arrive at the display as `update.specialinput =
{type:"fileref_prompt", filemode, filetype, gameid}`; the display answers
  `accept({type:"specialresponse", gen, response:"fileref_prompt", value})` where
  `value` is `{filename, usage}` or `null` for cancel.
- **GlkOte update payload:** `{type:"update", gen, windows?, content?, input?, specialinput?, disable?}`.
  `windows`: `[{id, type:"grid"|"buffer", rock, gridwidth?, gridheight?}]`.
  Grid content: `{id, lines:[{line, content}]}`. Buffer content:
  `{id, clear?, text:[{append?, flowbreak?, content?}]}`. A `content` array holds either
  `{style, text}` objects or alternating `"style", "text"` strings. `input`:
  `[{id, gen, type:"line"|"char", maxlen?, initial?}]`.
- Zork 1–3 are Z-machine v3; ZVM itself draws the status line into a grid window.

---

### Task 1: Vendor drop, game files, licensing, toolchain config

**Files:**

- Create: `src/Arcade/Zork/vendor/zvm.js` (verbatim from ifvms 1.1.6)
- Create: `src/Arcade/Zork/vendor/glkapi.js` (verbatim from GlkOte 2.3.7)
- Create: `src/Arcade/Zork/vendor/vendor.d.ts`
- Create: `src/Arcade/Zork/games/zork1.z3`, `zork2.z3`, `zork3.z3` (from `C:\git\Zork`)
- Create: `src/Arcade/Zork/LICENSE.md`, `src/Arcade/Zork/README.md`
- Modify: `webpack.config.js` (asset rule, line ~148)
- Modify: `src/@types/global.d.ts` (add `*.z3` module)
- Modify: `jest.config.js` (moduleNameMapper for `.z3`)
- Modify: `.prettierignore` and ESLint ignore config (create/extend)

**Interfaces:**

- Produces: `require("src/Arcade/Zork/vendor/zvm.js")` → ZVM constructor;
  `require("src/Arcade/Zork/vendor/glkapi.js")` → `{ Glk, GlkClass }`;
  importable `*.z3` asset URLs.

- [ ] **Step 1: Fetch vendor sources and copy game files**

```bash
mkdir -p /tmp/zorkvendor && cd /tmp/zorkvendor
curl -sL https://registry.npmjs.org/ifvms/-/ifvms-1.1.6.tgz -o ifvms.tgz && tar -xzf ifvms.tgz
git clone --depth 1 https://github.com/erkyrath/glkote glkote
mkdir -p /c/git/bitburner-zork/src/Arcade/Zork/vendor /c/git/bitburner-zork/src/Arcade/Zork/games
cp package/dist/zvm.js /c/git/bitburner-zork/src/Arcade/Zork/vendor/zvm.js
cp glkote/glkapi.js /c/git/bitburner-zork/src/Arcade/Zork/vendor/glkapi.js
cp /c/git/Zork/zork1.z3 /c/git/Zork/zork2.z3 /c/git/Zork/zork3.z3 /c/git/bitburner-zork/src/Arcade/Zork/games/
```

Verify: `head -10` of both vendor files shows their original MIT headers; `ls -l src/Arcade/Zork/games` shows three files ~87–93KB.

- [ ] **Step 2: Fetch the exact Zork MIT license text**

```bash
curl -sL https://raw.githubusercontent.com/historicalsource/zork1/master/LICENSE -o /tmp/zorkvendor/zork-license.txt
head -5 /tmp/zorkvendor/zork-license.txt
```

Expected: MIT license text with a Microsoft (or Infocom successor) copyright line. **Use this exact text in LICENSE.md below — do not paraphrase or invent the copyright line.** If the fetch fails, STOP and ask the user for the license text that shipped with their Zork copies.

- [ ] **Step 3: Write `src/Arcade/Zork/LICENSE.md`**

Structure (fill the license bodies with the exact texts gathered in steps 1–2; ifvms license is in `/tmp/zorkvendor/package/LICENSE`, GlkOte's in `/tmp/zorkvendor/glkote/LICENSE`):

```markdown
# Licenses for src/Arcade/Zork/

Everything in this folder (and only this folder) is MIT-licensed third-party
material plus Bitburner glue code. The rest of Bitburner is licensed separately —
see `license.txt` in the repository root.

## ZVM interpreter — `vendor/zvm.js`

From ifvms.js 1.1.6 (https://github.com/curiousdannii/ifvms.js), part of the
Parchment project.

[exact MIT text, Copyright (c) 2011-2017 Dannii Willis and other contributors]

## Glk API layer — `vendor/glkapi.js`

From GlkOte 2.3.7 (https://github.com/erkyrath/glkote).

[exact MIT text, Copyright (c) 2008-2025, Andrew Plotkin]

## Zork I, II, III — `games/*.z3`

Compiled Z-machine story files, open-sourced under MIT
(https://github.com/historicalsource/zork1 et al.).

[exact MIT text from step 2]
```

- [ ] **Step 4: Write `src/Arcade/Zork/README.md`**

```markdown
# Zork in the Arcade

Zork I–III cabinets for the New Tokyo Arcade, powered by the Parchment
project's pure-JS Z-machine (ZVM).

- `vendor/zvm.js` — ifvms.js 1.1.6 `dist/zvm.js`, verbatim. Do not edit/format.
- `vendor/glkapi.js` — GlkOte 2.3.7 `glkapi.js`, verbatim. Do not edit/format.
- `games/*.z3` — compiled Zork story files (MIT, Microsoft open-source release).
- Everything else — Bitburner glue: React terminal, GlkOte display adapter,
  localStorage save Dialog.

Licensing: see LICENSE.md (scoped to this folder only).
To update vendor files, re-fetch from upstream and update versions here.
Design spec: docs/superpowers/specs/2026-07-07-zork-arcade-design.md
```

- [ ] **Step 5: Toolchain config**

`webpack.config.js` — extend the existing asset rule:

```js
{ test: /\.(ttf|woff2|png|jpe?g|gif|jp2|webp|svg|z3)$/, type: "asset/resource" },
```

`src/@types/global.d.ts` — append:

```ts
declare module "*.z3" {
  const url: string;
  export default url;
}
```

`jest.config.js` — add to `moduleNameMapper`:

```js
"\\.z3$": "<rootDir>/test/__mocks__/fileMock.js",
```

`.prettierignore` (create if missing) — add:

```
src/Arcade/Zork/vendor/
src/Arcade/Zork/games/
```

ESLint: check for `.eslintignore` or `ignorePatterns` in the ESLint config; add `src/Arcade/Zork/vendor/` the same way the repo already ignores things (if nothing is ignored yet, add `ignorePatterns: ["src/Arcade/Zork/vendor/"]` to the root ESLint config).

- [ ] **Step 6: `src/Arcade/Zork/vendor/vendor.d.ts`**

```ts
// Type declarations for the verbatim vendored MIT-licensed interpreter files.
declare module "*/vendor/zvm.js" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ZVM: new () => any;
  export = ZVM;
}
declare module "*/vendor/glkapi.js" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Glk: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const GlkClass: new () => any;
}
```

- [ ] **Step 7: Verify toolchain is green**

Run: `npm run lint:report && npm run format:report && npm run test`
Expected: all pass; vendor files not flagged. If prettier flags LICENSE.md/README.md, run `npm run format`.

- [ ] **Step 8: Commit**

```bash
git add src/Arcade/Zork webpack.config.js src/@types/global.d.ts jest.config.js .prettierignore <eslint config>
git commit -m "Arcade: vendor ZVM + glkapi and Zork 1-3 story files (MIT, scoped LICENSE.md)"
```

---

### Task 2: ZorkDialog — localStorage-backed Glk file layer (TDD)

**Files:**

- Create: `src/Arcade/Zork/ZorkDialog.ts`
- Test: `test/Arcade/Zork/ZorkDialog.test.ts`

**Interfaces:**

- Produces: `class ZorkDialog { constructor(gameKey: string) }` implementing the
  non-streaming Dialog contract listed in the Reference section. `FileRef` type:
  `{ filename: string; usage: string; gameid?: string }`. Storage key format:
  `zork.<gameKey>.<usage>.<filename>`.

- [ ] **Step 1: Write the failing test**

```ts
import { ZorkDialog } from "../../../src/Arcade/Zork/ZorkDialog";

describe("ZorkDialog", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips binary save data through localStorage", () => {
    const dialog = new ZorkDialog("zork1");
    const ref = dialog.file_construct_ref("slot1", "save", "");
    expect(dialog.file_ref_exists(ref)).toBe(false);
    const bytes = [0, 1, 2, 127, 128, 255, 66];
    expect(dialog.file_write(ref, bytes, true)).toBe(true);
    expect(dialog.file_ref_exists(ref)).toBe(true);
    expect(dialog.file_read(ref, true)).toEqual(bytes);
    expect(localStorage.getItem("zork.zork1.save.slot1")).not.toBeNull();
  });

  it("keeps games separate and removes refs", () => {
    const d1 = new ZorkDialog("zork1");
    const d2 = new ZorkDialog("zork2");
    const ref = d1.file_construct_ref("slot1", "save", "");
    d1.file_write(ref, [1], true);
    expect(d2.file_ref_exists(d2.file_construct_ref("slot1", "save", ""))).toBe(false);
    d1.file_remove_ref(ref);
    expect(d1.file_ref_exists(ref)).toBe(false);
    expect(d1.file_read(ref, true)).toBeNull();
  });

  it("cleans fixed names and constructs temp refs", () => {
    const d = new ZorkDialog("zork1");
    expect(d.file_clean_fixed_name('a/b\\c:d"e', "save")).toBe("abcde");
    const temp = d.file_construct_temp_ref("data");
    expect(temp.filename.startsWith("_temp")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest test/Arcade/Zork/ZorkDialog.test.ts`
Expected: FAIL — cannot find module ZorkDialog.

- [ ] **Step 3: Implement `src/Arcade/Zork/ZorkDialog.ts`**

```ts
/**
 * Minimal non-streaming Glk Dialog implementation backed by localStorage.
 * Implements the subset of the GlkOte Dialog contract that glkapi.js uses,
 * persisting Zork save files per game. See src/Arcade/Zork/README.md.
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

  file_clean_fixed_name(filename: string, _usage: string): string {
    return filename.replace(/["/\\<>:|?*]/g, "");
  }

  file_ref_exists(ref: ZorkFileRef): boolean {
    return localStorage.getItem(this.key(ref)) !== null;
  }

  file_remove_ref(ref: ZorkFileRef): void {
    localStorage.removeItem(this.key(ref));
  }

  /** content is an array of byte values (israw) or a string. Returns success. */
  file_write(ref: ZorkFileRef, content: number[] | string, _israw?: boolean): boolean {
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

  file_read(ref: ZorkFileRef, _israw?: boolean): number[] | string | null {
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
      return null; // corrupt entry: treat as missing (spec: error handling)
    }
  }

  /** ZVM autosave hooks; unused (we don't enable do_vm_autosave), kept safe. */
  autosave_read(_signature: string): null {
    return null;
  }
  autosave_write(_signature: string, _snapshot: unknown): void {
    // no-op
  }
}
```

Note: `String.fromCharCode(...content)` is fine for save-sized arrays (a few KB); if implementation review worries about arg limits, chunk it — but do not prematurely complicate.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest test/Arcade/Zork/ZorkDialog.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/Arcade/Zork/ZorkDialog.ts test/Arcade/Zork/ZorkDialog.test.ts
git commit -m "Arcade: Zork save-file Dialog layer backed by localStorage"
```

---

### Task 3: GlkOteReact — display adapter / state parser (TDD)

**Files:**

- Create: `src/Arcade/Zork/GlkOteReact.ts`
- Test: `test/Arcade/Zork/GlkOteReact.test.ts`

**Interfaces:**

- Consumes: `ZorkDialog` from Task 2.
- Produces:

```ts
export interface StyledRun {
  style: string;
  text: string;
}
export interface TerminalState {
  gridLines: StyledRun[][]; // status-line rows
  bufferLines: StyledRun[][]; // scrollback; one entry per display line
  inputRequest: { id: number; gen: number; type: "line" | "char"; maxlen: number; initial: string } | null;
  filePrompt: { filemode: string; filetype: string } | null;
  disabled: boolean; // true after glk_exit / while no input
  error: string | null;
}
export type TerminalListener = (state: TerminalState) => void;
export class GlkOteReact {
  constructor(dialog: ZorkDialog, listener: TerminalListener);
  // GlkOte contract (called by glkapi): init, update, log, warning, error,
  // getlibrary, getinterface, save_allstate
  // Outgoing (called by UI / session):
  sendLine(text: string): void;
  sendChar(key: string): void;
  sendFileref(value: { filename: string; usage: string } | null): void;
  detach(): void;
}
```

- [ ] **Step 1: Write the failing test**

```ts
import { GlkOteReact, TerminalState } from "../../../src/Arcade/Zork/GlkOteReact";
import { ZorkDialog } from "../../../src/Arcade/Zork/ZorkDialog";

function makeGlkOte(): { glkote: GlkOteReact; states: TerminalState[]; accepted: unknown[] } {
  const states: TerminalState[] = [];
  const accepted: unknown[] = [];
  const glkote = new GlkOteReact(new ZorkDialog("test"), (s) => states.push(s));
  glkote.init({ accept: (ev: unknown) => accepted.push(ev) });
  return { glkote, states, accepted };
}

describe("GlkOteReact", () => {
  it("sends an init event with metrics on init()", () => {
    const { accepted } = makeGlkOte();
    expect(accepted).toHaveLength(1);
    const ev = accepted[0] as { type: string; gen: number; metrics: { width: number } };
    expect(ev.type).toBe("init");
    expect(ev.metrics.width).toBeGreaterThan(0);
  });

  it("parses grid and buffer content updates (both run formats)", () => {
    const { glkote, states } = makeGlkOte();
    glkote.update({
      type: "update",
      gen: 1,
      windows: [
        { id: 1, type: "grid", rock: 202, gridwidth: 80, gridheight: 1 },
        { id: 2, type: "buffer", rock: 201 },
      ],
      content: [
        { id: 1, lines: [{ line: 0, content: ["normal", " West of House"] }] },
        {
          id: 2,
          text: [
            { content: [{ style: "normal", text: "You are standing in an open field" }] },
            { append: true, content: ["normal", " west of a white house."] },
          ],
        },
      ],
      input: [{ id: 2, gen: 1, type: "line", maxlen: 200 }],
    });
    const s = states[states.length - 1];
    expect(s.gridLines[0].map((r) => r.text).join("")).toContain("West of House");
    expect(s.bufferLines).toHaveLength(1);
    expect(s.bufferLines[0].map((r) => r.text).join("")).toBe(
      "You are standing in an open field west of a white house.",
    );
    expect(s.inputRequest).toMatchObject({ id: 2, type: "line" });
  });

  it("clears buffer on clear, surfaces file prompts, and echoes line events back", () => {
    const { glkote, states, accepted } = makeGlkOte();
    glkote.update({
      type: "update",
      gen: 1,
      windows: [{ id: 2, type: "buffer", rock: 201 }],
      content: [{ id: 2, text: [{ content: ["normal", "old text"] }] }],
      input: [{ id: 2, gen: 1, type: "line", maxlen: 200 }],
    });
    glkote.sendLine("save");
    const lineEv = accepted[accepted.length - 1] as { type: string; window: number; value: string };
    expect(lineEv).toMatchObject({ type: "line", window: 2, value: "save" });

    glkote.update({
      type: "update",
      gen: 2,
      specialinput: { type: "fileref_prompt", filemode: "write", filetype: "save" },
    });
    expect(states[states.length - 1].filePrompt).toMatchObject({ filemode: "write" });

    glkote.sendFileref({ filename: "slot1", usage: "save" });
    const frEv = accepted[accepted.length - 1] as { type: string; response: string };
    expect(frEv).toMatchObject({ type: "specialresponse", response: "fileref_prompt" });

    glkote.update({
      type: "update",
      gen: 3,
      content: [{ id: 2, clear: true, text: [{ content: ["normal", "fresh"] }] }],
    });
    const s = states[states.length - 1];
    expect(s.bufferLines.map((l) => l.map((r) => r.text).join("")).join("\n")).toBe("fresh");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest test/Arcade/Zork/GlkOteReact.test.ts`
Expected: FAIL — cannot find module GlkOteReact.

- [ ] **Step 3: Implement `src/Arcade/Zork/GlkOteReact.ts`**

```ts
/**
 * A GlkOte-protocol display implementation that feeds React state instead of
 * manipulating the DOM (replaces glkote.js, which requires jQuery).
 * glkapi.js (vendor/) calls the GlkOte contract methods; the terminal UI calls
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
interface GlkOteUpdate {
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

  log(_msg: string): void {
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
      // Cap scrollback so multi-hour sessions don't grow unbounded.
      const MAX_LINES = 2000;
      if (this.state.bufferLines.length > MAX_LINES) {
        this.state.bufferLines = this.state.bufferLines.slice(-MAX_LINES);
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest test/Arcade/Zork/GlkOteReact.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/Arcade/Zork/GlkOteReact.ts test/Arcade/Zork/GlkOteReact.test.ts
git commit -m "Arcade: GlkOte display adapter feeding React state"
```

---

### Task 4: Engine session + headless Zork smoke test

**Files:**

- Create: `src/Arcade/Zork/session.ts`
- Create: `src/Arcade/Zork/metadata.ts`
- Test: `test/Arcade/Zork/engine.test.ts`

**Interfaces:**

- Consumes: `GlkOteReact`, `TerminalListener` (Task 3), `ZorkDialog` (Task 2), vendor modules (Task 1).
- Produces:

```ts
// session.ts
export interface ZorkSession {
  glkote: GlkOteReact;
  dispose(): void;
}
export function createZorkSession(story: Uint8Array, gameKey: string, listener: TerminalListener): ZorkSession;
// metadata.ts
export interface ZorkGame {
  key: "zork1" | "zork2" | "zork3";
  title: string;
  url: string;
}
export const ZorkGames: ZorkGame[];
```

- [ ] **Step 1: Write the failing smoke test**

This is the money test: real ZVM + real glkapi + our adapter + our dialog, playing actual Zork I with scripted commands, no browser.

```ts
import * as fs from "fs";
import * as path from "path";
import { GlkOteReact, TerminalState } from "../../../src/Arcade/Zork/GlkOteReact";
import { createZorkSession } from "../../../src/Arcade/Zork/session";

function textOf(state: TerminalState): string {
  return state.bufferLines.map((line) => line.map((r) => r.text).join("")).join("\n");
}

describe("Zork I engine smoke test", () => {
  beforeEach(() => localStorage.clear());

  it("boots Zork I, walks the opening, and saves", () => {
    const story = new Uint8Array(fs.readFileSync(path.join(__dirname, "../../../src/Arcade/Zork/games/zork1.z3")));
    let state: TerminalState | null = null;
    const session = createZorkSession(story, "zork1", (s) => (state = s));

    // ZVM runs synchronously until the first input request.
    expect(state).not.toBeNull();
    let s = state as unknown as TerminalState;
    expect(textOf(s)).toContain("West of House");
    expect(textOf(s)).toContain("white house");
    expect(s.inputRequest?.type).toBe("line");

    session.glkote.sendLine("open mailbox");
    s = state as unknown as TerminalState;
    expect(textOf(s)).toContain("leaflet");

    // status line (grid window) shows the room
    expect(s.gridLines.map((l) => l.map((r) => r.text).join("")).join("\n")).toContain("West of House");

    // save -> fileref prompt -> localStorage entry appears
    session.glkote.sendLine("save");
    s = state as unknown as TerminalState;
    expect(s.filePrompt?.filemode).toBe("write");
    session.glkote.sendFileref({ filename: "slot1", usage: "save" });
    s = state as unknown as TerminalState;
    expect(textOf(s).toLowerCase()).toContain("ok");
    expect(localStorage.getItem("zork.zork1.save.slot1")).not.toBeNull();

    session.dispose();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest test/Arcade/Zork/engine.test.ts`
Expected: FAIL — cannot find module session.

- [ ] **Step 3: Implement `src/Arcade/Zork/session.ts`**

```ts
/**
 * Wires a fresh ZVM + glkapi instance to our display adapter and dialog.
 * Wiring pattern verified against ifvms 1.1.6 bin/zvm.js:
 *   vm.prepare(story, options); Glk.init(options); // Glk.init calls vm.init()
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
import ZVM = require("./vendor/zvm.js");
import { GlkClass } from "./vendor/glkapi.js";
import { GlkOteReact, TerminalListener } from "./GlkOteReact";
import { ZorkDialog } from "./ZorkDialog";

export interface ZorkSession {
  glkote: GlkOteReact;
  dispose(): void;
}

export function createZorkSession(story: Uint8Array, gameKey: string, listener: TerminalListener): ZorkSession {
  const dialog = new ZorkDialog(gameKey);
  const glkote = new GlkOteReact(dialog, listener);
  const vm = new ZVM();
  const Glk = new GlkClass();
  const options = { vm, Glk, GlkOte: glkote, Dialog: dialog };
  vm.prepare(story, options);
  Glk.init(options); // synchronously runs the VM to its first input request
  return {
    glkote,
    dispose: () => glkote.detach(),
  };
}
```

If `import = require` syntax fights the repo's TS config, use `import ZVM from "./vendor/zvm.js";` and adjust `vendor.d.ts` (`export default ZVM`) — pick whichever compiles cleanly; do not add build config for it.

- [ ] **Step 4: Implement `src/Arcade/Zork/metadata.ts`**

```ts
import zork1Url from "./games/zork1.z3";
import zork2Url from "./games/zork2.z3";
import zork3Url from "./games/zork3.z3";

export interface ZorkGame {
  key: "zork1" | "zork2" | "zork3";
  title: string;
  url: string;
}

export const ZorkGames: ZorkGame[] = [
  { key: "zork1", title: "Zork I: The Great Underground Empire", url: zork1Url },
  { key: "zork2", title: "Zork II: The Wizard of Frobozz", url: zork2Url },
  { key: "zork3", title: "Zork III: The Dungeon Master", url: zork3Url },
];
```

- [ ] **Step 5: Run the smoke test**

Run: `npx jest test/Arcade/Zork/engine.test.ts`
Expected: PASS. Debugging notes if not:

- "This is not a Z-Code file" → story bytes mangled; check fs read.
- No update received → check `Glk.init` was passed the same options object given to `vm.prepare`.
- Fileref/save shape mismatch → read the `fileref_prompt` handling in `vendor/glkapi.js` (search `fileref_prompt`) and adjust `sendFileref`'s `value` shape to what `gli_fileref_create_by_prompt_callback` expects; update the Task 3 test to match reality. The state of the art is the vendor file, not this plan.

- [ ] **Step 6: Full test suite**

Run: `npm run test`
Expected: all suites pass (new + existing).

- [ ] **Step 7: Commit**

```bash
git add src/Arcade/Zork/session.ts src/Arcade/Zork/metadata.ts test/Arcade/Zork/engine.test.ts
git commit -m "Arcade: ZVM session wiring + headless Zork I smoke test"
```

---

### Task 5: ZorkTerminal — the React terminal UI

**Files:**

- Create: `src/Arcade/Zork/ZorkTerminal.tsx`
- Test: `test/Arcade/Zork/ZorkTerminal.test.tsx`

**Interfaces:**

- Consumes: `TerminalState`, `StyledRun` (Task 3).
- Produces:

```tsx
export interface ZorkTerminalProps {
  state: TerminalState;
  onLine: (text: string) => void;
  onChar: (key: string) => void;
  onFileref: (value: { filename: string; usage: string } | null) => void;
}
export function ZorkTerminal(props: ZorkTerminalProps): React.ReactElement;
```

- [ ] **Step 1: Write the failing render test**

Match the repo's existing React test style if one exists (check `test/` for `.tsx` tests first and copy the harness idiom). Baseline version:

```tsx
import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { ZorkTerminal } from "../../../src/Arcade/Zork/ZorkTerminal";
import type { TerminalState } from "../../../src/Arcade/Zork/GlkOteReact";

const baseState: TerminalState = {
  gridLines: [[{ style: "normal", text: " West of House      Score: 0  Moves: 0" }]],
  bufferLines: [
    [{ style: "normal", text: "You are standing in an open field west of a white house." }],
    [{ style: "normal", text: "There is a small mailbox here." }],
  ],
  inputRequest: { id: 2, gen: 1, type: "line", maxlen: 200, initial: "" },
  filePrompt: null,
  disabled: false,
  error: null,
};

describe("ZorkTerminal", () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });
  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  it("renders status line, story text, and a focused input", () => {
    act(() => {
      ReactDOM.render(
        <ZorkTerminal state={baseState} onLine={jest.fn()} onChar={jest.fn()} onFileref={jest.fn()} />,
        container,
      );
    });
    expect(container.textContent).toContain("West of House");
    expect(container.textContent).toContain("small mailbox");
    expect(container.querySelector("input")).not.toBeNull();
  });

  it("submits a line on Enter and clears the field", () => {
    const onLine = jest.fn();
    act(() => {
      ReactDOM.render(
        <ZorkTerminal state={baseState} onLine={onLine} onChar={jest.fn()} onFileref={jest.fn()} />,
        container,
      );
    });
    const input = container.querySelector("input") as HTMLInputElement;
    act(() => {
      input.value = "open mailbox";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    expect(onLine).toHaveBeenCalledWith("open mailbox");
  });

  it("shows the save-slot prompt when filePrompt is set", () => {
    const state = { ...baseState, inputRequest: null, filePrompt: { filemode: "write", filetype: "save" } };
    act(() => {
      ReactDOM.render(
        <ZorkTerminal state={state} onLine={jest.fn()} onChar={jest.fn()} onFileref={jest.fn()} />,
        container,
      );
    });
    expect(container.textContent).toMatch(/slot|file|name/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest test/Arcade/Zork/ZorkTerminal.test.tsx`
Expected: FAIL — cannot find module ZorkTerminal.

- [ ] **Step 3: Implement `src/Arcade/Zork/ZorkTerminal.tsx`**

```tsx
/**
 * Retro terminal renderer for the Zork arcade cabinets.
 * Pure presentation: renders TerminalState, forwards input upward.
 * Colors come from Settings.theme so player themes apply.
 */
import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Settings } from "../../Settings/Settings";
import type { StyledRun, TerminalState } from "./GlkOteReact";

export interface ZorkTerminalProps {
  state: TerminalState;
  onLine: (text: string) => void;
  onChar: (key: string) => void;
  onFileref: (value: { filename: string; usage: string } | null) => void;
}

const MONO = { fontFamily: '"Lucida Console", "Consolas", monospace', fontSize: "14px", lineHeight: "18px" };

function runStyle(run: StyledRun): React.CSSProperties {
  return {
    fontStyle: run.style === "emphasized" ? "italic" : undefined,
    fontWeight: run.style === "subheader" || run.style === "header" ? "bold" : undefined,
  };
}

function Line({ runs }: { runs: StyledRun[] }): React.ReactElement {
  return (
    <div style={{ whiteSpace: "pre-wrap", minHeight: "18px" }}>
      {runs.map((run, i) => (
        <span key={i} style={runStyle(run)}>
          {run.text}
        </span>
      ))}
    </div>
  );
}

export function ZorkTerminal({ state, onLine, onChar, onFileref }: ZorkTerminalProps): React.ReactElement {
  const [entry, setEntry] = useState("");
  const [slotName, setSlotName] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    inputRef.current?.focus();
  }, [state]);

  function keyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    // Keep keystrokes inside the cabinet: no Bitburner hotkeys mid-game.
    event.stopPropagation();
    if (state.inputRequest?.type === "char") {
      event.preventDefault();
      onChar(event.key.length === 1 ? event.key : event.key.toLowerCase());
      return;
    }
    if (event.key === "Enter") {
      const text = entry;
      setEntry("");
      setHistory((h) => (text.trim() ? [...h, text] : h));
      setHistoryIndex(-1);
      onLine(text);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const idx = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
      if (history[idx] !== undefined) {
        setHistoryIndex(idx);
        setEntry(history[idx]);
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const idx = historyIndex + 1;
      if (idx >= history.length) {
        setHistoryIndex(-1);
        setEntry("");
      } else {
        setHistoryIndex(idx);
        setEntry(history[idx]);
      }
    }
  }

  const width = "740px";
  return (
    <Box
      sx={{ width, border: `1px solid ${Settings.theme.primary}`, backgroundColor: Settings.theme.backgroundprimary }}
    >
      {/* Status line: classic inverse-video Infocom bar */}
      <Box sx={{ backgroundColor: Settings.theme.primary, color: Settings.theme.backgroundprimary, px: 1, ...MONO }}>
        {state.gridLines.length > 0 ? (
          state.gridLines.map((runs, i) => <Line key={i} runs={runs} />)
        ) : (
          <div style={{ minHeight: "18px" }} />
        )}
      </Box>
      {/* Story buffer */}
      <Box ref={scrollRef} sx={{ height: "430px", overflowY: "auto", p: 1, color: Settings.theme.primary, ...MONO }}>
        {state.bufferLines.map((runs, i) => (
          <Line key={i} runs={runs} />
        ))}
        {state.error && <Typography color={Settings.theme.error}>[ {state.error} ]</Typography>}
        {state.disabled && !state.error && !state.filePrompt && (
          <Typography sx={{ color: Settings.theme.secondary, ...MONO }}>
            [ The cabinet hums quietly. Press Back to leave. ]
          </Typography>
        )}
        {/* Input line */}
        {state.inputRequest && !state.filePrompt && (
          <Box sx={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ ...MONO } as React.CSSProperties}>&gt;</span>
            <TextField
              inputRef={inputRef}
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              onKeyDown={keyDown}
              variant="standard"
              autoFocus
              fullWidth
              InputProps={{ disableUnderline: true, sx: { color: Settings.theme.primary, ...MONO } }}
              inputProps={{ maxLength: state.inputRequest.maxlen, "aria-label": "Zork command input" }}
            />
          </Box>
        )}
        {/* Save/restore slot prompt */}
        {state.filePrompt && (
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography sx={{ color: Settings.theme.info, ...MONO }}>
              {state.filePrompt.filemode === "read" ? "Restore from slot:" : "Save to slot:"}
            </Typography>
            <TextField
              value={slotName}
              onChange={(e) => setSlotName(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter" && slotName.trim()) {
                  onFileref({ filename: slotName.trim(), usage: state.filePrompt?.filetype ?? "save" });
                  setSlotName("");
                }
              }}
              variant="standard"
              autoFocus
              placeholder="slot name"
              InputProps={{ sx: { color: Settings.theme.primary, ...MONO } }}
            />
            <Button size="small" onClick={() => onFileref(null)}>
              Cancel
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest test/Arcade/Zork/ZorkTerminal.test.tsx`
Expected: PASS (3 tests). If MUI TextField swallows the synthetic events in jsdom, dispatch on the inner `input` element (querySelector already does) and ensure the `onChange` fires via `Simulate.change` from `react-dom/test-utils` instead — adjust the test, not the component.

- [ ] **Step 5: Commit**

```bash
git add src/Arcade/Zork/ZorkTerminal.tsx test/Arcade/Zork/ZorkTerminal.test.tsx
git commit -m "Arcade: Zork terminal UI component"
```

---

### Task 6: ZorkRoot + arcade menu integration

**Files:**

- Create: `src/Arcade/Zork/ZorkRoot.tsx`
- Modify: `src/Arcade/ui/ArcadeRoot.tsx` (all 43 lines shown in current form below)

**Interfaces:**

- Consumes: `createZorkSession` (Task 4), `ZorkTerminal` (Task 5), `ZorkGames`/`ZorkGame` (Task 4).
- Produces: `<ZorkRoot game={ZorkGame} />` rendered by ArcadeRoot.

- [ ] **Step 1: Implement `src/Arcade/Zork/ZorkRoot.tsx`**

```tsx
/**
 * A Zork arcade cabinet: loads the bundled story file, runs a ZVM session,
 * and renders the terminal. ArcadeRoot supplies the Back button.
 */
import React, { useEffect, useRef, useState } from "react";
import Typography from "@mui/material/Typography";
import { AlertEvents } from "../../ui/React/AlertManager";
import { Settings } from "../../Settings/Settings";
import { GlkOteReact, TerminalState } from "./GlkOteReact";
import { ZorkTerminal } from "./ZorkTerminal";
import { createZorkSession, ZorkSession } from "./session";
import type { ZorkGame } from "./metadata";

export function ZorkRoot({ game }: { game: ZorkGame }): React.ReactElement {
  const [state, setState] = useState<TerminalState | null>(null);
  const sessionRef = useRef<ZorkSession | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(game.url)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load ${game.title}: ${response.status}`);
        return response.arrayBuffer();
      })
      .then((buffer) => {
        if (cancelled) return;
        sessionRef.current = createZorkSession(new Uint8Array(buffer), game.key, setState);
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) AlertEvents.emit("This machine is broken.");
      });
    return () => {
      cancelled = true;
      sessionRef.current?.dispose();
      sessionRef.current = null;
    };
  }, [game]);

  if (!state) {
    return <Typography sx={{ color: Settings.theme.primary }}>The cabinet flickers to life...</Typography>;
  }
  const glkote = (): GlkOteReact | undefined => sessionRef.current?.glkote;
  return (
    <>
      <Typography variant="h5" sx={{ color: Settings.theme.primary, my: 1 }}>
        {game.title}
      </Typography>
      <ZorkTerminal
        state={state}
        onLine={(text) => glkote()?.sendLine(text)}
        onChar={(key) => glkote()?.sendChar(key)}
        onFileref={(value) => glkote()?.sendFileref(value)}
      />
      <Typography sx={{ color: Settings.theme.secondary, mt: 1 }}>
        Type &quot;save&quot; / &quot;restore&quot; to keep your progress. It is pitch black. You are likely to be eaten
        by a grue.
      </Typography>
    </>
  );
}
```

- [ ] **Step 2: Modify `src/Arcade/ui/ArcadeRoot.tsx`**

Full new content (current file is 43 lines; this replaces it):

```tsx
import React, { useState } from "react";
import { BBCabinetRoot } from "./BBCabinet";

import Button from "@mui/material/Button";
import { Player } from "@player";
import { AlertEvents } from "../../ui/React/AlertManager";
import { ZorkRoot } from "../Zork/ZorkRoot";
import { ZorkGames, ZorkGame } from "../Zork/metadata";

enum Page {
  None,
  Megabyteburner2000,
  Zork,
}

export function ArcadeRoot(): React.ReactElement {
  const [page, setPage] = useState(Page.None);
  const [zorkGame, setZorkGame] = useState<ZorkGame | null>(null);

  function mbBurner2000(): void {
    if (Player.activeSourceFileLvl(1) === 0) {
      AlertEvents.emit("This machine is broken.");
    } else {
      setPage(Page.Megabyteburner2000);
    }
  }

  function playZork(game: ZorkGame): void {
    setZorkGame(game);
    setPage(Page.Zork);
  }

  if (page === Page.None) {
    return (
      <>
        <Button onClick={mbBurner2000}>Megabyte burner 2000</Button>
        <br />
        {ZorkGames.map((game) => (
          <React.Fragment key={game.key}>
            <Button onClick={() => playZork(game)}>{game.title}</Button>
            <br />
          </React.Fragment>
        ))}
      </>
    );
  }
  let currentGame = <></>;
  switch (page) {
    case Page.Megabyteburner2000:
      currentGame = <BBCabinetRoot />;
      break;
    case Page.Zork:
      if (zorkGame) currentGame = <ZorkRoot game={zorkGame} />;
      break;
  }
  return (
    <>
      <Button onClick={() => setPage(Page.None)}>Back</Button>
      {currentGame}
    </>
  );
}
```

- [ ] **Step 3: Typecheck, lint, tests**

Run: `npx tsc --noEmit -p . && npm run lint:report && npm run test`
Expected: clean. Likely friction point: the `*.z3` import in metadata.ts needs the Task 1 `global.d.ts` declaration — if tsc complains, the declaration file isn't included; check `tsconfig.json` `include` covers `src/@types`.

- [ ] **Step 4: Commit**

```bash
git add src/Arcade/Zork/ZorkRoot.tsx src/Arcade/ui/ArcadeRoot.tsx
git commit -m "Arcade: Zork 1-3 cabinets in the New Tokyo arcade menu"
```

---

### Task 7: Full verification pass (build + manual play)

**Files:**

- None created; fixes only if verification finds problems.

- [ ] **Step 1: Production-grade checks**

Run: `npm run lint:report && npm run format:report && npm run test`
Expected: all green.

- [ ] **Step 2: Dev build boots**

Run: `npm run start:dev` (webpack dev server) in the background; open the served URL.
Expected: game loads with no console errors from the Zork additions.

- [ ] **Step 3: Manual play verification (use the `verify` skill if available)**

In the running game: create/load a save, travel to New Tokyo, open the Arcade location.

- All four buttons visible (Megabyte + 3 Zorks).
- Launch Zork I: opening text renders, status bar shows "West of House".
- `open mailbox`, `read leaflet` — sensible responses; command history via ↑.
- Typing letters matching Bitburner hotkeys does NOT trigger app navigation.
- `save` → slot prompt → save → `restore` round-trips (check localStorage key `zork.zork1.save.<slot>` in devtools).
- Reload the page (dev server), reopen Zork I, `restore` — save survived.
- Back button returns to arcade menu; re-entering starts a fresh session.
- Launch Zork II and Zork III: openings render.
- Switch to a non-default theme in options; cabinet colors follow.

- [ ] **Step 4: Bundle impact sanity check**

Run: `ls -la dist/assets/*.z3 2>/dev/null || echo "run a build first"` after `npm run build:dev` (or check webpack dev output).
Expected: three ~87–93KB .z3 assets; JS bundle growth ≈ zvm.js + glkapi.js (~330KB pre-minify, less after).

- [ ] **Step 5: Final commit (fixes from verification, if any)**

```bash
git add -A && git commit -m "Arcade: Zork verification fixes"
```

Only commit if there are changes.

---

## Plan Self-Review Notes

- Spec coverage: layout ✔ (T1), interpreter stack ✔ (T1/T4), Dialog/saves ✔ (T2), display adapter ✔ (T3), terminal UI + theme + keyboard capture ✔ (T5), arcade menu ✔ (T6), licensing ✔ (T1 steps 2–3), error handling ✔ (T2 corrupt-save guard, T3 error state, T6 fetch/alert), testing ✔ (T2–T5 + T7 manual).
- Known uncertainty flagged inline: exact `fileref_prompt` response shape (T4 step 5 gives the resolution procedure against the vendor source); MUI TextField event simulation in jsdom (T5 step 4).
- The mockups' standalone "Back" button inside the cabinet was dropped: ArcadeRoot already renders Back above every game (existing convention).
