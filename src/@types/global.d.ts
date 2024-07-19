// Defined by webpack on startup or compilation
declare const __COMMIT_HASH__: string;
declare const __webpack_public_path__: string;

// When using file-loader, we'll get a path to the resource
declare module "*.png" {
  const value: string;
  export default value;
}

// Achievements communicated back to Electron shell for Steam.
declare interface Document {
  achievements: string[];
}

declare global {
  /**
   * We use Babel Parser. It's one of many internal packages of babel-standalone, and those packages are not exposed in
   * the declaration file.
   * Ref: https://babeljs.io/docs/babel-standalone#internal-packages
   */
  declare module "@babel/standalone" {
    export const packages: {
      parser: {
        parse: (
          code: string,
          option: any,
        ) => {
          program: import("../utils/ScriptTransformer").BabelASTProgram;
        };
      };
    };
  }
}
