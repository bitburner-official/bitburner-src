import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { getServerOnNetwork } from "../../Server/ServerHelpers";
import { IPAddress } from "../../Types/strings";

export function scan(args: (string | number | boolean)[], currServ: BaseServer): undefined {
  if (args.length !== 0) {
    Terminal.error("scan 命令用法不正确。用法：scan");
    return;
  }
  // Displays available network connections using TCP
  const servers = currServ.serversOnNetwork.map((_, i) => {
    const server = getServerOnNetwork(currServ, i);
    if (server === null) throw new Error("Server should not be null");
    return {
      hostname: server.hostname,
      ip: server.ip as IPAddress | "IP",
      hasRoot: server.hasAdminRights ? "是" : "否",
    };
  });
  servers.unshift({
    hostname: "主机名",
    ip: "IP",
    hasRoot: "Root 权限",
  });
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
