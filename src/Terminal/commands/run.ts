import { hasContractExtension } from "../../Paths/ContractFilePath";
import { hasProgramExtension } from "../../Paths/ProgramFilePath";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { BaseServer } from "../../Server/BaseServer";
import { Terminal } from "../../Terminal";
import { runProgram } from "./runProgram";
import { runScript } from "./runScript";

export function run(args: (string | number | boolean)[], server: BaseServer): void {
  // Run a program or a script
  const arg = args.shift();
  if (!arg) return Terminal.error("Usage: run [program/script] [-t] [num threads] [arg1] [arg2]...");

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
  Terminal.error(`Invalid file extension. Only .js, .script, .cct, and .exe files can be ran.`);
}
