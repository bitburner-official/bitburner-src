import type { ContentFilePath } from "../Paths/ContentFile";

import { EventEmitter } from "../utils/EventEmitter";
import * as monaco from "monaco-editor";
import { loadThemes, makeTheme } from "./ui/themes";
import { Settings } from "../Settings/Settings";
import { NetscriptExtra } from "../NetscriptFunctions/Extra";
import * as enums from "../Enums";
import { ns } from "../NetscriptFunctions";
import { isLegacyScript } from "../Paths/ScriptFilePath";
import { exceptionAlert } from "../utils/helpers/exceptionAlert";

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
        if (typeof apiValue === "object") {
          populate(apiValue as object);
        }
      }
    }
    populate();
    // Add api keys to tokenization
    (async function () {
      // We have to improve the default js language otherwise theme sucks
      const jsLanguage = monaco.languages.getLanguages().find((l) => l.id === "javascript");
      if (!jsLanguage) {
        return;
      }
      const loader = await jsLanguage.loader();
      // replaced the bare tokens with regexes surrounded by \b, e.g. \b{token}\b which matches a word-break on either side
      // this prevents the highlighter from highlighting pieces of variables that start with a reserved token name
      loader.language.tokenizer.root.unshift([new RegExp("\\bns\\b"), { token: "ns" }]);
      for (const symbol of apiKeys)
        loader.language.tokenizer.root.unshift([new RegExp(`\\b${symbol}\\b`), { token: "netscriptfunction" }]);
      const otherKeywords = ["let", "const", "var", "function", "arguments"];
      const otherKeyvars = ["true", "false", "null", "undefined"];
      otherKeywords.forEach((k) =>
        loader.language.tokenizer.root.unshift([new RegExp(`\\b${k}\\b`), { token: "otherkeywords" }]),
      );
      otherKeyvars.forEach((k) =>
        loader.language.tokenizer.root.unshift([new RegExp(`\\b${k}\\b`), { token: "otherkeyvars" }]),
      );
      loader.language.tokenizer.root.unshift([new RegExp("\\bthis\\b"), { token: "this" }]);
    })().catch((e) => exceptionAlert(e));

    for (const [language, languageDefaults, getLanguageWorker] of [
      ["javascript", monaco.languages.typescript.javascriptDefaults, monaco.languages.typescript.getJavaScriptWorker],
      ["typescript", monaco.languages.typescript.typescriptDefaults, monaco.languages.typescript.getTypeScriptWorker],
    ] as const) {
      languageDefaults.setCompilerOptions({
        ...languageDefaults.getCompilerOptions(),
        // We allow direct importing of `.ts`/`.tsx` files, so tell the typescript language server that.
        allowImportingTsExtensions: true,
        // We use file-at-a-time transpiler. See https://www.typescriptlang.org/tsconfig/#isolatedModules
        isolatedModules: true,
        // We use the classic (i.e. `React.createElement`:) react runtime.
        jsx: monaco.languages.typescript.JsxEmit.React,
        // We define `React` and `ReactDOM` as globals. Don't mark using them as errors.
        allowUmdGlobalAccess: true,
        // Enable strict typechecking.
        // Note that checking in javascript is disabled by default but can be enabled via `// @ts-check`.
        // This enables strictNullChecks, which impacts reported types, even in javascript.
        strict: true,
        noImplicitAny: language === "typescript",
        noImplicitReturns: true,
        // Allow processing of javascript files, for handling cross-language imports.
        allowJs: true,
      });
      languageDefaults.setDiagnosticsOptions({
        ...languageDefaults.getDiagnosticsOptions(),
        // Show semantic errors, even in javascript.
        // Note that this will only happen if checking is enabled in javascript (e.g. by `// @ts-check`)
        noSemanticValidation: false,
        // Ignore these errors in the editor:
        diagnosticCodesToIgnore: [
          // We define `React` and `ReactDOM` as globals. Don't mark using them as errors.
          // Even though we set allowUmdGlobalAccess, it still shows a warning (instead of an error).
          // - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.(2686)
          2686,
        ],
      });

      //  Sync all javascript and typescript text models to both language servers.
      //
      // `monaco.languages.typescript.get{Java,Type}ScriptWorker` returns a promise that
      // fires with a function that takes a list of `monaco.Uri`s and sync's them with the
      // worker. (It also returns the worker, but we don't care about that.) However, it
      // returns a reject promise if the language worker is not loaded yet, so we wait to
      // call it until the language gets loaded.
      const languageWorker = new Promise<(...uris: monaco.Uri[]) => unknown>((resolve) =>
        monaco.languages.onLanguage(language, () => {
          getLanguageWorker()
            .then(resolve)
            .catch((error) => exceptionAlert(error));
        }),
      );
      // Whenever a model is created, arrange for it to be synced to the language server.
      monaco.editor.onDidCreateModel((model) => {
        if (language === "typescript" && isLegacyScript(model.uri.path)) {
          // Don't sync legacy scripts to typescript worker.
          return;
        }
        if (["javascript", "typescript"].includes(model.getLanguageId())) {
          languageWorker.then((resolve) => resolve(model.uri)).catch((error) => exceptionAlert(error));
        }
      });
    }

    monaco.languages.json.jsonDefaults.setModeConfiguration({
      ...monaco.languages.json.jsonDefaults.modeConfiguration,
      //completion should be disabled because the
      //json language server tries to load a schema by default
      completionItems: false,
    });
    // Load themes
    loadThemes(monaco.editor.defineTheme);
    monaco.editor.defineTheme("customTheme", makeTheme(Settings.EditorTheme));
  }
}

export const scriptEditor = new ScriptEditor();
