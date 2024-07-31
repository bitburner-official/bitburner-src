import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import JSZip from "jszip";
import { root } from "../../Paths/Directory";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { getGlobbedFileMap } from "../../Paths/ListFiles";
import { downloadContentAsFile } from "../../utils/FileUtils";

// Basic globbing implementation only supporting * and ?. Can be broken out somewhere else later.
export function exportScripts(pattern: string, server: BaseServer, currDir = root): void {
  const zip = new JSZip();

  for (const [name, file] of getGlobbedFileMap(pattern, server, currDir)) {
    zip.file(name, new Blob([file.content], { type: "text/plain" }));
  }

  // Return an error if no files matched, rather than an empty zip folder
  if (Object.keys(zip.files).length == 0) throw new Error(`No files match the pattern ${pattern}`);
  const filename = `bitburner${
    hasScriptExtension(pattern) ? "Scripts" : pattern.endsWith(".txt") ? "Texts" : "Files"
  }.zip`;
  zip.generateAsync({ type: "blob" }).then((content: Blob) => downloadContentAsFile(content, filename));
}

export function download(args: (string | number | boolean)[], server: BaseServer): void {
  if (args.length !== 1) {
    return Terminal.error("Incorrect usage of download command. Usage: download [script/text file]");
  }
  const pattern = String(args[0]);
  // If the path contains a * or ?, treat as glob
  if (pattern.includes("*") || pattern.includes("?")) {
    try {
      exportScripts(pattern, server, Terminal.currDir);
      return;
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      return Terminal.error(msg);
    }
  }
  const path = Terminal.getFilepath(pattern);
  if (!path) return Terminal.error(`Could not resolve path ${pattern}`);
  if (!hasScriptExtension(path) && !hasTextExtension(path)) {
    return Terminal.error("Can only download script and text files");
  }
  const file = server.getContentFile(path);
  if (!file) return Terminal.error(`File not found: ${path}`);
  return downloadContentAsFile(file.content, file.filename);
}
