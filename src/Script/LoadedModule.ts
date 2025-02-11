import type { NSFull } from "../NetscriptFunctions";
import type { AutocompleteData, ScriptArg } from "@nsdefs";

// The object portion of this type is not runtime information, it's only to ensure type validation
// And make it harder to overwrite a url with a random non-url string.
export type ScriptURL = string & { __type: "ScriptURL" };

export interface ScriptModule {
  main?: (ns: NSFull, ...args: ScriptArg[]) => unknown;
  autocomplete?: (data: AutocompleteData, flags: string[]) => unknown;
}

export class LoadedModule {
  /** This is a blob URL */
  url: ScriptURL;
  module: Promise<ScriptModule>;
  /**
   * URL of the first script containing the exact code of the module. For example, let's say we have test.ts and
   * test-clone.ts on "home", and they have the same code. If we run test.ts first, sourceUrl is "home/test.ts". When we
   * run test-clone.ts after that, instead of generating another module, we reuse the cache module of test.ts.
   *
   * Each script instance (src\Script\Script.ts) has a property called "mod". That property is a LoadedModule instance.
   * In the previous example, sourceUrl of mod of both test.ts and test-clone.ts are "home/test.ts".
   */
  sourceUrl: string;
  sourceMap?: string;

  constructor(url: ScriptURL, module: Promise<ScriptModule>, sourceUrl: string, sourceMap?: string) {
    this.url = url;
    this.module = module;
    this.sourceUrl = sourceUrl;
    this.sourceMap = sourceMap;
  }
}
