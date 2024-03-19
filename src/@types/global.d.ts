// Defined by webpack on startup or compilation
declare const __COMMIT_HASH__: string;

// When using file-loader, we'll get a path to the resource
declare module "*.png" {
  const value: string;
  export default value;
}

// When importing wasm, we get a url pointing to the wasm file
declare module "*.wasm" {
  const value: string;
  export default value;
}

// This module doesnt have TS declarations.
declare module "acorn-jsx-walk" {
  function extend(walk: typeof import("acorn-walk")["base"]);
  export { extend };
}

// Achievements communicated back to Electron shell for Steam.
declare interface Document {
  achievements: string[];
}
