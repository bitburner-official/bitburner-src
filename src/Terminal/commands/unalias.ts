import { Terminal } from "../../Terminal";
import { removeAlias, Aliases, GlobalAliases } from "../../Alias";

export function unalias(args: (string | number | boolean)[]): void {
  if (args.length !== 1) {
    Terminal.error("Incorrect usage of unalias name. Usage: unalias [alias] or unalias --all");
    return;
  } else if (args[0] === "--all") {
    for (const alias of Aliases) {
      if (removeAlias(alias[0] + "")) {
        Terminal.print(`Removed alias ${alias[0]}`);
      }
    }
    for (const alias of GlobalAliases) {
      if (removeAlias(alias[0] + "")) {
        Terminal.print(`Removed alias ${alias[0]}`);
      }
    }
  } else if (removeAlias(args[0] + "")) {
    Terminal.print(`Removed alias ${args[0]}`);
  } else {
    Terminal.error(`No such alias exists: ${args[0]}`);
  }
}
