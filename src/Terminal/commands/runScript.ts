import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { LogBoxEvents } from "../../ui/React/LogBoxManager";
import { startWorkerScript } from "../../NetscriptWorker";
import { RunningScript } from "../../Script/RunningScript";
import libarg from "arg";
import { formatRam } from "../../ui/formatNumber";
import { ScriptArg } from "@nsdefs";
import { isPositiveInteger } from "../../types";
import { ScriptFilePath, isLegacyScript } from "../../Paths/ScriptFilePath";
import { sendDeprecationNotice } from "./common/deprecation";
import { roundToTwo } from "../../utils/helpers/roundToTwo";
import { RamCostConstants } from "../../Netscript/RamCostGenerator";

export function runScript(path: ScriptFilePath, commandArgs: (string | number | boolean)[], server: BaseServer): void {
  // This takes in the absolute filepath, see "run.ts"
  const script = server.scripts.get(path);
  if (!script) return Terminal.error(`Script ${path} does not exist on this server.`);

  const runArgs = { "--tail": Boolean, "-t": Number, "--ram-override": Number };
  const flags = libarg(runArgs, {
    permissive: true,
    argv: commandArgs,
  });
  const tailFlag = flags["--tail"] === true;
  const numThreads = parseFloat(flags["-t"] ?? 1);
  const ramOverride = flags["--ram-override"] != null ? roundToTwo(parseFloat(flags["--ram-override"])) : null;
  if (!isPositiveInteger(numThreads)) {
    return Terminal.error("Invalid number of threads specified. Number of threads must be an integer greater than 0");
  }
  if (ramOverride != null && (isNaN(ramOverride) || ramOverride < RamCostConstants.Base)) {
    return Terminal.error(
      `Invalid ram override specified. Ram override must be a number greater than ${RamCostConstants.Base}`,
    );
  }
  if (!server.hasAdminRights) return Terminal.error("Need root access to run script");

  // Todo: Switch out arg for something with typescript support
  const args = flags._ as ScriptArg[];

  const singleRamUsage = ramOverride ?? script.getRamUsage(server.scripts);
  if (!singleRamUsage) {
    return Terminal.error(`Error while calculating ram usage for this script. ${script.ramCalculationError}`);
  }

  const ramUsage = singleRamUsage * numThreads;
  const ramAvailable = server.maxRam - server.ramUsed;

  if (ramUsage > ramAvailable + 0.001) {
    return Terminal.error(
      "This machine does not have enough RAM to run this script" +
        (numThreads === 1 ? "" : ` with ${numThreads} threads`) +
        `. Script requires ${formatRam(ramUsage)} of RAM`,
    );
  }

  // Able to run script
  const runningScript = new RunningScript(script, singleRamUsage, args);
  runningScript.threads = numThreads;

  const success = startWorkerScript(runningScript, server);
  if (!success) return Terminal.error(`Failed to start script`);

  if (isLegacyScript(path)) {
    sendDeprecationNotice();
  }
  Terminal.print(
    `Running script with ${numThreads} thread(s), pid ${runningScript.pid} and args: ${JSON.stringify(args)}.`,
  );
  if (tailFlag) {
    LogBoxEvents.emit(runningScript);
  }
  return;
}
