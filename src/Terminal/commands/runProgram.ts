import { Terminal } from "../../Terminal";
import { Player } from "@player";
import { BaseServer } from "../../Server/BaseServer";
import { Programs } from "../../Programs/Programs";
import { ProgramFilePath } from "../../Paths/ProgramFilePath";
import { getRecordKeys } from "../../Types/Record";

export function runProgram(path: ProgramFilePath, args: (string | number | boolean)[], server: BaseServer): void {
  // Check if you have the program on your computer. If you do, execute it, otherwise
  // display an error message
  const programLowered = path.toLowerCase();
  // Support lowercase even though it's an enum

  const realProgramName = getRecordKeys(Programs).find((name) => name.toLowerCase() === programLowered);
  if (!realProgramName || !Player.hasProgram(realProgramName)) {
    Terminal.error(
      `No such (js, jsx, ts, tsx, script, cct, or exe) file! (Only finished programs that exist on your home computer or scripts on ${server.hostname} can be run)`,
    );
    return;
  }
  Programs[realProgramName].run(args.map(String), server);
}
