import { Terminal } from "../../Terminal";
import { Player } from "@player";
import { BaseServer } from "../../Server/BaseServer";
import { StdIO } from "../StdIO/StdIO";

export function history(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  if (args.length === 0) {
    Terminal.commandHistory.forEach((command, index) => {
      Terminal.print(`${index.toString().padStart(2)} ${command}`, stdIO);
    });
    return;
  }
  const arg = args[0] + "";
  if (arg === "-c" || arg === "--clear") {
    Player.terminalCommandHistory = [];
    Terminal.commandHistory = [];
    Terminal.commandHistoryIndex = 1;
  } else {
    Terminal.fatal("Incorrect usage of history command. usage: history [-c]", stdIO);
  }
}
