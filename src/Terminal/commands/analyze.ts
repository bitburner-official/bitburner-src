import { Terminal } from "../../Terminal";
import type { TerminalAction } from "../TerminalAction";

export function analyze(args: (string | number | boolean)[]): undefined | TerminalAction {
  if (args.length !== 0) {
    Terminal.error("Incorrect usage of analyze command. Usage: analyze");
    return;
  }
  return Terminal.startAnalyze();
}
