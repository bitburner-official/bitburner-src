import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { StdIO } from "../StdIO/StdIO";

export function lscpu(_args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  Terminal.print(server.cpuCores + " Core(s)", stdIO);
}
