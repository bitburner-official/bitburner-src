import type { NSFull } from "../NetscriptFunctions";
import type { AutocompleteData, ScriptArg } from "@nsdefs";
import type { ScriptFilePath } from "../Paths/ScriptFilePath";

// The object portion of this type is not runtime information, it's only to ensure type validation
// And make it harder to overwrite a url with a random non-url string.
export type ScriptURL = string & { __type: "ScriptURL" };

export interface ScriptModule {
  main?: (ns: NSFull, ...args: ScriptArg[]) => unknown;
  autocomplete?: (data: AutocompleteData, flags: string[]) => unknown;
}

export class LoadedModule {
  url: ScriptURL;
  module: Promise<ScriptModule>;
  /** Scripts that we directly or indirectly import, including ourselves. */
  dependencies: [ScriptURL, ScriptFilePath][];

  constructor(url: ScriptURL, module: Promise<ScriptModule>, dependencies: [ScriptURL, ScriptFilePath][]) {
    this.url = url;
    this.module = module;
    this.dependencies = dependencies;
  }
}
