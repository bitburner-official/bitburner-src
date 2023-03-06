import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { LogBoxEvents } from "../../ui/React/LogBoxManager";
import { startWorkerScript } from "../../NetscriptWorker";
import { RunningScript } from "../../Script/RunningScript";
import { findRunningScript } from "../../Script/ScriptHelpers";
import * as libarg from "arg";
import { formatRam } from "../../ui/formatNumber";
import { ScriptArg } from "@nsdefs";
import { isPositiveInteger } from "../../types";

export function runScript(commandArgs: (string | number | boolean)[], server: BaseServer): void {
  if (commandArgs.length < 1) {
    Terminal.error(
      `Bug encountered with Terminal.runScript(). Command array has a length of less than 1: ${commandArgs}`,
    );
    return;
  }

  const scriptName = Terminal.getFilepath(commandArgs[0] + "");

  const runArgs = { "--tail": Boolean, "-t": Number };
  const flags = libarg(runArgs, {
    permissive: true,
    argv: commandArgs.slice(1),
  });
  const tailFlag = flags["--tail"] === true;
  const numThreads = parseFloat(flags["-t"] ?? 1);
  if (!isPositiveInteger(numThreads)) {
    return Terminal.error("Invalid number of threads specified. Number of threads must be an integer greater than 0");
  }

  // Todo: Switch out arg for something with typescript support
  const args = flags["_"] as ScriptArg[];

  // Check if this script is already running
  if (findRunningScript(scriptName, args, server) != null) {
    Terminal.error(
      "This script is already running with the same args. Cannot run multiple instances with the same args",
    );
    return;
  }

  // Check if the script exists and if it does run it
  for (let i = 0; i < server.scripts.length; i++) {
    if (server.scripts[i].filename !== scriptName) {
      continue;
    }
    // Check for admin rights and that there is enough RAM available to run
    const script = server.scripts[i];
    script.server = server.hostname;
    const singleRamUsage = script.getRamUsage(server.scripts);
    if (!singleRamUsage) return Terminal.error("Error while calculating ram usage for this script.");
    const ramUsage = singleRamUsage * numThreads;
    const ramAvailable = server.maxRam - server.ramUsed;

    if (!server.hasAdminRights) {
      Terminal.error("Need root access to run script");
      return;
    }

    if (ramUsage > ramAvailable + 0.001) {
      Terminal.error(
        "This machine does not have enough RAM to run this script" +
          (numThreads === 1 ? "" : ` with ${numThreads} threads`) +
          `. Script requires ${formatRam(ramUsage)} of RAM`,
      );
      return;
    }

    // Able to run script
    const runningScript = new RunningScript(script, singleRamUsage, args);
    runningScript.threads = numThreads;

    const success = startWorkerScript(runningScript, server);
    if (!success) {
      Terminal.error(`Failed to start script`);
      return;
    }

    Terminal.print(
      `Running script with ${numThreads} thread(s), pid ${runningScript.pid} and args: ${JSON.stringify(args)}.`,
    );
    if (tailFlag) {
      LogBoxEvents.emit(runningScript);
    }
    return;
  }

  Terminal.error("No such script");
}
