import { Player } from "@player";
import { CompletedProgramName } from "@enums";
import { Terminal } from "../../Terminal";
import { StdIO } from "../StdIO/StdIO";
import { BaseServer } from "../../Server/BaseServer";

export function scananalyze(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): void {
  if (args.length === 0) {
    Terminal.executeScanAnalyzeCommand(1, false, stdIO);
  } else {
    // # of args must be 2 or 3
    if (args.length > 2) {
      Terminal.error("Incorrect usage of scan-analyze command. usage: scan-analyze [depth]", stdIO);
      return;
    }
    let all = false;
    if (args.length === 2 && args[1] === "-a") {
      all = true;
    }

    const depth = parseInt(args[0] + "");

    if (isNaN(depth) || depth < 0) {
      return Terminal.error("Incorrect usage of scan-analyze command. depth argument must be positive numeric", stdIO);
    }
    if (
      depth > 3 &&
      !Player.hasProgram(CompletedProgramName.deepScan1) &&
      !Player.hasProgram(CompletedProgramName.deepScan2)
    ) {
      return Terminal.error("You cannot scan-analyze with that high of a depth. Maximum depth is 3", stdIO);
    } else if (depth > 5 && !Player.hasProgram(CompletedProgramName.deepScan2)) {
      return Terminal.error("You cannot scan-analyze with that high of a depth. Maximum depth is 5", stdIO);
    } else if (depth > 10) {
      return Terminal.error("You cannot scan-analyze with that high of a depth. Maximum depth is 10", stdIO);
    }
    Terminal.executeScanAnalyzeCommand(depth, all, stdIO);
  }
}
