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
  doImport(url: string): Promise<ScriptModule> {
    return import(/*webpackIgnore:true*/ url);
  },
};

export function compile(script: Script, scripts: Script[]): Promise<ScriptModule> {
  // Return the module if it already exists
  if (script.module) return script.module;
  // While importing, use an existing url or generate a new one.
  script.module = config.doImport(script.url || generateScriptUrl(script, scripts, [])).catch((e) => {
    script.invalidateModule();
    console.error(`Error occurred while attempting to compile ${script.filename} on ${script.server}:`);
    console.error(e);
    throw e;
  });
  return script.module;
}

/**
 * @param script the script that needs a URL assigned
 * @param scripts array of other scripts on the server
 * @param dependents array of scripts higher up in the import tree from this execution
 */
function generateScriptUrl(script: Script, scripts: Script[], dependents: Script[]): ScriptURL {
  // Inspired by: https://stackoverflow.com/a/43834063/91401
  dependents.forEach((dependent) => script.dependents.add(dependent));
  // Early return if script already has a URL
  if (script.url) {
    for (const dependent of dependents) dependent.dependencies.set(script.url, script);
    return script.url;
  }

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

  // We only ever assign the URL
  const url = URL.createObjectURL(makeScriptBlob(newCode));
  script.url = url;
  dependents.forEach((dependent) => dependent.dependencies.set(url, script));
  return script.url;
}
