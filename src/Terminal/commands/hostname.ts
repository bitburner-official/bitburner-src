import { BaseServer } from "../../Server/BaseServer";
import { Terminal } from "../../Terminal";

export function hostname(args: (string | number | boolean)[], server: BaseServer): void {
  if (args.length !== 0) {
    Terminal.error("Incorrect usage of hostname command. Usage: hostname");
    return;
  }
  Terminal.print(server.hostname);
}
