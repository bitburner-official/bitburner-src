import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import JSZip from "jszip";
import { root } from "../../Paths/Directory";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { getGlobbedFileMap } from "../../Paths/GlobbedFiles";
import { downloadContentAsFile } from "../../utils/FileUtils";
import { getTerminalStdIO } from "../StdIO/RedirectIO";
import { StdIO } from "../StdIO/StdIO";

// Basic globbing implementation only supporting * and ?. Can be broken out somewhere else later.
export function exportScripts(pattern: string, server: BaseServer, currDir = root): void {
  const zip = new JSZip();

  for (const [name, file] of getGlobbedFileMap(pattern, server, currDir)) {
    zip.file(name, new Blob([file.content], { type: "text/plain" }));
  }

  // Return an error if no files matched, rather than an empty zip folder
  if (Object.keys(zip.files).length == 0) throw new Error(`No files match the pattern ${pattern}`);
  const filename = `bitburner${
    hasScriptExtension(pattern) ? "Scripts" : hasTextExtension(pattern) ? "Texts" : "Files"
  }.zip`;
  zip
    .generateAsync({ type: "blob" })
    .then((content: Blob) => downloadContentAsFile(content, filename))
    .catch((error) => {
      console.error(error);
      Terminal.error(
        `Cannot compress scripts with pattern ${pattern} on ${server.hostname}. Error: ${error}`,
        getTerminalStdIO(),
      );
    });
}

export function download(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  if (args.length !== 1) {
    return Terminal.fatal("Incorrect usage of download command. Usage: download [script/text file]", stdIO);
  }
  const pattern = String(args[0]);
  // If the path contains a * or ?, treat as glob
  if (pattern.includes("*") || pattern.includes("?")) {
    try {
      exportScripts(pattern, server, Terminal.currDir);
      return;
    } catch (error) {
      console.error(error);
      Terminal.fatal(`Cannot export scripts with pattern ${pattern} on ${server.hostname}. Error: ${error}`, stdIO);
      return;
    }
  }
  const path = Terminal.getFilepath(pattern);
  if (!path) return Terminal.fatal(`Could not resolve path ${pattern}`, stdIO);
  if (!hasScriptExtension(path) && !hasTextExtension(path)) {
    return Terminal.fatal("Can only download script and text files", stdIO);
  }
  const file = server.getContentFile(path);
  if (!file) return Terminal.fatal(`File not found: ${path}`, stdIO);
  downloadContentAsFile(file.content, file.filename);
}
