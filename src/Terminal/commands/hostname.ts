import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { StdIO } from "../StdIO/StdIO";

export function hostname(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  if (args.length !== 0) {
    Terminal.fatal("Incorrect usage of hostname command. Usage: hostname", stdIO);
    return;
  }
  Terminal.print(server.hostname, stdIO);
}
