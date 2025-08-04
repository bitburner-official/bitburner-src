import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";

export function mv(args: (string | number | boolean)[], server: BaseServer): void {
  if (args.length !== 2) {
    Terminal.error(`Incorrect number of arguments. Usage: mv [src] [dest]`);
    return;
  }
  const [source, destination] = args.map((arg) => arg + "");

  const sourcePath = Terminal.getFilepath(source);
  if (!sourcePath) return Terminal.error(`Invalid source filename: ${source}`);
  const destinationPath = Terminal.getFilepath(destination);
  if (!destinationPath) return Terminal.error(`Invalid destination filename: ${destinationPath}`);

  if (
    (!hasScriptExtension(sourcePath) && !hasTextExtension(sourcePath)) ||
    (!hasScriptExtension(destinationPath) && !hasTextExtension(destinationPath))
  ) {
    return Terminal.error(`'mv' can only be used on scripts (.js, .jsx, .ts, .tsx) and text files (.txt, .json)`);
  }

  // Allow content to be moved between scripts and textfiles, no need to limit this.
  const sourceContentFile = server.getContentFile(sourcePath);
  if (!sourceContentFile) return Terminal.error(`Source file ${sourcePath} does not exist`);

  if (!sourceContentFile.deleteFromServer(server)) {
    return Terminal.error(
      `Could not remove source file ${sourcePath} from existing location. If ${sourcePath} is a script, make sure that it is NOT running before trying to use 'mv' on it.`,
    );
  }
  Terminal.print(`Moved ${sourcePath} to ${destinationPath}`);
  const { overwritten } = server.writeToContentFile(destinationPath, sourceContentFile.content);
  if (overwritten) Terminal.warn(`${destinationPath} was overwritten.`);
}
