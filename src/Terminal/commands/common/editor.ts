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

export function commonEditor(command: string, { args, server, vim }: EditorParameters, allowZeroFiles = false): void {
  if (args.length < 1 && !allowZeroFiles) {
    return Terminal.error(`${command} 命令用法不正确。用法：${command} [scriptname]`);
  }
  const files = new Map<ScriptFilePath | TextFilePath, string>();
  let hasLegacyScript = false;
  for (const arg of args) {
    const pattern = String(arg);

    // Glob of existing files
    if (pattern.includes("*") || pattern.includes("?")) {
      const globbedFileMap = getGlobbedFileMap(pattern, server, Terminal.currDir);
      if (globbedFileMap.size === 0) {
        Terminal.error(`没有匹配 ${pattern} 的文件`);
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
    if (!path) return Terminal.error(`无效的文件路径 ${arg}`);
    if (!hasScriptExtension(path) && !hasTextExtension(path)) {
      const hint = hasContractExtension(path) || hasCacheExtension(path) ? " （请尝试使用 'run'）" : "";
      return Terminal.error(`${command}：只能编辑脚本或文本文件。无效的文件类型：${arg}${hint}`);
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
