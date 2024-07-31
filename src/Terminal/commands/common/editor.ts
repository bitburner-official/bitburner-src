import { Terminal } from "../../../Terminal";
import { ScriptEditorRouteOptions, Page } from "../../../ui/Router";
import { Router } from "../../../ui/GameRoot";
import { BaseServer } from "../../../Server/BaseServer";
import { type ScriptFilePath, hasScriptExtension, isLegacyScript } from "../../../Paths/ScriptFilePath";
import { TextFilePath, hasTextExtension } from "../../../Paths/TextFilePath";
import { getGlobbedFileMap } from "../../../Paths/ListFiles";
import { sendDeprecationNotice } from "./deprecation";
import { getFileType, getFileTypeFeature } from "../../../utils/ScriptTransformer";

// 2.3: Globbing implementation was removed from this file. Globbing will be reintroduced as broader functionality and integrated here.

interface EditorParameters {
  args: (string | number | boolean)[];
  server: BaseServer;
}

function getScriptTemplate(path: string): string {
  if (isLegacyScript(path)) {
    return "";
  }
  const fileTypeFeature = getFileTypeFeature(getFileType(path));
  if (fileTypeFeature.isTypeScript) {
    return `export async function main(ns: NS) {

}`;
  } else {
    return `/** @param {NS} ns */
export async function main(ns) {

}`;
  }
}

export function commonEditor(
  command: string,
  { args, server }: EditorParameters,
  options?: ScriptEditorRouteOptions,
): void {
  if (args.length < 1) return Terminal.error(`Incorrect usage of ${command} command. Usage: ${command} [scriptname]`);
  const files = new Map<ScriptFilePath | TextFilePath, string>();
  let hasLegacyScript = false;
  for (const arg of args) {
    const pattern = String(arg);

    // Glob of existing files
    if (pattern.includes("*") || pattern.includes("?")) {
      for (const [path, file] of getGlobbedFileMap(pattern, server, Terminal.currDir)) {
        if (isLegacyScript(path)) {
          hasLegacyScript = true;
        }
        files.set(path, file.content);
      }
      continue;
    }

    // Non-glob, files do not need to already exist
    const path = Terminal.getFilepath(pattern);
    if (!path) return Terminal.error(`Invalid file path ${arg}`);
    if (!hasScriptExtension(path) && !hasTextExtension(path)) {
      return Terminal.error(`${command}: Only scripts or text files can be edited. Invalid file type: ${arg}`);
    }
    if (isLegacyScript(path)) {
      hasLegacyScript = true;
    }
    const file = server.getContentFile(path);
    files.set(path, file ? file.content : getScriptTemplate(path));
  }
  if (hasLegacyScript) {
    sendDeprecationNotice();
  }
  Router.toPage(Page.ScriptEditor, { files, options });
}
