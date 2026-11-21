import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { combinePath, getFilenameOnly } from "../../Paths/FilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";

export function cp(args: (string | number | boolean)[], server: BaseServer): undefined {
  if (args.length !== 2) {
    Terminal.error("Incorrect usage of cp command. Usage: cp [source filename] [destination]");
    return;
  }
  // Find the source file
  const sourceFilePath = Terminal.getFilepath(String(args[0]));
  if (!sourceFilePath) {
    Terminal.error(`Invalid source filename ${args[0]}`);
    return;
  }
  if (!hasTextExtension(sourceFilePath) && !hasScriptExtension(sourceFilePath)) {
    Terminal.error("cp: Can only be performed on script and text files");
    return;
  }
  const source = server.getContentFile(sourceFilePath);
  if (!source) {
    Terminal.error(`File not found: ${sourceFilePath}`);
    return;
  }

  // Determine the destination file path.
  const destinationInput = String(args[1]);
  // First treat the input as a file path. If that fails, try treating it as a directory and reusing source filename.
  let destFilePath = Terminal.getFilepath(destinationInput);
  if (!destFilePath) {
    const destDirectory = Terminal.getDirectory(destinationInput);
    if (!destDirectory) {
      Terminal.error(`Could not resolve ${destinationInput} as a FilePath or Directory`);
      return;
    }
    destFilePath = combinePath(destDirectory, getFilenameOnly(sourceFilePath));
  }
  if (!hasTextExtension(destFilePath) && !hasScriptExtension(destFilePath)) {
    Terminal.error(`cp: Can only copy to script and text files (${destFilePath} is invalid destination)`);
    return;
  }

  const result = server.writeToContentFile(destFilePath, source.content);
  Terminal.print(`File ${sourceFilePath} copied to ${destFilePath}`);
  if (result.overwritten) Terminal.warn(`${destFilePath} was overwritten.`);
}
