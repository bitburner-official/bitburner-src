import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { LogBoxEvents } from "../../ui/React/LogBoxManager";
import { createRunningScriptInstance, startWorkerScript } from "../../NetscriptWorker";
import libarg from "arg";
import { ScriptArg } from "@nsdefs";
import { isPositiveInteger } from "../../types";
import { ScriptFilePath, isLegacyScript } from "../../Paths/ScriptFilePath";
import { sendDeprecationNotice } from "./common/deprecation";
import { roundToTwo } from "../../utils/helpers/roundToTwo";
import { RamCostConstants } from "../../Netscript/RamCostGenerator";
import { pluralize } from "../../utils/I18nUtils";

export function runScript(
  scriptPath: ScriptFilePath,
  commandArgs: (string | number | boolean)[],
  server: BaseServer,
): void {
  if (isLegacyScript(scriptPath)) {
    sendDeprecationNotice();
    return;
  }
  const runArgs = { "--tail": Boolean, "-t": Number, "--ram-override": Number };
  let flags: {
    _: ScriptArg[];
    "--tail": boolean;
    "-t": string;
    "--ram-override": string;
  };
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    flags = libarg(runArgs, {
      permissive: true,
      argv: commandArgs,
    });
  } catch (error) {
    Terminal.error(`Invalid arguments. ${error}.`);
    return;
  }
  const tailFlag = flags["--tail"] === true;
  const numThreads = parseFloat(flags["-t"] ?? 1);
  const ramOverride = flags["--ram-override"] != null ? roundToTwo(parseFloat(flags["--ram-override"])) : null;
  if (!isPositiveInteger(numThreads)) {
    return Terminal.error("Invalid number of threads specified. Number of threads must be an integer greater than 0");
  }
  if (ramOverride != null && (isNaN(ramOverride) || ramOverride < RamCostConstants.Base)) {
    Terminal.error(
      `Invalid ram override specified. Ram override must be a number greater than ${RamCostConstants.Base}`,
    );
    return;
  }

  // Todo: Switch out arg for something with typescript support
  const args = flags._;

  const result = createRunningScriptInstance(server, scriptPath, ramOverride, numThreads, args);
  if (!result.success) {
    Terminal.error(result.message);
    return;
  }

  // Able to run script
  const runningScript = result.runningScript;
  runningScript.threads = numThreads;

  const success = startWorkerScript(runningScript, server);
  if (!success) {
    Terminal.error(`Failed to start script`);
    return;
  }

  Terminal.print(
    `Running script with ${pluralize(numThreads, "thread")}, pid ${runningScript.pid} and args: ${JSON.stringify(
      args,
    )}.`,
  );
  if (tailFlag) {
    LogBoxEvents.emit(runningScript);
  }
  return;
}
