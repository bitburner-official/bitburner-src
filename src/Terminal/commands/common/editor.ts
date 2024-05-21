import { Terminal } from "../../../Terminal";
import { ScriptEditorRouteOptions, Page } from "../../../ui/Router";
import { Router } from "../../../ui/GameRoot";
import { BaseServer } from "../../../Server/BaseServer";
import { ScriptFilePath, hasScriptExtension } from "../../../Paths/ScriptFilePath";
import { TextFilePath, hasTextExtension } from "../../../Paths/TextFilePath";
import { getGlobbedFileMap } from "../../../Paths/GlobbedFiles";
import { sendDeprecationNotice } from "./deprecation";

// 2.3: Globbing implementation was removed from this file. Globbing will be reintroduced as broader functionality and integrated here.

interface EditorParameters {
  args: (string | number | boolean)[];
  server: BaseServer;
}

function isNs2(filename: string): boolean {
  return filename.endsWith(".js");
}

const newNs2Template = `/** @param {NS} ns */
export async function main(ns) {

}`;

export function commonEditor(
  command: string,
  { args, server }: EditorParameters,
  options?: ScriptEditorRouteOptions,
): void {
  if (args.length < 1) return Terminal.error(`Incorrect usage of ${command} command. Usage: ${command} [scriptname]`);
  const files = new Map<ScriptFilePath | TextFilePath, string>();
  let hasNs1 = false;
  for (const arg of args) {
    const pattern = String(arg);

    // Glob of existing files
    if (pattern.includes("*") || pattern.includes("?")) {
      for (const [path, file] of getGlobbedFileMap(pattern, server, Terminal.currDir)) {
        if (path.endsWith(".script")) hasNs1 = true;
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
    if (path.endsWith(".script")) hasNs1 = true;
    const file = server.getContentFile(path);
    const content = file ? file.content : isNs2(path) ? newNs2Template : "";
    files.set(path, content);
  }
  if (hasNs1) {
    sendDeprecationNotice();
  }
  Router.toPage(Page.ScriptEditor, { files, options });
}
