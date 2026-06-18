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
import type { ScriptDeath } from "./ScriptDeath";

import { RamCostConstants } from "./RamCostGenerator";
import { GetServer } from "../Server/AllServers";

export class WorkerScript {
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

  /** Whether or not this script is stopped */
  stopFlag = false;

  /** The currently running function */
  runningFn = "";

  /** Netscript API bound to this script */
  vars: NSFull | null = null;

  /** Filename of script. Mirrors the RunningScript, so we don't store a second copy. */
  get name(): ScriptFilePath {
    return this.scriptRef.filename;
  }

  /**
   * Process ID. Must be an integer. Used for efficient script
   * killing and removal.
   */
  pid: number;

  /** Reference to underlying RunningScript object */
  scriptRef: RunningScript;

  /** hostname on which this script is running. Mirrors the RunningScript. */
  get hostname(): string {
    return this.scriptRef.server;
  }

  /** Map of functions called when the script ends. Allocated lazily on the first ns.atExit call. */
  atExit: Map<string, () => void> | null = null;

  constructor(runningScriptObj: RunningScript, pid: number, nsFuncsGenerator?: (ws: WorkerScript) => NSFull) {
    // Assign first: the name/hostname getters read through scriptRef.
    this.scriptRef = runningScriptObj;

    const sanitizedPid = Math.round(pid);
    if (typeof sanitizedPid !== "number" || isNaN(sanitizedPid)) {
      throw new Error(`Invalid PID when constructing WorkerScript: ${pid}`);
    }
    this.pid = sanitizedPid;
    runningScriptObj.pid = sanitizedPid;

    // Verify the server and underlying script exist
    const server = GetServer(this.hostname);
    if (server == null) {
      throw new Error(`WorkerScript constructed with invalid server ip: ${this.hostname}`);
    }
    const script = server.scripts.get(this.name);
    if (!script) {
      throw new Error(`WorkerScript constructed with invalid script filename: ${this.name}`);
    }
    this.scriptRef = runningScriptObj;
    if (typeof nsFuncsGenerator === "function") {
      this.vars = nsFuncsGenerator(this);
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
    return !(this.disableLogs.ALL || this.disableLogs[fn]);
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
