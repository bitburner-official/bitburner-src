// Type declarations for the verbatim vendored MIT-licensed interpreter files.
// See src/Arcade/Zork/LICENSE.md and README.md.

declare module "*/vendor/zvm.js" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ZVM: new () => any;
  export default ZVM;
}

declare module "*/vendor/glkapi.js" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Glk: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const GlkClass: new () => any;
}
