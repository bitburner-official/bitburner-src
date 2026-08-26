import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";

export function ipaddr(args: (string | number | boolean)[], server: BaseServer): undefined {
  if (args.length !== 0) {
    Terminal.error("ipaddr 命令用法不正确。用法：ipaddr");
    return;
  }
  Terminal.print(server.ip);
}
