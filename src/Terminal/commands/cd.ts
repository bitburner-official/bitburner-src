import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { directoryExistsOnServer, resolveDirectory } from "../../Paths/Directory";

export function cd(args: (string | number | boolean)[], server: BaseServer): void {
  if (args.length > 1) return Terminal.error("Incorrect number of arguments. Usage: cd [dir]");
  // If no arg was provided, just use "/".
  const userInput = String(args[0] ?? "/");
  const targetDir = resolveDirectory(userInput, Terminal.currDir);
  // Explicitly checking null due to root being ""
  if (targetDir === null) return Terminal.error(`Could not resolve directory ${userInput}`);
  if (!directoryExistsOnServer(targetDir, server)) return Terminal.error(`Directory ${targetDir} does not exist.`);
  Terminal.setcwd(targetDir);
}
