import { Player } from "@player";

import { ProgramFilePath } from "../../Paths/ProgramFilePath";
import { CompletedProgramName, Programs } from "../../Programs/Programs";
import { BaseServer } from "../../Server/BaseServer";
import { Terminal } from "../../Terminal";

export function runProgram(path: ProgramFilePath, args: (string | number | boolean)[], server: BaseServer): void {
  // Check if you have the program on your computer. If you do, execute it, otherwise
  // display an error message
  const programLowered = path.toLowerCase();
  // Support lowercase even though it's an enum

  const realProgramName = Object.values(CompletedProgramName).find((name) => name.toLowerCase() === programLowered);
  if (!realProgramName || !Player.hasProgram(realProgramName)) {
    Terminal.error(
      `No such (exe, script, js, or cct) file! (Only finished programs that exist on your home computer or scripts on ${server.hostname} can be run)`,
    );
    return;
  }
  Programs[realProgramName].run(args.map(String), server);
}
