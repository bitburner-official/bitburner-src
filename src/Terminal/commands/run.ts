import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { runScript } from "./runScript";
import { runProgram } from "./runProgram";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasContractExtension } from "../../Paths/ContractFilePath";
import { hasProgramExtension } from "../../Paths/ProgramFilePath";

export function run(args: (string | number | boolean)[], server: BaseServer): void {
  // Run a program or a script
  const arg = args.shift();
  if (!arg)
    return Terminal.error(
      "Usage: run [program/script] [-t num_threads] [--tail] [--ram-override ram_in_GBs] [args...]",
    );

  const path = Terminal.getFilepath(String(arg));
  if (!path) return Terminal.error(`${arg} is not a valid filepath.`);
  if (hasScriptExtension(path)) {
    return runScript(path, args, server);
  } else if (hasContractExtension(path)) {
    Terminal.runContract(path);
    return;
  } else if (hasProgramExtension(path)) {
    return runProgram(path, args, server);
  }
  Terminal.error(`Invalid file extension. Only .js, .jsx, .ts, .tsx, .script, .cct, and .exe files can be run.`);
}
