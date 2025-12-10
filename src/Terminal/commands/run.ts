import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { runScript } from "./runScript";
import { runProgram } from "./runProgram";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasContractExtension } from "../../Paths/ContractFilePath";
import { hasProgramExtension } from "../../Paths/ProgramFilePath";
import { StdIO } from "../StdIO/StdIO";

export function run(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): void {
  // Run a program or a script
  const arg = args.shift();
  if (!arg)
    return Terminal.error(
      "Usage: run [program/script] [-t num_threads] [--tail] [--ram-override ram_in_GBs] [--temporary] [args...]",
      stdIO,
    );

  const path = Terminal.getFilepath(String(arg));
  if (!path) return Terminal.error(`${arg} is not a valid filepath.`, stdIO);
  if (hasScriptExtension(path)) {
    // TODO-Fico: move script tail to here?
    runScript(path, args, server, stdIO);
    return;
  } else if (hasContractExtension(path)) {
    Terminal.runContract(path, stdIO).catch((error) => {
      console.error(error);
      Terminal.error(`Cannot run contract ${path} on ${server.hostname}. Error: ${error}.`, stdIO);
    });
    return;
  } else if (hasProgramExtension(path)) {
    return runProgram(path, args, server, stdIO);
  }
  Terminal.error(`Invalid file extension. Only .js, .jsx, .ts, .tsx, .cct, and .exe files can be run.`, stdIO);
}
