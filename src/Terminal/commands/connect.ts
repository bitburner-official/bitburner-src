import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { validateConnections } from "../../Server/ServerHelpers";

export function connect(args: (string | number | boolean)[], server: BaseServer): undefined {
  // Disconnect from current server in Terminal and connect to new one
  if (args.length !== 1) {
    Terminal.error("Incorrect usage of connect command. Usage: connect [hostname]");
    return;
  }

  const hostname = String(args[0]);

  const result = validateConnections(server, [hostname]);
  if (!result.success) {
    Terminal.error(result.message);
    return;
  }
  Terminal.connectToServer(result.destination);
}
