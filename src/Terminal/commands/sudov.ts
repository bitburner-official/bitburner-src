import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { StdIO } from "../StdIO/StdIO";

export function sudov(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  if (args.length !== 0) {
    Terminal.fatal("Incorrect number of arguments. Usage: sudov", stdIO);
    return;
  }

  if (server.hasAdminRights) {
    Terminal.print("You have ROOT access to this machine", stdIO);
  } else {
    Terminal.print("You do NOT have root access to this machine", stdIO);
  }
}
