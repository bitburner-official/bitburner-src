import { Terminal } from "../../Terminal";
import { Player } from "@player";
import { BaseServer } from "../../Server/BaseServer";
import { CompletedProgramName, Programs } from "../../Programs/Programs";
import { resolveProgramFilePath } from "../../Paths/ProgramFilePath";

export function runProgram(args: (string | number | boolean)[], server: BaseServer): void {
  if (args.length < 1) return;

  // Check if you have the program on your computer. If you do, execute it, otherwise
  // display an error message
  let programLowered: string = (args.shift() + "").toLowerCase();
  // Allow the player to path to a program if connected to home.
  if (programLowered.includes("/") && Player.getHomeComputer().isConnectedTo) {
    const path = resolveProgramFilePath(programLowered, Terminal.currDir);
    if (path) programLowered = path.toLowerCase();
  }

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
