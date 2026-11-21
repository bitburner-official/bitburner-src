import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { directoryExistsOnServer, resolveDirectory } from "../../Paths/Directory";

export function cd(args: (string | number | boolean)[], server: BaseServer): undefined {
  if (args.length > 1) {
    Terminal.error("Incorrect number of arguments. Usage: cd [dir]");
    return;
  }
  // If no arg was provided, just use "/".
  const userInput = String(args[0] ?? "/");
  const targetDir = resolveDirectory(userInput, Terminal.currDir);
  // Explicitly checking null due to root being ""
  if (targetDir === null) {
    Terminal.error(`Could not resolve directory ${userInput}`);
    return;
  }
  if (!directoryExistsOnServer(targetDir, server)) {
    Terminal.error(`Directory ${targetDir} does not exist.`);
    return;
  }
  Terminal.setcwd(targetDir);
}
