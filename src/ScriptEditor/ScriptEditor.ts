import type { ContentFilePath } from "../Paths/ContentFile";

import { EventEmitter } from "../utils/EventEmitter";
import * as monaco from "monaco-editor";
import { loadThemes, makeTheme, sanitizeTheme } from "./ui/themes";
import libSource from "!!raw-loader!./NetscriptDefinitions.d.ts";
import { Settings } from "../Settings/Settings";
import { NetscriptExtra } from "../NetscriptFunctions/Extra";
import * as enums from "../Enums";
import { ns } from "../NetscriptFunctions";

/** Event emitter used for tracking when changes have been made to a content file. */
export const fileEditEvents = new EventEmitter<[hostname: string, filename: ContentFilePath]>();

export class ScriptEditor {
  // TODO: This will store info about currently open scripts.
  // Among other things, this will allow informing the script editor of changes made elsewhere, even if the script editor is not being rendered.
  // openScripts: OpenScript[] = [];

  // Currently, this object is only used for initialization.
  isInitialized = false;
  initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    // populate API keys for adding tokenization
    const apiKeys: string[] = [];
    const api = { args: [], pid: 1, enums, ...ns };
    const hiddenAPI = NetscriptExtra();
    function populate(apiLayer: object = api) {
      for (const [apiKey, apiValue] of Object.entries(apiLayer)) {
        if (apiLayer === api && apiKey in hiddenAPI) continue;
        apiKeys.push(apiKey);
        if (typeof apiValue === "object") populate(apiValue);
      }
    }
    populate();
    // Add api keys to tokenization
    (async function () {
      // We have to improve the default js language otherwise theme sucks
      const jsLanguage = monaco.languages.getLanguages().find((l) => l.id === "javascript");
      // Unsupported function is not exposed in monaco public API.
      const l = await (jsLanguage as any).loader();
      // replaced the bare tokens with regexes surrounded by \b, e.g. \b{token}\b which matches a word-break on either side
      // this prevents the highlighter from highlighting pieces of variables that start with a reserved token name
      l.language.tokenizer.root.unshift([new RegExp("\\bns\\b"), { token: "ns" }]);
      for (const symbol of apiKeys)
        l.language.tokenizer.root.unshift([new RegExp(`\\b${symbol}\\b`), { token: "netscriptfunction" }]);
      const otherKeywords = ["let", "const", "var", "function", "arguments"];
      const otherKeyvars = ["true", "false", "null", "undefined"];
      otherKeywords.forEach((k) =>
        l.language.tokenizer.root.unshift([new RegExp(`\\b${k}\\b`), { token: "otherkeywords" }]),
      );
      otherKeyvars.forEach((k) =>
        l.language.tokenizer.root.unshift([new RegExp(`\\b${k}\\b`), { token: "otherkeyvars" }]),
      );
      l.language.tokenizer.root.unshift([new RegExp("\\bthis\\b"), { token: "this" }]);
    })();

    // Add ts definitions for API
    const source = (libSource + "").replace(/export /g, "");
    monaco.languages.typescript.javascriptDefaults.addExtraLib(source, "netscript.d.ts");
    monaco.languages.typescript.typescriptDefaults.addExtraLib(source, "netscript.d.ts");
    monaco.languages.json.jsonDefaults.setModeConfiguration({
      ...monaco.languages.json.jsonDefaults.modeConfiguration,
      //completion should be disabled because the
      //json language server tries to load a schema by default
      completionItems: false,
    });
    // Load themes
    loadThemes(monaco.editor.defineTheme);
    sanitizeTheme(Settings.EditorTheme);
    monaco.editor.defineTheme("customTheme", makeTheme(Settings.EditorTheme));
  }
}

export const scriptEditor = new ScriptEditor();
