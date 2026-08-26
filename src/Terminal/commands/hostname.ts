import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";

export function hostname(args: (string | number | boolean)[], server: BaseServer): undefined {
  if (args.length !== 0) {
    Terminal.error("hostname 命令用法不正确。用法：hostname");
    return;
  }
  Terminal.print(server.hostname);
}
