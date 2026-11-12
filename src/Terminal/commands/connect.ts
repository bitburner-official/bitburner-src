import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { StdIO } from "../StdIO/StdIO";
import { validateConnections } from "../../Server/ServerHelpers";

export function connect(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  // Disconnect from current server in Terminal and connect to new one
  if (args.length !== 1) {
    Terminal.fatal("Incorrect usage of connect command. Usage: connect [hostname]", stdIO);
    return;
  }

  const hostname = String(args[0]);

  const result = validateConnections(server, [hostname]);
  if (!result.success) {
    Terminal.fatal(result.message, stdIO);
    return;
  }
  Terminal.connectToServer(result.destination);
}
