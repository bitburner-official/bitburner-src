import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";

export function mv(args: (string | number | boolean)[], server: BaseServer): undefined {
  if (args.length !== 2) {
    Terminal.error(`Incorrect number of arguments. Usage: mv [src] [dest]`);
    return;
  }
  const [source, destination] = args.map((arg) => arg + "");

  const sourcePath = Terminal.getFilepath(source);
  if (!sourcePath) {
    Terminal.error(`Invalid source filename: ${source}`);
    return;
  }
  const destinationPath = Terminal.getFilepath(destination);
  if (!destinationPath) {
    Terminal.error(`Invalid destination filename: ${destinationPath}`);
    return;
  }

  if (
    (!hasScriptExtension(sourcePath) && !hasTextExtension(sourcePath)) ||
    (!hasScriptExtension(destinationPath) && !hasTextExtension(destinationPath))
  ) {
    Terminal.error(`'mv' can only be used on scripts (.js, .jsx, .ts, .tsx) and text files (.txt, .json, .css)`);
    return;
  }

  // Allow content to be moved between scripts and textfiles, no need to limit this.
  const sourceContentFile = server.getContentFile(sourcePath);
  if (!sourceContentFile) {
    Terminal.error(`Source file ${sourcePath} does not exist`);
    return;
  }

  if (!sourceContentFile.deleteFromServer(server)) {
    Terminal.error(
      `Could not remove source file ${sourcePath} from existing location. If ${sourcePath} is a script, make sure that it is NOT running before trying to use 'mv' on it.`,
    );
    return;
  }
  Terminal.print(`Moved ${sourcePath} to ${destinationPath}`);
  const { overwritten } = server.writeToContentFile(destinationPath, sourceContentFile.content);
  if (overwritten) Terminal.warn(`${destinationPath} was overwritten.`);
}
