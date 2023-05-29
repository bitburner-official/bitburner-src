import { BaseServer } from "../../Server/BaseServer";
import { Terminal } from "../../Terminal";

export function lscpu(_args: (string | number | boolean)[], server: BaseServer): void {
  Terminal.print(server.cpuCores + " Core(s)");
}
