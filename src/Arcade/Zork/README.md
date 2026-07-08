# Zork in the Arcade

Zork I–III cabinets for the New Tokyo Arcade, powered by the Parchment
project's pure-JS Z-machine interpreter (ZVM).

## Contents

- `vendor/zvm.js` — ifvms.js 1.1.6 `dist/zvm.js`, verbatim. Do not edit or format.
- `vendor/glkapi.js` — GlkOte 2.3.7 `glkapi.js`, verbatim. Do not edit or format.
- `games/*.z3` — compiled Zork I/II/III story files (MIT, Microsoft's 2025
  open-source release via github.com/historicalsource).
- Everything else — Bitburner glue code: React terminal UI (`ZorkTerminal.tsx`),
  GlkOte display adapter (`GlkOteReact.ts`), localStorage save layer
  (`ZorkDialog.ts`), session wiring (`session.ts`), cabinet component
  (`ZorkRoot.tsx`).

## How it fits together

```
games/zork1.z3 → ZVM (vendor/zvm.js) → Glk API (vendor/glkapi.js)
              → GlkOteReact (display adapter) → ZorkTerminal (React UI)
              → ZorkDialog (saves in localStorage, keys: zork.<game>.<usage>.<name>)
```

ZVM makes `glk_*` calls into glkapi.js; glkapi drives the display through the
GlkOte protocol, which `GlkOteReact` translates into React state instead of the
stock jQuery-based glkote.js display.

## Licensing

See `LICENSE.md` — MIT, scoped to this folder only. The rest of Bitburner is
under its own license (repository root `license.txt`).

## Updating vendored files

Re-fetch from upstream and update the versions here and in `LICENSE.md`:

- `https://registry.npmjs.org/ifvms/-/ifvms-<version>.tgz` → `package/dist/zvm.js`
- `https://github.com/erkyrath/glkote` → `glkapi.js`

Design spec: `docs/superpowers/specs/2026-07-07-zork-arcade-design.md`
