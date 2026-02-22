import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { StdIO } from "../StdIO/StdIO";

export function ipaddr(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): void {
  if (args.length !== 0) {
    Terminal.error("Incorrect usage of hostname command. Usage: ipaddr", stdIO);
    return;
  }
  Terminal.print(server.ip, stdIO);
}
