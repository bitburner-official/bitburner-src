/**
 * Uses the acorn.js library to parse a script's code into an AST and
 * recursively walk through that AST to replace import urls with blobs
 */
import * as walk from "acorn-walk";
import { parse } from "acorn";
import * as convertSourceMap from "convert-source-map";

import { LoadedModule, type ScriptURL, type ScriptModule } from "./Script/LoadedModule";
import type { Script } from "./Script/Script";
import type { ScriptFilePath } from "./Paths/ScriptFilePath";
import { FileType, getFileType, getModuleScript, transformScript } from "./utils/ScriptTransformer";

// Acorn type def is straight up incomplete so we have to fill with our own.
export type Node = any;

// Makes a blob that contains the code of a given script.
function makeScriptBlob(code: string): Blob {
  return new Blob([code], { type: "text/javascript" });
}

// Webpack likes to turn the import into a require, which sort of
// but not really behaves like import. So we use a "magic comment"
// to disable that and leave it as a dynamic import.
//
// However, we need to be able to replace this implementation in tests. Ideally
// it would be fine, but Jest causes segfaults when using dynamic import: see
// https://github.com/nodejs/node/issues/35889 and
// https://github.com/facebook/jest/issues/11438
// import() is not a function, so it can't be replaced. We need this separate
// config object to provide a hook point.
export const config = {
  doImport(url: ScriptURL): Promise<ScriptModule> {
    return import(/*webpackIgnore:true*/ url);
  },
};

// Maps code to LoadedModules, so we can reuse compiled code across servers,
// or possibly across files (if someone makes two copies of the same script,
// or changes a script and then changes it back).
// Modules can never be garbage collected by Javascript, so it's good to try
// to keep from making more than we need.
const moduleCache = new Map<string, WeakRef<LoadedModule>>();
const cleanup = new FinalizationRegistry((mapKey: string) => {
  // A new entry can be created with the same key, before this callback is called.
  if (moduleCache.get(mapKey)?.deref() === undefined) {
    moduleCache.delete(mapKey);
  }
});

export function compile(script: Script, scripts: Map<ScriptFilePath, Script>): Promise<ScriptModule> {
  // Return the module if it already exists
  if (script.mod) return script.mod.module;

  script.mod = generateLoadedModule(script, scripts, []);
  return script.mod.module;
}

/** Add the necessary dependency relationships for a script.
 * Dependents are used only for passing invalidation up an import tree, so only direct dependents need to be stored.
 * Direct and indirect dependents need to have the current url/script added to their dependency map for error text.
 *
 * This should only be called once the script has a LoadedModule. */
function addDependencyInfo(script: Script, seenStack: Script[]) {
  if (!script.mod) throw new Error(`addDependencyInfo called without a LoadedModule (${script.filename})`);
  if (seenStack.length) {
    script.dependents.add(seenStack[seenStack.length - 1]);
    for (const dependent of seenStack) dependent.dependencies.set(script.mod.url, script);
  }
  // Add self to dependencies (it's not part of the stack, since we don't want
  // it in dependents.)
  script.dependencies.set(script.mod.url, script);
}

/**
 * @param script the script that needs a URL assigned
 * @param scripts array of other scripts on the server
 * @param seenStack A stack of scripts that were higher up in the import tree in a recursive call.
 */
function generateLoadedModule(script: Script, scripts: Map<ScriptFilePath, Script>, seenStack: Script[]): LoadedModule {
  // Early return for recursive calls where the script already has a URL
  if (script.mod) {
    addDependencyInfo(script, seenStack);
    return script.mod;
  }

  let scriptCode, sourceMap;
  const fileType = getFileType(script.filename);
  switch (fileType) {
    case FileType.JS:
      scriptCode = script.code;
      break;
    case FileType.JSX:
    case FileType.TS:
    case FileType.TSX:
      ({ scriptCode, sourceMap } = transformScript(script, fileType));
      break;
    default:
      throw new Error(`Invalid file type: ${fileType}. Filename: ${script.filename}, server: ${script.server}.`);
  }

  // Inspired by: https://stackoverflow.com/a/43834063/91401
  const ast = parse(scriptCode, { sourceType: "module", ecmaVersion: "latest", ranges: true });
  interface importNode {
    filename: string;
    start: number;
    end: number;
  }
  const importNodes: importNode[] = [];
  // Walk the nodes of this tree and find any import declaration statements.
  walk.simple(ast, {
    ImportDeclaration(node: Node) {
      // Push this import onto the stack to replace
      if (!node.source) return;
      importNodes.push({
        filename: node.source.value,
        start: node.source.range[0] + 1,
        end: node.source.range[1] - 1,
      });
    },
    ExportNamedDeclaration(node: Node) {
      if (!node.source) return;
      importNodes.push({
        filename: node.source.value,
        start: node.source.range[0] + 1,
        end: node.source.range[1] - 1,
      });
    },
    ExportAllDeclaration(node: Node) {
      if (!node.source) return;
      importNodes.push({
        filename: node.source.value,
        start: node.source.range[0] + 1,
        end: node.source.range[1] - 1,
      });
    },
  });
  // Sort the nodes from last start index to first. This replaces the last import with a blob first,
  // preventing the ranges for other imports from being shifted.
  importNodes.sort((a, b) => b.start - a.start);
  let newCode = scriptCode;
  // Loop through each node and replace the script name with a blob url.
  for (const node of importNodes) {
    const importedScript = getModuleScript(node.filename, script.filename, scripts);

    seenStack.push(script);
    importedScript.mod = generateLoadedModule(importedScript, scripts, seenStack);
    seenStack.pop();
    newCode = newCode.substring(0, node.start) + importedScript.mod.url + newCode.substring(node.end);
  }

  const cachedMod = moduleCache.get(newCode)?.deref();
  if (cachedMod) {
    script.mod = cachedMod;
  } else {
    // Add an inline source-map to make debugging nicer. This won't be right
    // in all cases, since we can share the same script across multiple
    // servers; it will be listed under the first server it was compiled for.
    // We don't include this in the cache key, so that other instances of the
    // script dedupe properly.
    const sourceURL = `bitburner:///${script.server}/${script.filename}`;
    const adjustedCode = sourceMap
      ? newCode +
        `\n//# sourceURL=${sourceURL}.generated` +
        `\n${convertSourceMap.fromObject({ ...sourceMap, sources: [sourceURL], sourceRoot: "/" }).toComment()}`
      : scriptCode + `\n//# sourceURL=${sourceURL}`;
    // At this point we have the full code and can construct a new blob / assign the URL.

    const url = URL.createObjectURL(makeScriptBlob(adjustedCode)) as ScriptURL;
    const module = config.doImport(url).catch((e) => {
      script.invalidateModule();
      console.error(`Error occurred while attempting to compile ${script.filename} on ${script.server}:`);
      console.error(e);
      throw e;
    });
    // We can *immediately* invalidate the Blob, because we've already started the fetch
    // by starting the import. From now on, any imports using the blob's URL *must*
    // directly return the module, without even attempting to fetch, due to the way
    // modules work.
    URL.revokeObjectURL(url);
    script.mod = new LoadedModule(url, module);
    moduleCache.set(newCode, new WeakRef(script.mod));
    cleanup.register(script.mod, newCode);
  }

  addDependencyInfo(script, seenStack);
  return script.mod;
}
