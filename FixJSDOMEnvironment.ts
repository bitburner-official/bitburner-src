import JSDOMEnvironment from "jest-environment-jsdom";
import { cloneDeep } from "lodash";
import { registerHooks } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

// https://github.com/facebook/jest/blob/v29.4.3/website/versioned_docs/version-29.4/Configuration.md#testenvironment-string
export default class FixJSDOMEnvironment extends JSDOMEnvironment {
  constructor(...args: ConstructorParameters<typeof JSDOMEnvironment>) {
    super(...args);

    // TODO Tests aren't polyfilled.
    this.global.structuredClone = cloneDeep;

    // FIXME https://github.com/nodejs/node/issues/35889
    // Add missing importActual() function to mirror requireActual(),
    // which lets us work around the ESM bug.
    // Wrap the construction of the function in eval, so that transpilers
    // don't touch the import() call.
    this.global.importActual = eval("url => import(url)");

    // Player scripts are loaded via native import() (see importActual above, fixDoImportIssue in
    // test/jest/Utilities.ts, and code in src/NetscriptJSEvaluator.ts).
    // Because native import() uses Node's built-in ESM loader directly:
    // - Jest's moduleNameMapper is bypassed, so `"^https://mock.invalid$": "<rootDir>/test/__mocks__/httpsUrlMock.js"`
    // does not work.
    // - Node's default ESM loader only supports file:, node:, and data: schemes. It throws ERR_UNSUPPORTED_ESM_URL_SCHEME
    // on "https://"" imports inside player scripts.
    //
    // registerHooks intercepts Node's native ESM resolution so "https://" specifiers resolve to local .mjs mock files
    // on disk.
    // Note that the mock file should use the .mjs extension because it is an ESM module. Without `"type": "module"` in
    // package.json, Node treats .js files as CommonJS by default. If syntax detection identifies ESM syntax, Node
    // interprets them as ESM instead, emitting a MODULE_TYPELESS_PACKAGE_JSON warning and incurring reparsing overhead.
    registerHooks({
      resolve(specifier, context, nextResolve) {
        // IETF reserves the .invalid top-level domain for names that are guaranteed not to be valid on the public internet.
        if (specifier === "https://mock.invalid") {
          // Jest transforms this TypeScript file to CommonJS via Babel and executes it in a CommonJS module context,
          // where __dirname is available.
          // If we configure Jest to use native ESM, use import.meta.url or import.meta.dirname instead.
          const mockFileUrl = pathToFileURL(path.resolve(__dirname, "test/__mocks__/httpsUrlMock.mjs")).href;
          return {
            shortCircuit: true,
            url: mockFileUrl,
          };
        }
        return nextResolve(specifier, context);
      },
    });

    /**
     * By default, Jest only passes a limited number of global objects to the test environment. We need these global
     * objects when testing code that loads save data.
     */
    this.global.Uint8Array = Uint8Array;
    this.global.Blob = Blob;
    this.global.CompressionStream = CompressionStream;
    this.global.DecompressionStream = DecompressionStream;
    this.global.TextDecoderStream = TextDecoderStream;
    this.global.URL = URL;
    this.global.Response = Response;

    /**
     * https://github.com/jsdom/jsdom/issues/3766
     * https://github.com/jsdom/jsdom/issues/3444
     */
    this.global.document.adoptedStyleSheets = [];
    this.global.CSSStyleSheet.prototype.replaceSync = () => {};
  }
}
