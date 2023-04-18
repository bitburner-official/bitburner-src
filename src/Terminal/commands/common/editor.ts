import { Terminal } from "../../../Terminal";
import { ScriptEditorRouteOptions } from "../../../ui/Router";
import { Router } from "../../../ui/GameRoot";
import { BaseServer } from "../../../Server/BaseServer";
import { CursorPositions } from "../../../ScriptEditor/CursorPositions";
import { ScriptFilePath, hasScriptExtension } from "../../../Paths/ScriptFilePath";
import { TextFilePath, hasTextExtension } from "../../../Paths/TextFilePath";
import { getGlobbedFileMap } from "../../../Paths/GlobbedFiles";

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
  scriptEditorRouteOptions?: ScriptEditorRouteOptions,
): void {
  if (args.length < 1) return Terminal.error(`Incorrect usage of ${command} command. Usage: ${command} [scriptname]`);
  const filesToOpen: Map<ScriptFilePath | TextFilePath, string> = new Map();
  for (const arg of args) {
    const pattern = String(arg);

    // Glob of existing files
    if (pattern.includes("*") || pattern.includes("?")) {
      for (const [path, file] of getGlobbedFileMap(pattern, server, Terminal.currDir)) {
        filesToOpen.set(path, file.content);
      }
      continue;
    }

    // Non-glob, files do not need to already exist
    const path = Terminal.getFilepath(pattern);
    if (!path) return Terminal.error(`Invalid file path ${arg}`);
    if (!hasScriptExtension(path) && !hasTextExtension(path)) {
      return Terminal.error(`${command}: Only scripts or text files can be edited. Invalid file type: ${arg}`);
    }
    const file = server.getContentFile(path);
    const content = file ? file.content : isNs2(path) ? newNs2Template : "";
    filesToOpen.set(path, content);
    if (content === newNs2Template) CursorPositions.saveCursor(path, { row: 3, column: 5 });
  }
  Router.toScriptEditor(filesToOpen, scriptEditorRouteOptions);
}
