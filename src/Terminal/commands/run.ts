import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { runScript } from "./runScript";
import { runProgram } from "./runProgram";
import { hasScriptExtension, resolveScriptFilePath } from "../../Paths/ScriptFilePath";
import { hasContractExtension, resolveContractFilePath } from "../../Paths/ContractFilePath";

export function run(args: (string | number | boolean)[], server: BaseServer): void {
  // Run a program or a script
  if (args.length < 1) return Terminal.error("Usage: run [program/script] [-t] [num threads] [arg1] [arg2]...");

  const path = String(args[0]);
  if (hasScriptExtension(path)) {
    const scriptPath = resolveScriptFilePath(path, Terminal.currDir);
    if (!scriptPath) return Terminal.error(`Could not resolve script filepath ${path}`);
    args.shift();
    return runScript(scriptPath, args, server);
  } else if (hasContractExtension(path)) {
    const contractPath = resolveContractFilePath(path, Terminal.currDir);
    if (!contractPath) return Terminal.error(`Could not resolve contract filepath ${path}`);
    Terminal.runContract(contractPath);
    return;
  }
  runProgram(args, server);
}
