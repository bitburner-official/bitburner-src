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
import { RunningScript } from "../../Script/RunningScript";
import { StdIO } from "../StdIO/StdIO";

export function runScript(
  scriptPath: ScriptFilePath,
  commandArgs: (string | number | boolean)[],
  server: BaseServer,
  stdIO: StdIO,
): RunningScript | undefined {
  if (isLegacyScript(scriptPath)) {
    sendDeprecationNotice();
    return;
  }
  const runArgs = { "--tail": Boolean, "-t": Number, "--ram-override": Number, "--temporary": Boolean };
  let flags: {
    _: ScriptArg[];
    "--tail": boolean;
    "-t": string;
    "--ram-override": string;
    "--temporary": boolean;
  };
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    flags = libarg(runArgs, {
      permissive: true,
      argv: commandArgs,
    });
  } catch (error) {
    Terminal.fatal(`Invalid arguments. ${error}.`, stdIO);
    return;
  }
  const tailFlag = flags["--tail"] === true;
  const numThreads = parseFloat(flags["-t"] ?? 1);
  const ramOverride = flags["--ram-override"] != null ? roundToTwo(parseFloat(flags["--ram-override"])) : undefined;
  if (!isPositiveInteger(numThreads)) {
    Terminal.fatal("Invalid number of threads specified. Number of threads must be an integer greater than 0", stdIO);
    return;
  }
  if (ramOverride != null && (isNaN(ramOverride) || ramOverride < RamCostConstants.Base)) {
    Terminal.fatal(
      `Invalid ram override specified. Ram override must be a number greater than ${RamCostConstants.Base}`,
      stdIO,
    );
    return;
  }
  const tempFlag = flags["--temporary"] === true;

  // Todo: Switch out arg for something with typescript support
  const args = flags._;

  const result = createRunningScriptInstance(
    server,
    scriptPath,
    { threads: numThreads, temporary: tempFlag, ramOverride, preventDuplicates: false },
    args,
  );
  if (!result.success) {
    Terminal.fatal(result.message, stdIO);
    return;
  }

  // Able to run script
  const runningScript = result.runningScript;
  runningScript.threads = numThreads;

  const success = startWorkerScript(runningScript, server);
  if (!success) {
    Terminal.fatal(`Failed to start script`, stdIO);
    return;
  }

  Terminal.printAndBypassPipes(
    `Running script with ${pluralize(numThreads, "thread")}, pid ${runningScript.pid} and args: ${JSON.stringify(
      args,
    )}.`,
  );
  if (tailFlag) {
    LogBoxEvents.emit(runningScript);
  }

  Terminal.pidOfLastScriptRun = runningScript.pid;

  // Bind stdio to script
  runningScript.stdin = stdIO.stdin?.deref() ?? null;
  runningScript.terminalStdOut = stdIO;

  // scripts using input from terminal pipes are temporary, to avoid orphaned or partial pipelines on start
  if (runningScript.stdin) {
    runningScript.temporary = true;
  }

  return runningScript;
}
