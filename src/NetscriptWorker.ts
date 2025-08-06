/**
 * Functions for handling WorkerScripts, which are the underlying mechanism
 * that allows for scripts to run
 */
import { killWorkerScript } from "./Netscript/killWorkerScript";
import { ScriptDeath } from "./Netscript/ScriptDeath";
import { WorkerScript } from "./Netscript/WorkerScript";
import { workerScripts } from "./Netscript/WorkerScripts";
import { generateNextPid } from "./Netscript/Pid";

import { CONSTANTS } from "./Constants";
import { NetscriptFunctions } from "./NetscriptFunctions";
import { compile } from "./NetscriptJSEvaluator";
import { Port, PortNumber } from "./NetscriptPort";
import { RunningScript } from "./Script/RunningScript";
import { scriptCalculateOfflineProduction } from "./Script/ScriptHelpers";
import { GetAllServers } from "./Server/AllServers";
import { BaseServer } from "./Server/BaseServer";
import { Settings } from "./Settings/Settings";

import { dialogBoxCreate } from "./ui/React/DialogBox";
import { formatRam } from "./ui/formatNumber";
import { arrayToString } from "./utils/helpers/ArrayHelpers";
import { roundToTwo } from "./utils/helpers/roundToTwo";

import { parseCommand } from "./Terminal/Parser";
import { Terminal } from "./Terminal";
import { ScriptArg } from "@nsdefs";
import { CompleteRunOptions, getRunningScriptsByArgs } from "./Netscript/NetscriptHelpers";
import { handleUnknownError } from "./utils/ErrorHandler";
import { isLegacyScript, resolveScriptFilePath, ScriptFilePath } from "./Paths/ScriptFilePath";
import { Player } from "@player";
import { UIEventEmitter, UIEventType } from "./ui/UIEventEmitter";
import { getErrorMessageWithStackAndCause } from "./utils/ErrorHelper";
import { exceptionAlert } from "./utils/helpers/exceptionAlert";
import { Result } from "./types";

export const NetscriptPorts = new Map<PortNumber, Port>();

export function prestigeWorkerScripts(): void {
  for (const ws of workerScripts.values()) {
    killWorkerScript(ws);
  }

  NetscriptPorts.clear();
}

async function startNetscript2Script(workerScript: WorkerScript): Promise<void> {
  const scripts = workerScript.getServer().scripts;
  const script = workerScript.getScript();
  if (!script) throw "workerScript had no associated script. This is a bug.";
  const ns = workerScript.env.vars;
  if (!ns) throw `${script.filename} cannot be run because the NS object hasn't been constructed properly.`;

  const loadedModule = await compile(script, scripts);

  // if for whatever reason the stopFlag is already set we abort
  if (workerScript.env.stopFlag) return;

  if (!loadedModule) throw `${script.filename} cannot be run because the script module won't load`;
  const mainFunc = loadedModule.main;
  // TODO unplanned: Better error for "unexpected reserved word" when using await in non-async function?
  if (typeof mainFunc !== "function")
    throw `${script.filename} cannot be run because it does not have a main function.`;
  // Explicitly called from a variable so that we don't bind "this".
  await mainFunc(ns);
}

/**
 * Used to start a RunningScript (by creating and starting its
 * corresponding WorkerScript), and add the RunningScript to the server on which
 * it is active
 */
export function startWorkerScript(runningScript: RunningScript, server: BaseServer, parent?: WorkerScript): number {
  if (server.hostname !== runningScript.server) {
    // Temporarily adding a check here to see if this ever triggers
    exceptionAlert(
      new Error(
        `Tried to launch a worker script on a different server ${server.hostname} than the runningScript's server ${runningScript.server}`,
      ),
      true,
    );
    return 0;
  }
  if (createAndAddWorkerScript(runningScript, server, parent)) {
    // Push onto runningScripts.
    // This has to come after createAndAddWorkerScript() because that fn updates RAM usage
    server.runScript(runningScript);

    // Once the WorkerScript is constructed in createAndAddWorkerScript(), the RunningScript
    // object should have a PID assigned to it, so we return that
    return runningScript.pid;
  }

  return 0;
}

/**
 * Given a RunningScript object, constructs its corresponding WorkerScript,
 * adds it to the global 'workerScripts' pool, and begins executing it.
 * @param {RunningScript} runningScriptObj - Script that's being run
 * @param {Server} server - Server on which the script is to be run
 * returns {boolean} indicating whether or not the workerScript was successfully added
 */
function createAndAddWorkerScript(runningScriptObj: RunningScript, server: BaseServer, parent?: WorkerScript): boolean {
  if (isLegacyScript(runningScriptObj.filename)) {
    deferredError(`Running .script files is unsupported.`);
    return false;
  }
  const ramUsage = roundToTwo(runningScriptObj.ramUsage * runningScriptObj.threads);
  const ramAvailable = server.maxRam - server.ramUsed;
  // Check failure conditions before generating the workersScript and return false
  if (ramUsage > ramAvailable + 0.001) {
    deferredError(
      `Not enough RAM to run script ${runningScriptObj.filename} with args ${arrayToString(
        runningScriptObj.args,
      )}, needed ${formatRam(ramUsage)} but only have ${formatRam(ramAvailable)} free
If you are seeing this on startup, likely causes are that the autoexec script is too big to fit in RAM, or it took up too much space and other previously running scripts couldn't fit on home.
Otherwise, this can also occur if you have attempted to launch a script from a tail window with insufficient RAM.`,
    );
    return false;
  }

  // Get the pid
  const pid = generateNextPid();
  if (pid === -1) {
    deferredError(
      `Failed to start script because could not find available PID. This is most ` +
        `because you have too many scripts running.`,
    );
    return false;
  }

  server.updateRamUsed(roundToTwo(server.ramUsed + ramUsage));

  // Create the WorkerScript. NOTE: WorkerScript ctor will set the underlying
  // RunningScript's PID as well
  const workerScript = new WorkerScript(runningScriptObj, pid, NetscriptFunctions);

  // Add the WorkerScript to the global pool
  workerScripts.set(pid, workerScript);

  // Start the script's execution using the correct function for file type
  startNetscript2Script(workerScript)
    // Once the code finishes (either resolved or rejected, doesn't matter), set its
    // running status to false
    .then(function () {
      killWorkerScript(workerScript);
      workerScript.log("", () => "Script finished running");
    })
    .catch(function (error) {
      handleUnknownError(error, workerScript);
      killWorkerScript(workerScript);
      workerScript.log("", () =>
        error instanceof ScriptDeath
          ? "main() terminated."
          : getErrorMessageWithStackAndCause(error, "Script crashed due to an error: "),
      );
    })
    .finally(() => {
      // The earnings are transferred to the parent if it still exists.
      if (parent && !parent.env.stopFlag) {
        parent.scriptRef.onlineExpGained += runningScriptObj.onlineExpGained;
        parent.scriptRef.onlineMoneyMade += runningScriptObj.onlineMoneyMade;
      }
    });
  return true;
}

/** Updates the online running time stat of all running scripts */
export function updateOnlineScriptTimes(numCycles = 1): void {
  const time = (numCycles * CONSTANTS.MilliPerCycle) / 1000; //seconds
  for (const ws of workerScripts.values()) {
    ws.scriptRef.onlineRunningTime += time;
  }
}

// Needed for popping dialog boxes in functions that run *before* the UI is
// created, and thus before AlertManager exists to listen to the alerts we
// create.
function deferredError(msg: string) {
  setTimeout(() => dialogBoxCreate(msg), 0);
}

function createAutoexec(server: BaseServer): RunningScript | null {
  const args = parseCommand(Settings.AutoexecScript);
  if (args.length === 0) return null;

  const cmd = String(args[0]);
  const scriptPath = resolveScriptFilePath(cmd);
  if (!scriptPath) {
    deferredError(`While running autoexec script:
"${cmd}" is invalid for a script name (maybe missing suffix?)`);
    return null;
  }
  const script = server.scripts.get(scriptPath);
  if (!script) {
    deferredError(`While running autoexec script:
"${cmd}" does not exist!`);
    return null;
  }
  const ramUsage = script.getRamUsage(server.scripts);
  if (ramUsage === null) {
    deferredError(`While running autoexec script:
"${cmd}" has errors!`);
    return null;
  }
  args.shift();
  const rs = new RunningScript(script, ramUsage, args);
  rs.temporary = true;
  return rs;
}

/**
 * Called when the game is loaded. Loads all running scripts (from all servers)
 * into worker scripts so that they will start running
 */
export function loadAllRunningScripts(): void {
  /**
   * While loading the save data, the game engine calls this function to load all running scripts. With each script, we
   * calculate the offline data, so we need the current "lastUpdate" and "playtimeSinceLastAug" from the save data.
   * After the main UI is loaded and the logic of this function starts executing, those info in the Player object might be
   * overwritten, so we need to save them here and use them later in "scriptCalculateOfflineProduction".
   */
  const playerLastUpdate = Player.lastUpdate;
  const playerPlaytimeSinceLastAug = Player.playtimeSinceLastAug;
  const unsubscribe = UIEventEmitter.subscribe((event) => {
    if (event !== UIEventType.MainUILoaded) {
      return;
    }
    unsubscribe();
    /**
     * Accept all parameters containing "?noscript". The "standard" parameter is "?noScripts", but new players may not
     * notice the "s" character at the end of "noScripts".
     */
    const skipScriptLoad = window.location.href.toLowerCase().includes("?noscript");
    if (skipScriptLoad) {
      Terminal.warn("Skipped loading player scripts during startup");
      console.info("Skipping the load of any scripts during startup");
    }
    for (const server of GetAllServers()) {
      // Reset each server's RAM usage to 0
      server.ramUsed = 0;

      const rsList = server.savedScripts;
      server.savedScripts = undefined;
      if (skipScriptLoad || !rsList) {
        // Start game with no scripts
        continue;
      }
      if (server.hostname === "home") {
        // Push autoexec script onto the front of the list
        const runningScript = createAutoexec(server);
        if (runningScript) {
          rsList.unshift(runningScript);
        }
      }
      for (const runningScript of rsList) {
        startWorkerScript(runningScript, server);
        scriptCalculateOfflineProduction(runningScript, playerLastUpdate, playerPlaytimeSinceLastAug);
      }
    }
  });
}

export function createRunningScriptInstance(
  server: BaseServer,
  scriptPath: ScriptFilePath,
  ramOverride: number | null | undefined,
  threads: number,
  args: ScriptArg[],
): Result<{ runningScript: RunningScript }> {
  const script = server.scripts.get(scriptPath);
  if (!script) {
    return {
      success: false,
      message: `Script ${scriptPath} does not exist on ${server.hostname}.`,
    };
  }

  if (!server.hasAdminRights) {
    return {
      success: false,
      message: `You do not have root access on ${server.hostname}.`,
    };
  }

  const singleRamUsage = ramOverride ?? script.getRamUsage(server.scripts);
  if (!singleRamUsage) {
    return {
      success: false,
      message: `Cannot calculate RAM usage of ${scriptPath}. Reason: ${script.ramCalculationError}`,
    };
  }
  const ramUsage = singleRamUsage * threads;
  const ramAvailable = server.maxRam - server.ramUsed;
  if (ramUsage > ramAvailable + 0.001) {
    return {
      success: false,
      message: `Cannot run ${scriptPath} (t=${threads}) on ${server.hostname}. This script requires ${formatRam(
        ramUsage,
      )} of RAM.`,
    };
  }

  const runningScript = new RunningScript(script, singleRamUsage, args);
  return {
    success: true,
    runningScript,
  };
}

/** Run a script from inside another script (run(), exec(), spawn(), etc.) */
export function runScriptFromScript(
  caller: string,
  server: BaseServer,
  scriptPath: ScriptFilePath,
  args: ScriptArg[],
  workerScript: WorkerScript,
  runOpts: CompleteRunOptions,
): number {
  // This does not adjust server RAM usage or change any state, so it is safe to call before performing other checks
  const result = createRunningScriptInstance(server, scriptPath, runOpts.ramOverride, runOpts.threads, args);
  if (!result.success) {
    workerScript.log(caller, () => result.message);
    return 0;
  }

  // Check if script is already running on server and fail if it is.
  if (
    runOpts.preventDuplicates &&
    getRunningScriptsByArgs(
      { workerScript, function: "runScriptFromScript", functionPath: "internal.runScriptFromScript" },
      scriptPath,
      server.hostname,
      args,
    ) !== null
  ) {
    workerScript.log(caller, () => `'${scriptPath}' is already running on '${server.hostname}'`);
    return 0;
  }

  // Able to run script
  workerScript.log(
    caller,
    () => `'${scriptPath}' on '${server.hostname}' with ${runOpts.threads} threads and args: ${arrayToString(args)}.`,
  );
  const runningScriptObj = result.runningScript;
  runningScriptObj.parent = workerScript.pid;
  runningScriptObj.threads = runOpts.threads;
  runningScriptObj.temporary = runOpts.temporary;

  return startWorkerScript(runningScriptObj, server, workerScript);
}
