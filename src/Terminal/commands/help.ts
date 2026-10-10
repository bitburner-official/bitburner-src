import { Terminal } from "../../Terminal";
import { TerminalHelpText, HelpTexts } from "../HelpText";
import { BaseServer } from "../../Server/BaseServer";
import { StdIO } from "../StdIO/StdIO";

export function help(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  if (args.length !== 0 && args.length !== 1) {
    Terminal.fatal("Incorrect usage of help command. Usage: help", stdIO);
    return;
  }
  if (args.length === 0) {
    TerminalHelpText.forEach((line) => Terminal.print(line, stdIO));
  } else {
    const cmd = args[0] + "";
    const txt = HelpTexts[cmd];
    if (txt == null) {
      Terminal.fatal("No help topics match '" + cmd + "'", stdIO);
      return;
    }
    txt.forEach((t) => Terminal.print(t, stdIO));
  }
}
