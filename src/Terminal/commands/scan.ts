import { Terminal } from "../../Terminal";
import type { BaseServer } from "../../Server/BaseServer";
import { GetServer } from "../../Server/AllServers";
import { exceptionAlert } from "../../utils/helpers/exceptionAlert";

export function scan(args: (string | number | boolean)[], currServ: BaseServer): undefined {
  if (args.length !== 0) {
    Terminal.error("Incorrect usage of scan command. Usage: scan");
    return;
  }
  const servers = [
    {
      hostname: "Hostname",
      ip: "IP",
      hasRoot: "Root Access",
    },
  ];
  for (const neighborHostname of currServ.serversOnNetwork) {
    const neighborServer = GetServer(neighborHostname);
    if (neighborServer === null) {
      exceptionAlert(
        new Error(`${neighborHostname} is on the network of ${currServ.hostname}, but we cannot find its data`),
      );
      continue;
    }
    servers.push({
      hostname: neighborServer.hostname,
      ip: neighborServer.ip,
      hasRoot: neighborServer.hasAdminRights ? "Y" : "N",
    });
  }
  const maxHostname = Math.max(...servers.map((s) => s.hostname.length));
  const maxIP = Math.max(...servers.map((s) => s.ip.length));
  for (const server of servers) {
    if (!server) continue;
    let entry = server.hostname;
    entry += " ".repeat(maxHostname - server.hostname.length + 1);
    entry += server.ip;
    entry += " ".repeat(maxIP - server.ip.length + 1);
    entry += server.hasRoot;
    Terminal.print(entry);
  }
}
