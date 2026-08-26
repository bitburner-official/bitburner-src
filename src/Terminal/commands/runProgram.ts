import { Terminal } from "../../Terminal";
import { Player } from "@player";
import { BaseServer } from "../../Server/BaseServer";
import { Programs } from "../../Programs/Programs";
import { ProgramFilePath } from "../../Paths/ProgramFilePath";
import { getRecordKeys } from "../../Types/Record";

export function runProgram(path: ProgramFilePath, args: (string | number | boolean)[], server: BaseServer): undefined {
  // Check if you have the program on your computer. If you do, execute it, otherwise
  // display an error message
  const programLowered = path.toLowerCase();
  // Support lowercase even though it's an enum

  const realProgramName = getRecordKeys(Programs).find((name) => name.toLowerCase() === programLowered);
  const programPresentOnServer = server.programs.find((name) => name.toLowerCase() === programLowered);
  if (!realProgramName || (!Player.hasProgram(realProgramName) && !programPresentOnServer)) {
    Terminal.error(
      `没有这样的（js、jsx、ts、tsx、脚本、cct 或 exe）文件！（只能运行家用电脑上已完成的程序，或 ${server.hostname} 上的脚本）`,
    );
    return;
  }
  Programs[realProgramName].run(args.map(String), server);
}
