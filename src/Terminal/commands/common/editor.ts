import { Terminal } from "../../../Terminal";
import { Page } from "../../../ui/Router";
import { Router } from "../../../ui/GameRoot";
import type { BaseServer } from "../../../Server/BaseServer";
import { type ScriptFilePath, hasScriptExtension, isLegacyScript } from "../../../Paths/ScriptFilePath";
import { type TextFilePath, hasTextExtension } from "../../../Paths/TextFilePath";
import { getGlobbedFileMap } from "../../../Paths/GlobbedFiles";
import { sendDeprecationNotice } from "./deprecation";
import { getFileType, getFileTypeFeature } from "../../../utils/ScriptTransformer";
import { hasContractExtension } from "../../../Paths/ContractFilePath";

import { hasCacheExtension } from "../../../Paths/CacheFilePath";

interface EditorParameters {
  args: (string | number | boolean)[];
  server: BaseServer;
  vim: boolean;
}

function getScriptTemplate(path: string): string {
  if (hasTextExtension(path) || isLegacyScript(path)) {
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

export function commonEditor(command: string, { args, server, vim }: EditorParameters): void {
  if (args.length < 1) return Terminal.error(`Incorrect usage of ${command} command. Usage: ${command} [scriptname]`);
  const files = new Map<ScriptFilePath | TextFilePath, string>();
  let hasLegacyScript = false;
  for (const arg of args) {
    const pattern = String(arg);

    // Glob of existing files
    if (pattern.includes("*") || pattern.includes("?")) {
      const globbedFileMap = getGlobbedFileMap(pattern, server, Terminal.currDir);
      if (globbedFileMap.size === 0) {
        Terminal.error(`No files matching ${pattern}`);
        return;
      }
      for (const [path, file] of globbedFileMap) {
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
      const hint = hasContractExtension(path) || hasCacheExtension(path) ? " (Try using 'run')" : "";
      return Terminal.error(`${command}: Only scripts or text files can be edited. Invalid file type: ${arg}${hint}`);
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
  Router.toPage(Page.ScriptEditor, { files, options: { vim, hostname: server.hostname } });
}
