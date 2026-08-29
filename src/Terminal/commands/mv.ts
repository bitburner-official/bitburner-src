import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { StdIO } from "../StdIO/StdIO";

export function mv(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  if (args.length !== 2) {
    Terminal.fatal(`Incorrect number of arguments. Usage: mv [src] [dest]`, stdIO);
    return;
  }
  const [source, destination] = args.map((arg) => arg + "");

  const sourcePath = Terminal.getFilepath(source);
  if (!sourcePath) return Terminal.fatal(`Invalid source filename: ${source}`, stdIO);
  const destinationPath = Terminal.getFilepath(destination);
  if (!destinationPath) return Terminal.fatal(`Invalid destination filename: ${destinationPath}`, stdIO);

  if (
    (!hasScriptExtension(sourcePath) && !hasTextExtension(sourcePath)) ||
    (!hasScriptExtension(destinationPath) && !hasTextExtension(destinationPath))
  ) {
    return Terminal.fatal(
      `'mv' can only be used on scripts (.js, .jsx, .ts, .tsx) and text files (.txt, .json, .css)`,
      stdIO,
    );
  }

  // Allow content to be moved between scripts and textfiles, no need to limit this.
  const sourceContentFile = server.getContentFile(sourcePath);
  if (!sourceContentFile) return Terminal.fatal(`Source file ${sourcePath} does not exist`, stdIO);

  if (!sourceContentFile.deleteFromServer(server)) {
    return Terminal.fatal(
      `Could not remove source file ${sourcePath} from existing location. If ${sourcePath} is a script, make sure that it is NOT running before trying to use 'mv' on it.`,
      stdIO,
    );
  }
  Terminal.print(`Moved ${sourcePath} to ${destinationPath}`, stdIO);
  const { overwritten } = server.writeToContentFile(destinationPath, sourceContentFile.content);
  if (overwritten) Terminal.warn(`${destinationPath} was overwritten.`, stdIO);
}
