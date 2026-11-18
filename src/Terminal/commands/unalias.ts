import { Terminal } from "../../Terminal";
import { removeAlias, Aliases, GlobalAliases } from "../../Alias";
import { BaseServer } from "../../Server/BaseServer";
import { StdIO } from "../StdIO/StdIO";

export function unalias(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  if (args.length !== 1) {
    Terminal.fatal("Incorrect usage of unalias name. Usage: unalias [alias] or unalias --all", stdIO);
    return;
  } else if (args[0] === "--all") {
    for (const alias of Aliases) {
      if (removeAlias(alias[0] + "")) {
        Terminal.printAndBypassPipes(`Removed alias ${alias[0]}`);
      }
    }
    for (const alias of GlobalAliases) {
      if (removeAlias(alias[0] + "")) {
        Terminal.printAndBypassPipes(`Removed alias ${alias[0]}`);
      }
    }
  } else if (removeAlias(args[0] + "")) {
    Terminal.printAndBypassPipes(`Removed alias ${args[0]}`);
  } else {
    Terminal.fatal(`No such alias exists: ${args[0]}`, stdIO);
  }
}
