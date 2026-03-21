import { Terminal } from "../../Terminal";
import { StdIO } from "../StdIO/StdIO";
import { BaseServer } from "../../Server/BaseServer";

export function analyze(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): void {
  if (args.length !== 0) {
    Terminal.fatal("Incorrect usage of analyze command. Usage: analyze", stdIO);
    return;
  }
  Terminal.startAnalyze(stdIO);
}
