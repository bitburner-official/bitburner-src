// Type declarations for the verbatim vendored zvm.js (ifvms 1.1.6, MIT).
// Describes only the API surface our glue code uses; wiring verified against
// ifvms 1.1.6 bin/zvm.js. See LICENSE.md and README.md in src/Arcade/Zork.
declare class ZVM {
  prepare(storydata: Uint8Array, options: ZVM.Options): void;
}

declare namespace ZVM {
  interface Options {
    vm: ZVM;
    Glk: unknown;
    GlkOte: unknown;
    Dialog: unknown;
  }
}

export = ZVM;
