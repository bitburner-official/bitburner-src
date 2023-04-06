/**
 * Uses the acorn.js library to parse a script's code into an AST and
 * recursively walk through that AST to replace import urls with blobs
 */
import * as walk from "acorn-walk";
import { parse } from "acorn";

import { Script, ScriptURL } from "./Script/Script";
import { areImportsEquals } from "./Terminal/DirectoryHelpers";
import { ScriptModule } from "./Script/ScriptModule";

// Acorn type def is straight up incomplete so we have to fill with our own.
export type Node = any;

// Makes a blob that contains the code of a given script.
function makeScriptBlob(code: string): Blob {
  return new Blob([code], { type: "text/javascript" });
}

const urlsToRevoke: ScriptURL[] = [];
let activeCompilations = 0;
/** Function to queue up revoking of script URLs. If there's no active compilation, just revoke it now. */
export const queueUrlRevoke = (url: ScriptURL) => {
  if (!activeCompilations) return URL.revokeObjectURL(url);
  urlsToRevoke.push(url);
};

/** Function to revoke any expired urls */
function triggerURLRevokes() {
  if (activeCompilations === 0) {
    // Revoke all pending revoke URLS
    urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    // Remove all url strings from array
    urlsToRevoke.length = 0;
  }
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

export function compile(script: Script, scripts: Script[]): Promise<ScriptModule> {
  // Return the module if it already exists
  if (script.module) return script.module;
  // While importing, use an existing url or generate a new one.
  if (!script.url) script.url = generateScriptUrl(script, scripts, []);
  activeCompilations++;
  script.module = config
    .doImport(script.url)
    .catch((e) => {
      script.invalidateModule();
      console.error(`Error occurred while attempting to compile ${script.filename} on ${script.server}:`);
      console.error(e);
      throw e;
    })
    .finally(() => {
      activeCompilations--;
      triggerURLRevokes();
    });
  return script.module;
}

/** Add the necessary dependency relationships for a script.
 * Dependents are used only for passing invalidation up an import tree, so only direct dependents need to be stored.
 * Direct and indirect dependents need to have the current url/script added to their dependency map for error text.
 *
 * This should only be called once the script has an assigned URL. */
function addDependencyInfo(script: Script, dependents: Script[]) {
  if (!script.url) throw new Error(`addDependencyInfo called without an assigned script URL (${script.filename})`);
  if (dependents.length) {
    script.dependents.add(dependents[dependents.length - 1]);
    for (const dependent of dependents) dependent.dependencies.set(script.url, script);
  }
}

/**
 * @param script the script that needs a URL assigned
 * @param scripts array of other scripts on the server
 * @param dependents All scripts that were higher up in the import tree in a recursive call.
 */
function generateScriptUrl(script: Script, scripts: Script[], dependents: Script[]): ScriptURL {
  // Early return for recursive calls where the script already has a URL
  if (script.url) {
    addDependencyInfo(script, dependents);
    return script.url;
  }

  // Inspired by: https://stackoverflow.com/a/43834063/91401
  const ast = parse(script.code, { sourceType: "module", ecmaVersion: "latest", ranges: true });
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
  let newCode = script.code;
  // Loop through each node and replace the script name with a blob url.
  for (const node of importNodes) {
    const filename = node.filename.startsWith("./") ? node.filename.substring(2) : node.filename;

    // Find the corresponding script.
    const importedScript = scripts.find((s) => areImportsEquals(s.filename, filename));
    if (!importedScript) continue;

    importedScript.url = generateScriptUrl(importedScript, scripts, [...dependents, script]);
    newCode = newCode.substring(0, node.start) + importedScript.url + newCode.substring(node.end);
  }

  newCode += `\n//# sourceURL=${script.server}/${script.filename}`;

  // At this point we have the full code and can construct a new blob / assign the URL.
  script.url = URL.createObjectURL(makeScriptBlob(newCode)) as ScriptURL;
  addDependencyInfo(script, dependents);
  return script.url;
}
