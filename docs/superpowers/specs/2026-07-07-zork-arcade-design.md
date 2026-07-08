# Zork 1–3 in the New Tokyo Arcade — Design

**Date:** 2026-07-07
**Author:** Andrew Faust (with Claude)
**Status:** Approved direction: source mod, targeting upstream acceptance

## Goal

Add Zork I, Zork II, and Zork III as playable games in the New Tokyo Arcade. The player
walks to the Arcade, picks a Zork cabinet from the menu, and plays the real game in a
terminal UI that matches Bitburner's theme. The implementation must be clean enough to
submit as a PR to mainline Bitburner.

## Decisions (settled with the user)

- **Route:** Source mod in this fork (`bitburner-zork`), not user-mode scripts.
- **Upstream intent:** The work targets acceptance into mainline Bitburner. That drives
  every technical choice: no new npm dependencies, no jQuery, no WASM, small bundle
  impact, all third-party material isolated in one folder.
- **Licensing:** Bitburner is Apache 2.0 + Commons Clause. All MIT-licensed material
  (interpreter code and game files) lives in a single subfolder with its own
  `LICENSE.md` scoped to that folder only.
- **Gating/reward:** None. The cabinets are pure flavor — always playable, no unlock,
  no in-game reward.
- **Saves:** Zork's `save`/`restore` commands persist to browser storage
  (localStorage), keyed per game. Works identically in web and Electron (same
  mechanism Bitburner's own saves use). Not part of the Bitburner save file; does not
  travel with save export or Steam Cloud. This matches the persistence guarantees
  Bitburner's own web save already has.

## Architecture

Parchment's modern engine for Z-machine games is Bocfel (a ~500KB WASM blob). We do
not use it. The Parchment project also maintains **ZVM** (from ifvms.js, pure JS, MIT),
which fully supports Z-machine v3 — the format of all three Zork files. Pure JS is the
right call for an upstream PR.

Verified interpreter stack (all MIT):

```
zork1.z3 (Uint8Array, ~87KB each)
  → ZVM            (ifvms 1.1.6, dist/zvm.js, 104K — the Z-machine)
  → glkapi.js      (GlkOte 2.3.7, 224K — Glk API layer, zero deps, no DOM)
  → GlkOte display (OURS — React component implementing the GlkOte interface)
  → Dialog         (OURS — minimal file-prompt layer backed by localStorage)
```

Key verified facts:

- ZVM's API (`src/zvm.js` in the ifvms package): `prepare(storydata, {Glk})` then
  `init()/start()`. It requires a Glk API object — it makes `glk_*` calls, it does not
  speak the GlkOte JSON protocol directly.
- `glkapi.js` implements that Glk API and translates to GlkOte display updates. It has
  **no dependencies** — no jQuery, no DOM. jQuery only appears in `glkote.js` (the
  stock display layer), which we replace entirely with React.
- Zork v3 needs a small slice of the display protocol: one grid window (the status
  line), one buffer window (scrolling story text), and line input. Char input
  ("press any key") is also supported for completeness.
- Save/restore flows through `glk_fileref_create_by_prompt` into the Dialog layer,
  producing Quetzal-format blobs of a few KB.

## File layout

Everything new lives under `src/Arcade/Zork/`:

```
src/Arcade/Zork/
  LICENSE.md            # MIT licenses: ifvms.js, GlkOte (glkapi.js), Zork I-III
  README.md             # what this folder is, where the pieces came from, versions
  vendor/
    zvm.js              # verbatim from ifvms 1.1.6 dist/ (MIT header intact)
    glkapi.js           # verbatim from GlkOte 2.3.7 (MIT header intact)
  games/
    zork1.z3            # compiled game files (MIT, Microsoft open-source release)
    zork2.z3
    zork3.z3
  ZorkRoot.tsx          # cabinet component: loads a .z3, wires ZVM+Glk+display
  ZorkTerminal.tsx      # React terminal: status grid, buffer, input line
  GlkOteReact.ts        # GlkOte-interface implementation that drives React state
  ZorkDialog.ts         # Dialog implementation; saves to localStorage
  metadata.ts           # game list: title, filename, per-game save key
```

Changed existing files (kept minimal for PR review):

- `src/Arcade/ui/ArcadeRoot.tsx` — add `Page.Zork1/Zork2/Zork3` enum values, three
  menu buttons, three switch cases rendering `<ZorkRoot game={...} />`.
- `webpack.config.js` — add `.z3` to the `asset/resource` rule (one-line change) so
  game files bundle as hashed assets.
- Vendored files excluded from ESLint/Prettier (config ignore entries) — they are
  third-party code kept verbatim.

## Component design

**ZorkRoot.tsx** — mounts per cabinet. Fetches the bundled `.z3` asset as an
ArrayBuffer, instantiates ZVM, `prepare()`s it with the Glk object from `glkapi.js`,
provides our GlkOteReact display and ZorkDialog, and starts the machine. Unmount
disposes listeners. Engine errors are caught and surfaced via Bitburner's alert
mechanism with a "cabinet resets" flavor, returning to the arcade menu.

**GlkOteReact.ts** — implements the GlkOte interface `glkapi.js` expects (`init`,
`update`, `error`, `getinterface`, ...). `update(state)` parses window/content/input
updates into a plain state object and pushes it to React via a subscription. Input
events (line submit, keypress) go back through the `accept` callback.

**ZorkTerminal.tsx** — renders that state:

- Status line: inverse-video bar (theme primary as background, black text) showing the
  grid window contents (room name, score/moves) — exactly how Infocom terps did it.
- Buffer: scrolling story text, auto-scrolled to bottom, text styles (bold/italic)
  honored.
- Input: inline text field at the prompt with a blinking block cursor. Keyboard events
  are captured (`stopPropagation`) while the cabinet has focus so Bitburner hotkeys
  don't fire mid-game. Up/down arrow recalls command history (session-scoped).
- All colors from `Settings.theme` (primary, background, etc.) so player themes apply.
- A "Back" button (matching Megabyte cabinet convention) leaves the game; in-game
  `quit` also returns to the arcade menu.

**ZorkDialog.ts** — implements the minimal Dialog contract glkapi uses for
save/restore/transcript prompts. Saves serialize to base64 in localStorage under
`zork.<game>.<filename>`; restore lists/reads them back. Transcript and command-record
streams are declined politely (not supported).

## Licensing plan

`src/Arcade/Zork/LICENSE.md` contains, clearly separated:

1. The MIT license for ifvms.js (The ifvms.js team) — covers `vendor/zvm.js`.
2. The MIT license for GlkOte (Andrew Plotkin) — covers `vendor/glkapi.js`.
3. The MIT license for Zork I/II/III (Microsoft's open-source release) — covers
   `games/*.z3`.

The file opens with a scope statement: the license applies **only** to the contents of
`src/Arcade/Zork/`; the rest of Bitburner remains under its own license (see root
`license.txt`). The folder README records upstream versions/commits so future
maintainers can refresh the vendored files.

## Error handling

- Story file fails to load (asset fetch error): alert "This machine is broken." (the
  established arcade idiom) and return to menu.
- ZVM runtime fault: catch, log to console, same "machine is broken" alert, return to
  menu. No crash may escape into Bitburner's React tree (error boundary around the
  cabinet).
- Corrupt save blob on restore: ZVM reports restore failure in-game (native behavior);
  we additionally guard JSON/base64 decode and treat failures as "no such save".

## Testing

- **Headless engine test (jest):** load `zork1.z3` in ZVM with a scripted GlkOte stub,
  feed `open mailbox` / `read leaflet`, assert expected output text appears. This
  proves the vendored interpreter + our glue works without a browser.
- **Display state test:** feed recorded GlkOte update payloads into GlkOteReact's
  parser, assert the resulting terminal state (status line text, buffer lines).
- **Save round-trip test:** save → localStorage entry exists → restore succeeds.
- Manual: play all three games' openings in web + Electron dev builds; verify theme
  switching, keyboard capture, Back button, save/restore across an app restart.

## Non-goals

- No achievements, unlocks, stats, or any mechanical coupling to Bitburner systems.
- No support for other Z-machine games or a general IF player (YAGNI — but nothing
  prevents it later; the Zork folder boundary keeps that door open).
- No transcript/scripting support, no sound, no graphics (v3 Zork uses none).
- Zork saves are not in the Bitburner save file (revisitable before the PR if
  upstream prefers it).

## Mockups

See `mockups/zork-arcade-menu.svg` (arcade menu with three new cabinets) and
`mockups/zork-terminal.svg` (Zork I running: status bar, story buffer, prompt).
