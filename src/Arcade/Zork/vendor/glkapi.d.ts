// Type declarations for the verbatim vendored glkapi.js (GlkOte 2.3.7, MIT).
// Describes only the API surface our glue code uses. See LICENSE.md and
// README.md in src/Arcade/Zork.
export interface GlkInstance {
  init(options: object): void;
}

export const Glk: GlkInstance;
export const GlkClass: new () => GlkInstance;
