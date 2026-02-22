import { Player } from "@player";
import { CompletedProgramName } from "@enums";
import { Terminal } from "../../Terminal";

export function scananalyze(args: (string | number | boolean)[]): void {
  if (args.length === 0) {
    Terminal.executeScanAnalyzeCommand();
  } else {
    // # of args must be 2 or 3
    if (args.length > 2) {
      Terminal.error("Incorrect usage of scan-analyze command. usage: scan-analyze [depth]");
      return;
    }
    let all = false;
    if (args.length === 2 && args[1] === "-a") {
      all = true;
    }

    const depth = parseInt(args[0] + "");

    if (isNaN(depth) || depth < 0) {
      return Terminal.error("Incorrect usage of scan-analyze command. depth argument must be positive numeric");
    }
    if (
      depth > 3 &&
      !Player.hasProgram(CompletedProgramName.deepScan1) &&
      !Player.hasProgram(CompletedProgramName.deepScan2)
    ) {
      return Terminal.error("You cannot scan-analyze with that high of a depth. Maximum depth is 3");
    } else if (depth > 5 && !Player.hasProgram(CompletedProgramName.deepScan2)) {
      return Terminal.error("You cannot scan-analyze with that high of a depth. Maximum depth is 5");
    } else if (depth > 10) {
      return Terminal.error("You cannot scan-analyze with that high of a depth. Maximum depth is 10");
    }
    Terminal.executeScanAnalyzeCommand(depth, all);
  }
}
