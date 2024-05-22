/**
 * The worker agent for running a script instance. Each running script instance
 * has its own underlying WorkerScript object.
 *
 * Note that these objects are not saved and re-loaded when the game is refreshed.
 * Instead, whenever the game is opened, WorkerScripts are re-created from
 * RunningScript objects
 */
import type React from "react";
import type { BaseServer } from "../Server/BaseServer";
import type { NSFull } from "../NetscriptFunctions";
import type { ScriptFilePath } from "../Paths/ScriptFilePath";
import type { RunningScript } from "../Script/RunningScript";
import type { Script } from "../Script/Script";
import type { ScriptArg } from "@nsdefs";
import type { ScriptDeath } from "./ScriptDeath";

import { Environment } from "./Environment";
import { RamCostConstants } from "./RamCostGenerator";
import { GetServer } from "../Server/AllServers";

export class WorkerScript {
  /** Script's arguments */
  args: ScriptArg[];

  /** Copy of the script's code */
  code = "";

  /**
   * Holds the timeoutID (numeric value) for whenever this script is blocked by a
   * timed Netscript function. i.e. Holds the return value of setTimeout()
   */
  delay: number | null = null;

  /** Holds the Promise reject() function while the script is "blocked" by an async op */
  delayReject: ((reason?: ScriptDeath) => void) | undefined = undefined;

  /** Stores names of all functions that have logging disabled */
  disableLogs: Record<string, boolean> = {};

  /**
   * Used for dynamic RAM calculation. Stores names of all functions that have
   * already been checked by this script.
   * TODO: Could probably just combine this with loadedFns?
   */
  dynamicLoadedFns: Record<string, boolean> = {};

  /** Tracks dynamic RAM usage */
  dynamicRamUsage: number = RamCostConstants.Base;

  /** Netscript Environment for this script */
  env: Environment;

  /** Status message in case of script error. */
  errorMessage = "";

  /**
   * Used for static RAM calculation. Stores names of all functions that have
   * already been checked by this script
   */
  loadedFns: Record<string, boolean> = {};

  /** Filename of script */
  name: ScriptFilePath;

  /** Script's output/return value. Currently not used or implemented */
  output = "";

  /**
   * Process ID. Must be an integer. Used for efficient script
   * killing and removal.
   */
  pid: number;

  /** Reference to underlying RunningScript object */
  scriptRef: RunningScript;

  /** hostname on which this script is running */
  hostname: string;

  /**Map of functions called when the script ends. */
  atExit: Map<string, () => void> = new Map();

  constructor(runningScriptObj: RunningScript, pid: number, nsFuncsGenerator?: (ws: WorkerScript) => NSFull) {
    this.name = runningScriptObj.filename;
    this.hostname = runningScriptObj.server;

    const sanitizedPid = Math.round(pid);
    if (typeof sanitizedPid !== "number" || isNaN(sanitizedPid)) {
      throw new Error(`Invalid PID when constructing WorkerScript: ${pid}`);
    }
    this.pid = sanitizedPid;
    runningScriptObj.pid = sanitizedPid;

    // Get the underlying script's code
    const server = GetServer(this.hostname);
    if (server == null) {
      throw new Error(`WorkerScript constructed with invalid server ip: ${this.hostname}`);
    }
    const script = server.scripts.get(this.name);
    if (!script) {
      throw new Error(`WorkerScript constructed with invalid script filename: ${this.name}`);
    }
    this.code = script.code;
    this.scriptRef = runningScriptObj;
    this.args = runningScriptObj.args.slice();
    this.env = new Environment();
    if (typeof nsFuncsGenerator === "function") {
      this.env.vars = nsFuncsGenerator(this);
    }
  }

  /** Returns the Server on which this script is running */
  getServer(): BaseServer {
    const server = GetServer(this.hostname);
    if (server == null) throw new Error(`Script ${this.name} pid ${this.pid} is running on non-existent server?`);
    return server;
  }

  /**
   * Returns the Script object for the underlying script.
   * Returns null if it cannot be found (which would be a bug)
   */
  getScript(): Script | null {
    const server = this.getServer();
    const script = server.scripts.get(this.name);
    if (!script) {
      console.error(
        "Failed to find underlying Script object in WorkerScript.getScript(). This probably means somethings wrong",
      );
      return null;
    }
    return script;
  }

  shouldLog(fn: string): boolean {
    return this.disableLogs[fn] == null;
  }

  log(func: string, txt: () => string): void {
    if (this.shouldLog(func)) {
      if (func && txt) {
        this.scriptRef.log(`${func}: ${txt()}`);
      } else if (func) {
        this.scriptRef.log(func);
      } else {
        this.scriptRef.log(txt());
      }
    }
  }

  print(txt: React.ReactNode): void {
    this.scriptRef.log(txt);
  }
}
