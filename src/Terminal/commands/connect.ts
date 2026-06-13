import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { getServerOnNetwork } from "../../Server/ServerHelpers";
import { GetServer } from "../../Server/AllServers";
import { exceptionAlert } from "../../utils/helpers/exceptionAlert";
import { StdIO } from "../StdIO/StdIO";

export function connect(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  // Disconnect from current server in Terminal and connect to new one
  if (args.length !== 1) {
    Terminal.fatal("Incorrect usage of connect command. Usage: connect [hostname]", stdIO);
    return;
  }

  const hostname = String(args[0]);

  const target = GetServer(hostname);
  if (target === null) {
    Terminal.fatal(`Invalid hostname: '${hostname}'`, stdIO);
    return;
  }

  // Adjacent servers
  for (let i = 0; i < server.serversOnNetwork.length; i++) {
    const other = getServerOnNetwork(server, i);
    if (other === null) {
      exceptionAlert(
        new Error(
          `${server.serversOnNetwork[i]} is on the network of ${server.hostname}, but we cannot find its data.`,
        ),
      );
      return;
    }
    if (other.hostname === target.hostname) {
      Terminal.connectToServer(hostname);
      return;
    }
  }

  /**
   * Backdoored + owned servers (home, private servers, or hacknet servers). With home computer, purchasedByPlayer is
   * true.
   */
  if (target.backdoorInstalled || target.purchasedByPlayer) {
    Terminal.connectToServer(hostname);
    return;
  }

  Terminal.fatal(
    `Cannot directly connect to ${hostname}. Make sure the server is backdoored or adjacent to your current server`,
    stdIO,
  );
}
