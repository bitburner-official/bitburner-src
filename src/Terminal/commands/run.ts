import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { runScript } from "./runScript";
import { runProgram } from "./runProgram";
import { hasScriptExtension, resolveScriptFilePath } from "../../Paths/ScriptFilePath";

export function run(args: (string | number | boolean)[], server: BaseServer): void {
  // Run a program or a script
  if (args.length < 1) return Terminal.error("Usage: run [program/script] [-t] [num threads] [arg1] [arg2]...");

  const path = String(args[0]);
  if (hasScriptExtension(path)) {
    const scriptPath = resolveScriptFilePath(path, Terminal.currDir);
    if (!scriptPath) return Terminal.error(`Could not parse script filepath ${path}`);
    args.shift();
    return runScript(scriptPath, args, server);
  }
  if (path.endsWith(".cct")) {
    Terminal.runContract(path);
    return;
  }
  runProgram(args, server);
}
