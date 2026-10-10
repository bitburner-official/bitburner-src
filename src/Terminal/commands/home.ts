import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { StdIO } from "../StdIO/StdIO";

export function home(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  if (args.length !== 0) {
    Terminal.fatal("Incorrect usage of home command. Usage: home", stdIO);
    return;
  }
  Terminal.connectToServer("home");
}
