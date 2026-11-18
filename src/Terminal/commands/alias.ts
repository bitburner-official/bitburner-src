import { Terminal } from "../../Terminal";
import { parseAliasDeclaration, printAliases } from "../../Alias";
import { BaseServer } from "../../Server/BaseServer";
import { StdIO } from "../StdIO/StdIO";

export function alias(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  if (args.length === 0) {
    printAliases(stdIO);
    return;
  }
  if (args[0] === "--all") {
    Terminal.fatal(`--all is reserved for removal`, stdIO);
    return;
  }
  if (args.length === 1) {
    if (parseAliasDeclaration(args[0] + "")) {
      Terminal.printAndBypassPipes(`Set alias ${args[0]}`);
      return;
    }
  }
  if (args.length === 2) {
    if (args[0] === "-g") {
      if (parseAliasDeclaration(args[1] + "", true)) {
        Terminal.printAndBypassPipes(`Set global alias ${args[1]}`);
        return;
      }
    }
  }
  Terminal.fatal('Incorrect usage of alias command. Usage: alias [-g] [aliasname="value"]', stdIO);
}
