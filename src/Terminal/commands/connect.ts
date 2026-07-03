import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { GetServer } from "../../Server/AllServers";
import { isImmediatelyReachable } from "../../Server/ServerHelpers";

export function connect(args: (string | number | boolean)[], server: BaseServer): undefined {
  // Disconnect from current server in Terminal and connect to new one
  if (args.length !== 1) {
    Terminal.error("Incorrect usage of connect command. Usage: connect [hostname]");
    return;
  }

  const hostname = String(args[0]);

  const target = GetServer(hostname);
  if (target === null) {
    Terminal.error(`Invalid hostname: '${hostname}'`);
    return;
  }

  // Adjacent servers
  if (isImmediatelyReachable(server.hostname, target.hostname)) {
    Terminal.connectToServer(hostname);
    return;
  }

  /**
   * Backdoored + owned servers (home, private servers, or hacknet servers). With home computer, purchasedByPlayer is
   * true.
   */
  if (target.backdoorInstalled || target.purchasedByPlayer) {
    Terminal.connectToServer(hostname);
    return;
  }

  Terminal.error(
    `Cannot directly connect to ${hostname}. Make sure the server is backdoored or adjacent to your current server`,
  );
}
