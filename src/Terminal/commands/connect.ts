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

  switch (result.status) {
    case "server not found":
      Terminal.error(`Invalid hostname: '${hostname}'`);
      return;
    case "no connection":
      Terminal.error(
        `Cannot directly connect to ${hostname}. Make sure the server is backdoored or adjacent to your current server`,
      );
      return;
    case "ok":
      Terminal.connectToServer(hostname);
      return;
    default: {
      const __s: never = result;
    }
  }
}
