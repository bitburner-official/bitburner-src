import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { directoryExistsOnServer, resolveDirectory } from "../../Paths/Directory";
import { StdIO } from "../StdIO/StdIO";

export function cd(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  if (args.length > 1) return Terminal.fatal("Incorrect number of arguments. Usage: cd [dir]", stdIO);
  // If no arg was provided, just use "/".
  const userInput = String(args[0] ?? "/");
  const targetDir = resolveDirectory(userInput, Terminal.currDir);
  // Explicitly checking null due to root being ""
  if (targetDir === null) return Terminal.fatal(`Could not resolve directory ${userInput}`, stdIO);
  if (!directoryExistsOnServer(targetDir, server))
    return Terminal.fatal(`Directory ${targetDir} does not exist.`, stdIO);
  Terminal.setcwd(targetDir);
}
