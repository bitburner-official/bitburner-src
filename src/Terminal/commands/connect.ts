import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { validateConnections } from "../../Server/ServerHelpers";

export function connect(args: (string | number | boolean)[], server: BaseServer): undefined {
  // Disconnect from current server in Terminal and connect to new one
  if (args.length !== 1) {
    Terminal.error("connect 命令用法不正确。用法：connect [hostname]");
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
