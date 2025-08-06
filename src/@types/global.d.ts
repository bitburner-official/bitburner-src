// Defined by webpack on startup or compilation
declare const __COMMIT_HASH__: string;
declare const __webpack_public_path__: string;

// When using file-loader, we'll get a path to the resource
declare module "*.png" {
  const value: string;
  export default value;
}
declare module "*.jpg" {
  const value: string;
  export default value;
}
declare module "*.svg" {
  const value: string;
  export default value;
}

// Achievements communicated back to Electron shell for Steam.
declare interface Document {
  achievements: string[];
}

declare global {
  /**
   * "loader" is not exposed in the public API.
   */
  module "monaco-editor" {
    namespace languages {
      interface ILanguageExtensionPoint {
        loader: () => Promise<{
          language: {
            tokenizer: {
              root: any[];
            };
          };
        }>;
      }
    }
  }
}

module "monaco-vim" {
  export const initVimMode: (...args: unknown[]) => { dispose: () => void };
  export const VimMode: {
    Vim: {
      defineEx: (...args: unknown[]) => void;
      mapCommand: (...args: unknown[]) => void;
      defineAction: (...args: unknown[]) => void;
    };
  };
}

declare module "fast-dice-coefficient" {
  export default function dice(a: string, b: string): number;
}
