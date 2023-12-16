import React from "react";
import { NetscriptContext } from "./APIWrapper";
import { WorkerScript } from "./WorkerScript";
import { killWorkerScript } from "./killWorkerScript";
import { GetAllServers, GetServer } from "../Server/AllServers";
import { Player } from "@player";
import { ScriptDeath } from "./ScriptDeath";
import { formatExp, formatMoney, formatRam, formatThreads } from "../ui/formatNumber";
import { ScriptArg } from "./ScriptArg";
import { RunningScript as IRunningScript, Person as IPerson, Server as IServer } from "@nsdefs";
import { Server } from "../Server/Server";
import {
  calculateHackingChance,
  calculateHackingExpGain,
  calculateHackingTime,
  calculatePercentMoneyHacked,
} from "../Hacking";
import { netscriptCanHack } from "../Hacking/netscriptCanHack";
import { convertTimeMsToTimeElapsedString } from "../utils/StringHelperFunctions";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { CONSTANTS } from "../Constants";
import { influenceStockThroughServerHack } from "../StockMarket/PlayerInfluencing";
import { PortNumber } from "../NetscriptPort";
import { FormulaGang } from "../Gang/formulas/formulas";
import { GangMember } from "../Gang/GangMember";
import { GangMemberTask } from "../Gang/GangMemberTask";
import { RunningScript } from "../Script/RunningScript";
import { toNative } from "../NetscriptFunctions/toNative";
import { ScriptIdentifier } from "./ScriptIdentifier";
import { findRunningScripts, findRunningScriptByPid } from "../Script/ScriptHelpers";
import { arrayToString } from "../utils/helpers/ArrayHelpers";
import { HacknetServer } from "../Hacknet/HacknetServer";
import { BaseServer } from "../Server/BaseServer";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { RamCostConstants } from "./RamCostGenerator";
import { isPositiveInteger, PositiveInteger, Unknownify } from "../types";
import { Engine } from "../engine";
import { resolveFilePath, FilePath } from "../Paths/FilePath";
import { hasScriptExtension, ScriptFilePath } from "../Paths/ScriptFilePath";
import { CustomBoundary } from "../ui/Components/CustomBoundary";

export const helpers = {
  string,
  number,
  positiveInteger,
  scriptArgs,
  runOptions,
  spawnOptions,
  argsToString,
  makeBasicErrorMsg,
  makeRuntimeErrorMsg,
  validateHGWOptions,
  checkEnvFlags,
  checkSingularityAccess,
  netscriptDelay,
  updateDynamicRam,
  getServer,
  scriptIdentifier,
  hack,
  portNumber,
  person,
  server,
  gang,
  gangMember,
  gangTask,
  log,
  filePath,
  scriptPath,
  getRunningScript,
  getRunningScriptsByArgs,
  getCannotFindRunningScriptErrorMessage,
  createPublicRunningScript,
  failOnHacknetServer,
};

/** RunOptions with non-optional, type-validated members, for passing between internal functions. */
export interface CompleteRunOptions {
  threads: PositiveInteger;
  temporary: boolean;
  ramOverride?: number;
  preventDuplicates: boolean;
}
/** SpawnOptions with non-optional, type-validated members, for passing between internal functions. */
export interface CompleteSpawnOptions extends CompleteRunOptions {
  spawnDelay: PositiveInteger;
}
/** HGWOptions with non-optional, type-validated members, for passing between internal functions. */
export interface CompleteHGWOptions {
  threads: PositiveInteger;
  stock: boolean;
  additionalMsec: number;
}

export function assertString(ctx: NetscriptContext, argName: string, v: unknown): asserts v is string {
  if (typeof v !== "string")
    throw makeRuntimeErrorMsg(ctx, `${argName} expected to be a string. ${debugType(v)}`, "TYPE");
}

const userFriendlyString = (v: unknown): string => {
  const clip = (s: string): string => {
    if (s.length > 15) return s.slice(0, 12) + "...";
    return s;
  };
  if (typeof v === "number") return String(v);
  if (typeof v === "string") {
    if (v === "") return "empty string";
    return `'${clip(v)}'`;
  }
  const json = JSON.stringify(v);
  if (!json) return "???";
  return `'${clip(json)}'`;
};

const debugType = (v: unknown): string => {
  if (v === null) return `Is null.`;
  if (v === undefined) return "Is undefined.";
  if (typeof v === "function") return "Is a function.";
  return `Is of type '${typeof v}', value: ${userFriendlyString(v)}`;
};

/** Convert a provided value v for argument argName to string. If it wasn't originally a string or number, throw. */
function string(ctx: NetscriptContext, argName: string, v: unknown): string {
  if (typeof v === "number") v = v + ""; // cast to string;
  assertString(ctx, argName, v);
  return v;
}

/** Convert provided value v for argument argName to number. Throw if could not convert to a non-NaN number. */
function number(ctx: NetscriptContext, argName: string, v: unknown): number {
  if (typeof v === "string") {
    const x = parseFloat(v);
    if (!isNaN(x)) return x; // otherwise it wasn't even a string representing a number.
  } else if (typeof v === "number") {
    if (isNaN(v)) throw makeRuntimeErrorMsg(ctx, `'${argName}' is NaN.`);
    return v;
  }
  throw makeRuntimeErrorMsg(ctx, `'${argName}' should be a number. ${debugType(v)}`, "TYPE");
}

/** Convert provided value v for argument argName to a positive integer, throwing if it looks like something else. */
function positiveInteger(ctx: NetscriptContext, argName: string, v: unknown): PositiveInteger {
  const n = number(ctx, argName, v);
  if (!isPositiveInteger(n)) {
    throw makeRuntimeErrorMsg(ctx, `${argName} should be a positive integer, was ${n}`, "TYPE");
  }
  return n;
}

/** Returns args back if it is a ScriptArg[]. Throws an error if it is not. */
function scriptArgs(ctx: NetscriptContext, args: unknown) {
  if (!isScriptArgs(args)) throw makeRuntimeErrorMsg(ctx, "'args' is not an array of script args", "TYPE");
  return args;
}

function runOptions(ctx: NetscriptContext, threadOrOption: unknown): CompleteRunOptions {
  const result: CompleteRunOptions = {
    threads: 1 as PositiveInteger,
    temporary: false,
    preventDuplicates: false,
  };
  function checkThreads(threads: unknown, argName: string) {
    if (threads !== null && threads !== undefined) {
      result.threads = positiveInteger(ctx, argName, threads);
    }
  }
  if (typeof threadOrOption !== "object" || threadOrOption === null) {
    checkThreads(threadOrOption, "threads");
    return result;
  }
  // Safe assertion since threadOrOption type has been narrowed to a non-null object
  const options = threadOrOption as Unknownify<CompleteRunOptions>;
  checkThreads(options.threads, "RunOptions.threads");
  result.temporary = !!options.temporary;
  result.preventDuplicates = !!options.preventDuplicates;
  if (options.ramOverride !== undefined && options.ramOverride !== null) {
    result.ramOverride = number(ctx, "RunOptions.ramOverride", options.ramOverride);
    if (result.ramOverride < RamCostConstants.Base) {
      throw makeRuntimeErrorMsg(
        ctx,
        `RunOptions.ramOverride must be >= baseCost (${RamCostConstants.Base}), was ${result.ramOverride}`,
      );
    }
  }
  return result;
}

function spawnOptions(ctx: NetscriptContext, threadOrOption: unknown): CompleteSpawnOptions {
  const result: CompleteSpawnOptions = { spawnDelay: 10000 as PositiveInteger, ...runOptions(ctx, threadOrOption) };
  if (typeof threadOrOption !== "object" || !threadOrOption) return result;
  // Safe assertion since threadOrOption type has been narrowed to a non-null object
  const { spawnDelay } = threadOrOption as Unknownify<CompleteSpawnOptions>;
  if (spawnDelay !== undefined) result.spawnDelay = positiveInteger(ctx, "spawnDelayMsec", spawnDelay);
  return result;
}

/** Convert multiple arguments for tprint or print into a single string. */
function argsToString(args: unknown[]): string {
  // Reduce array of args into a single output string
  return args.reduce((out, arg) => {
    if (arg === null) {
      return (out += "null");
    }
    if (arg === undefined) {
      return (out += "undefined");
    }
    const nativeArg = toNative(arg);

    // Handle Map formatting, since it does not JSON stringify or toString in a helpful way
    // output is  "< Map: key1 => value1; key2 => value2 >"
    if (nativeArg instanceof Map && [...nativeArg].length) {
      const formattedMap = [...nativeArg]
        .map((m) => {
          return `${m[0]} => ${m[1]}`;
        })
        .join("; ");
      return (out += `< Map: ${formattedMap} >`);
    }
    // Handle Set formatting, since it does not JSON stringify or toString in a helpful way
    if (nativeArg instanceof Set) {
      return (out += `< Set: ${[...nativeArg].join("; ")} >`);
    }
    if (typeof nativeArg === "object") {
      return (out += JSON.stringify(nativeArg));
    }

    return (out += `${nativeArg}`);
  }, "") as string;
}

/** Creates an error message string containing hostname, scriptname, and the error message msg */
function makeBasicErrorMsg(ws: WorkerScript | ScriptDeath, msg: string, type = "RUNTIME"): string {
  if (ws instanceof WorkerScript) {
    for (const [scriptUrl, script] of ws.scriptRef.dependencies) {
      msg = msg.replace(new RegExp(scriptUrl, "g"), script.filename);
    }
  }
  return `${type} ERROR\n${ws.name}@${ws.hostname} (PID - ${ws.pid})\n\n${msg}`;
}

/** Creates an error message string with a stack trace. */
export function makeRuntimeErrorMsg(ctx: NetscriptContext, msg: string, type = "RUNTIME"): string {
  const errstack = new Error().stack;
  if (errstack === undefined) throw new Error("how did we not throw an error?");
  const stack = errstack.split("\n").slice(1);
  const ws = ctx.workerScript;
  const caller = ctx.functionPath;
  const userstack = [];
  for (const stackline of stack) {
    const filename = (() => {
      // Check urls for dependencies
      for (const [url, script] of ws.scriptRef.dependencies) if (stackline.includes(url)) return script.filename;
      // Check for filenames directly if no URL found
      if (stackline.includes(ws.scriptRef.filename)) return ws.scriptRef.filename;
      for (const script of ws.scriptRef.dependencies.values()) {
        if (stackline.includes(script.filename)) return script.filename;
      }
    })();
    if (!filename) continue;

    let call = { line: "-1", func: "unknown" };
    const chromeCall = parseChromeStackline(stackline);
    if (chromeCall) {
      call = chromeCall;
    }

    const firefoxCall = parseFirefoxStackline(stackline);
    if (firefoxCall) {
      call = firefoxCall;
    }

    userstack.push(`${filename}:L${call.line}@${call.func}`);
  }

  log(ctx, () => msg);
  let rejectMsg = `${caller}: ${msg}`;
  if (userstack.length !== 0) rejectMsg += `\n\nStack:\n${userstack.join("\n")}`;
  return makeBasicErrorMsg(ws, rejectMsg, type);

  interface ILine {
    line: string;
    func: string;
  }
  function parseChromeStackline(line: string): ILine | null {
    const lineMatch = line.match(/.*:(\d+):\d+.*/);
    const funcMatch = line.match(/.*at (.+) \(.*/);
    if (lineMatch && funcMatch) return { line: lineMatch[1], func: funcMatch[1] };
    return null;
  }
  function parseFirefoxStackline(line: string): ILine | null {
    const lineMatch = line.match(/.*:(\d+):\d+$/);
    const lio = line.lastIndexOf("@");
    if (lineMatch && lio !== -1) return { line: lineMatch[1], func: line.slice(0, lio) };
    return null;
  }
}

function validateHGWOptions(ctx: NetscriptContext, opts: unknown): CompleteHGWOptions {
  const result: CompleteHGWOptions = {
    threads: ctx.workerScript.scriptRef.threads,
    stock: false,
    additionalMsec: 0,
  };
  if (opts == null) {
    return result;
  }
  if (typeof opts !== "object") {
    throw makeRuntimeErrorMsg(ctx, `BasicHGWOptions must be an object if specified, was ${opts}`);
  }
  // Safe assertion since threadOrOption type has been narrowed to a non-null object
  const options = opts as Unknownify<CompleteHGWOptions>;
  result.stock = !!options.stock;
  result.additionalMsec = number(ctx, "opts.additionalMsec", options.additionalMsec ?? 0);
  if (result.additionalMsec < 0) {
    throw makeRuntimeErrorMsg(ctx, `additionalMsec must be non-negative, got ${options.additionalMsec}`);
  }
  if (result.additionalMsec > 1e9) {
    throw makeRuntimeErrorMsg(ctx, `additionalMsec too large (>1e9), got ${options.additionalMsec}`);
  }
  const requestedThreads = options.threads;
  const threads = ctx.workerScript.scriptRef.threads;
  if (!requestedThreads) {
    result.threads = (isNaN(threads) || threads < 1 ? 1 : threads) as PositiveInteger;
  } else {
    const positiveThreads = positiveInteger(ctx, "opts.threads", requestedThreads);
    if (positiveThreads > threads) {
      throw makeRuntimeErrorMsg(
        ctx,
        `Too many threads requested by ${ctx.function}. Requested: ${positiveThreads}. Has: ${threads}.`,
      );
    }
    result.threads = positiveThreads;
  }

  return result;
}

/** Validate singularity access by throwing an error if the player does not have access. */
function checkSingularityAccess(ctx: NetscriptContext): void {
  if (Player.bitNodeN !== 4 && Player.sourceFileLvl(4) === 0) {
    throw makeRuntimeErrorMsg(
      ctx,
      `This singularity function requires Source-File 4 to run. A power up you obtain later in the game.
      It will be very obvious when and how you can obtain it.`,
      "API ACCESS",
    );
  }
}

/** Create an error if a script is dead or if concurrent ns function calls are made */
function checkEnvFlags(ctx: NetscriptContext): void {
  const ws = ctx.workerScript;
  if (ws.env.stopFlag) {
    log(ctx, () => "Failed to run due to script being killed.");
    throw new ScriptDeath(ws);
  }
  if (ws.env.runningFn && ctx.function !== "asleep") {
    log(ctx, () => "Failed to run due to failed concurrency check.");
    const err = makeRuntimeErrorMsg(
      ctx,
      `Concurrent calls to Netscript functions are not allowed!
      Did you forget to await hack(), grow(), or some other
      promise-returning function?
      Currently running: ${ws.env.runningFn} tried to run: ${ctx.function}`,
      "CONCURRENCY",
    );
    killWorkerScript(ws);
    throw err;
  }
}

/** Set a timeout for performing a task, mark the script as busy in the meantime. */
function netscriptDelay(ctx: NetscriptContext, time: number): Promise<void> {
  const ws = ctx.workerScript;
  return new Promise(function (resolve, reject) {
    ws.delay = window.setTimeout(() => {
      ws.delay = null;
      ws.delayReject = undefined;
      ws.env.runningFn = "";
      if (ws.env.stopFlag) reject(new ScriptDeath(ws));
      else resolve();
    }, time);
    ws.delayReject = reject;
    ws.env.runningFn = ctx.function;
  });
}

/** Adds to dynamic ram cost when calling new ns functions from a script */
function updateDynamicRam(ctx: NetscriptContext, ramCost: number): void {
  const ws = ctx.workerScript;
  const fnName = ctx.function;
  if (ws.dynamicLoadedFns[fnName]) return;
  ws.dynamicLoadedFns[fnName] = true;

  ws.dynamicRamUsage = Math.min(ws.dynamicRamUsage + ramCost, RamCostConstants.Max);
  // This constant is just a handful of ULPs, and gives protection against
  // rounding issues without exposing rounding exploits in ramUsage.
  if (ws.dynamicRamUsage > 1.00000000000001 * ws.scriptRef.ramUsage) {
    log(ctx, () => "Insufficient static ram available.");
    const err = makeRuntimeErrorMsg(
      ctx,
      `Dynamic RAM usage calculated to be greater than RAM allocation.
      This is probably because you somehow circumvented the static RAM calculation.

      Threads: ${ws.scriptRef.threads}
      Dynamic RAM Usage: ${formatRam(ws.dynamicRamUsage)} per thread
      RAM Allocation: ${formatRam(ws.scriptRef.ramUsage)} per thread

      One of these could be the reason:
      * Using eval() to get a reference to a ns function
      \u00a0\u00a0const myScan = eval('ns.scan');

      * Using map access to do the same
      \u00a0\u00a0const myScan = ns['scan'];

      * Using RunOptions.ramOverride to set a smaller allocation than needed

      Sorry :(`,
      "RAM USAGE",
    );
    killWorkerScript(ws);
    throw err;
  }
}

function scriptIdentifier(
  ctx: NetscriptContext,
  scriptID: unknown,
  _hostname: unknown,
  _args: unknown,
): ScriptIdentifier {
  const ws = ctx.workerScript;
  // Provide the pid for the current script if no identifier provided
  if (scriptID === undefined) return ws.pid;
  if (typeof scriptID === "number") return scriptID;
  if (typeof scriptID === "string") {
    const hostname = _hostname === undefined ? ctx.workerScript.hostname : string(ctx, "hostname", _hostname);
    const args = _args === undefined ? [] : scriptArgs(ctx, _args);
    return {
      scriptname: scriptID,
      hostname,
      args,
    };
  }
  throw makeRuntimeErrorMsg(ctx, "An unknown type of input was provided as a script identifier.", "TYPE");
}

/**
 * Gets the Server for a specific hostname/ip, throwing an error
 * if the server doesn't exist.
 * @param {NetscriptContext} ctx - Context from which getServer is being called. For logging purposes.
 * @param {string} hostname - Hostname of the server
 * @returns {BaseServer} The specified server as a BaseServer
 */
function getServer(ctx: NetscriptContext, hostname: string) {
  const server = GetServer(hostname);
  if (server == null || (server.serversOnNetwork.length == 0 && server.hostname != "home")) {
    const str = hostname === "" ? "'' (empty string)" : "'" + hostname + "'";
    throw makeRuntimeErrorMsg(ctx, `Invalid hostname: ${str}`);
  }
  return server;
}

function isScriptArgs(args: unknown): args is ScriptArg[] {
  const isScriptArg = (arg: unknown) => typeof arg === "string" || typeof arg === "number" || typeof arg === "boolean";
  return Array.isArray(args) && args.every(isScriptArg);
}

function hack(ctx: NetscriptContext, hostname: string, manual: boolean, opts: unknown): Promise<number> {
  const ws = ctx.workerScript;
  const { threads, stock, additionalMsec } = validateHGWOptions(ctx, opts);
  const server = getServer(ctx, hostname);
  if (!(server instanceof Server)) {
    throw makeRuntimeErrorMsg(ctx, "Cannot be executed on this server.");
  }

  // Calculate the hacking time
  // This is in seconds
  const hackingTime = calculateHackingTime(server, Player) + additionalMsec / 1000.0;

  // No root access or skill level too low
  const canHack = netscriptCanHack(server);
  if (!canHack.res) {
    throw makeRuntimeErrorMsg(ctx, canHack.msg || "");
  }

  log(
    ctx,
    () =>
      `Executing on '${server.hostname}' in ${convertTimeMsToTimeElapsedString(
        hackingTime * 1000,
        true,
      )} (t=${formatThreads(threads)})`,
  );

  return helpers.netscriptDelay(ctx, hackingTime * 1000).then(function () {
    const hackChance = calculateHackingChance(server, Player);
    const rand = Math.random();
    let expGainedOnSuccess = calculateHackingExpGain(server, Player) * threads;
    const expGainedOnFailure = expGainedOnSuccess / 4;
    if (rand < hackChance) {
      // Success!
      const percentHacked = calculatePercentMoneyHacked(server, Player);
      let maxThreadNeeded = Math.ceil(1 / percentHacked);
      if (isNaN(maxThreadNeeded)) {
        // Server has a 'max money' of 0 (probably). We'll set this to an arbitrarily large value
        maxThreadNeeded = 1e6;
      }

      let moneyDrained = server.moneyAvailable * percentHacked * threads;

      // Over-the-top safety checks
      if (moneyDrained <= 0) {
        moneyDrained = 0;
        expGainedOnSuccess = expGainedOnFailure;
      }
      if (moneyDrained > server.moneyAvailable) {
        moneyDrained = server.moneyAvailable;
      }
      server.moneyAvailable -= moneyDrained;
      if (server.moneyAvailable < 0) {
        server.moneyAvailable = 0;
      }

      let moneyGained = moneyDrained * currentNodeMults.ScriptHackMoneyGain;
      if (manual) {
        moneyGained = moneyDrained * currentNodeMults.ManualHackMoney;
      }

      Player.gainMoney(moneyGained, "hacking");
      ws.scriptRef.onlineMoneyMade += moneyGained;
      Player.scriptProdSinceLastAug += moneyGained;
      ws.scriptRef.recordHack(server.hostname, moneyGained, threads);
      Player.gainHackingExp(expGainedOnSuccess);
      if (manual) Player.gainIntelligenceExp(0.005);
      ws.scriptRef.onlineExpGained += expGainedOnSuccess;
      log(
        ctx,
        () =>
          `Successfully hacked '${server.hostname}' for ${formatMoney(moneyGained)} and ${formatExp(
            expGainedOnSuccess,
          )} exp (t=${formatThreads(threads)})`,
      );
      server.fortify(CONSTANTS.ServerFortifyAmount * Math.min(threads, maxThreadNeeded));
      if (stock) {
        influenceStockThroughServerHack(server, moneyDrained);
      }
      if (manual) {
        server.backdoorInstalled = true;
        // Manunally check for faction invites
        Engine.Counters.checkFactionInvitations = 0;
        Engine.checkCounters();
      }
      return moneyGained;
    } else {
      // Player only gains 25% exp for failure?
      Player.gainHackingExp(expGainedOnFailure);
      ws.scriptRef.onlineExpGained += expGainedOnFailure;
      log(
        ctx,
        () =>
          `Failed to hack '${server.hostname}'. Gained ${formatExp(expGainedOnFailure)} exp (t=${formatThreads(
            threads,
          )})`,
      );
      return 0;
    }
  });
}

function portNumber(ctx: NetscriptContext, _n: unknown): PortNumber {
  const n = positiveInteger(ctx, "portNumber", _n);
  if (n > CONSTANTS.NumNetscriptPorts) {
    throw makeRuntimeErrorMsg(
      ctx,
      `Trying to use an invalid port: ${n}. Must be less or equal to ${CONSTANTS.NumNetscriptPorts}.`,
    );
  }
  return n as PortNumber;
}

function person(ctx: NetscriptContext, p: unknown): IPerson {
  const fakePerson = {
    hp: undefined,
    exp: undefined,
    mults: undefined,
    city: undefined,
  };
  const error = missingKey(fakePerson, p);
  if (error) throw makeRuntimeErrorMsg(ctx, `person should be a Person.\n${error}`, "TYPE");
  return p as IPerson;
}

function server(ctx: NetscriptContext, s: unknown): IServer {
  const fakeServer = {
    hostname: undefined,
    ip: undefined,
    sshPortOpen: undefined,
    ftpPortOpen: undefined,
    smtpPortOpen: undefined,
    httpPortOpen: undefined,
    sqlPortOpen: undefined,
    hasAdminRights: undefined,
    cpuCores: undefined,
    isConnectedTo: undefined,
    ramUsed: undefined,
    maxRam: undefined,
    organizationName: undefined,
    purchasedByPlayer: undefined,
  };
  const error = missingKey(fakeServer, s);
  if (error) throw makeRuntimeErrorMsg(ctx, `server should be a Server.\n${error}`, "TYPE");
  return s as IServer;
}

function missingKey(expect: object, actual: unknown): string | false {
  if (typeof actual !== "object" || actual === null) {
    return `Expected to be an object, was ${actual === null ? "null" : typeof actual}.`;
  }
  for (const key in expect) {
    if (!(key in actual)) return `Property ${key} was expected but not present.`;
  }
  return false;
}

function gang(ctx: NetscriptContext, g: unknown): FormulaGang {
  const error = missingKey({ respect: 0, territory: 0, wantedLevel: 0 }, g);
  if (error) throw makeRuntimeErrorMsg(ctx, `gang should be a Gang.\n${error}`, "TYPE");
  return g as FormulaGang;
}

function gangMember(ctx: NetscriptContext, m: unknown): GangMember {
  const error = missingKey(new GangMember(), m);
  if (error) throw makeRuntimeErrorMsg(ctx, `member should be a GangMember.\n${error}`, "TYPE");
  return m as GangMember;
}

function gangTask(ctx: NetscriptContext, t: unknown): GangMemberTask {
  const error = missingKey(new GangMemberTask("", "", false, false, { hackWeight: 100 }), t);
  if (error) throw makeRuntimeErrorMsg(ctx, `task should be a GangMemberTask.\n${error}`, "TYPE");
  return t as GangMemberTask;
}

function log(ctx: NetscriptContext, message: () => string) {
  ctx.workerScript.log(ctx.functionPath, message);
}

export function filePath(ctx: NetscriptContext, argName: string, filename: unknown): FilePath {
  assertString(ctx, argName, filename);
  const path = resolveFilePath(filename, ctx.workerScript.name);
  if (path) return path;
  throw makeRuntimeErrorMsg(ctx, `Invalid ${argName}, was not a valid path: ${filename}`);
}

export function scriptPath(ctx: NetscriptContext, argName: string, filename: unknown): ScriptFilePath {
  const path = filePath(ctx, argName, filename);
  if (hasScriptExtension(path)) return path;
  throw makeRuntimeErrorMsg(ctx, `Invalid ${argName}, must be a script: ${filename}`);
}

/**
 * Searches for and returns the RunningScript objects for the specified script.
 * If the 'fn' argument is not specified, this returns the current RunningScript.
 * @param fn - Filename of script
 * @param hostname - Hostname/ip of the server on which the script resides
 * @param scriptArgs - Running script's arguments
 * @returns Running scripts identified by the parameters, or empty if no such script
 *   exists, or only the current running script if the first argument 'fn'
 *   is not specified.
 */
export function getRunningScriptsByArgs(
  ctx: NetscriptContext,
  fn: string,
  hostname: string,
  scriptArgs: ScriptArg[],
): Map<number, RunningScript> | null {
  if (!Array.isArray(scriptArgs)) {
    throw helpers.makeRuntimeErrorMsg(
      ctx,
      "Invalid scriptArgs argument passed into getRunningScriptByArgs().\n" +
        "This is probably a bug. Please report to game developer",
    );
  }

  const path = scriptPath(ctx, "filename", fn);
  // Lookup server to scope search
  if (hostname == null) {
    hostname = ctx.workerScript.hostname;
  }
  const server = helpers.getServer(ctx, hostname);

  return findRunningScripts(path, scriptArgs, server);
}

function getRunningScriptByPid(pid: number): RunningScript | null {
  for (const server of GetAllServers()) {
    const runningScript = findRunningScriptByPid(pid, server);
    if (runningScript) return runningScript;
  }
  return null;
}

function getRunningScript(ctx: NetscriptContext, ident: ScriptIdentifier): RunningScript | null {
  if (typeof ident === "number") {
    return getRunningScriptByPid(ident);
  } else {
    const scripts = getRunningScriptsByArgs(ctx, ident.scriptname, ident.hostname, ident.args);
    if (scripts === null) return null;
    return scripts.values().next().value;
  }
}

/**
 * Helper function for getting the error log message when the user specifies
 * a nonexistent running script
 * @param ident - Identifier (pid or identifier object) of script.
 * @returns Error message to print to logs
 */
function getCannotFindRunningScriptErrorMessage(ident: ScriptIdentifier): string {
  if (typeof ident === "number") return `Cannot find running script with pid: ${ident}`;

  return `Cannot find running script ${ident.scriptname} on server ${ident.hostname} with args: ${arrayToString(
    ident.args,
  )}`;
}

/**
 * Sanitizes a `RunningScript` to remove sensitive information, making it suitable for
 * return through an NS function.
 * @see NS.getRecentScripts
 * @see NS.getRunningScript
 * @param runningScript Existing, internal RunningScript
 * @returns A sanitized, NS-facing copy of the RunningScript
 */
function createPublicRunningScript(runningScript: RunningScript): IRunningScript {
  const logProps = runningScript.tailProps;
  return {
    args: runningScript.args.slice(),
    filename: runningScript.filename,
    logs: runningScript.logs.map((x) => "" + x),
    offlineExpGained: runningScript.offlineExpGained,
    offlineMoneyMade: runningScript.offlineMoneyMade,
    offlineRunningTime: runningScript.offlineRunningTime,
    onlineExpGained: runningScript.onlineExpGained,
    onlineMoneyMade: runningScript.onlineMoneyMade,
    onlineRunningTime: runningScript.onlineRunningTime,
    pid: runningScript.pid,
    ramUsage: runningScript.ramUsage,
    server: runningScript.server,
    tailProperties:
      !logProps || !logProps.isVisible()
        ? null
        : {
            x: logProps.x,
            y: logProps.y,
            width: logProps.width,
            height: logProps.height,
          },
    title: runningScript.title,
    threads: runningScript.threads,
    temporary: runningScript.temporary,
  };
}

/**
 * Used to fail a function if the function's target is a Hacknet Server.
 * This is used for functions that should run on normal Servers, but not Hacknet Servers
 * @param {Server} server - Target server
 * @param {string} callingFn - Name of calling function. For logging purposes
 * @returns {boolean} True if the server is a Hacknet Server, false otherwise
 */
function failOnHacknetServer(ctx: NetscriptContext, server: BaseServer): boolean {
  if (server instanceof HacknetServer) {
    log(ctx, () => `Does not work on Hacknet Servers`);
    return true;
  } else {
    return false;
  }
}

/** Generate an error dialog when workerscript is known */
export function handleUnknownError(e: unknown, ws: WorkerScript | ScriptDeath | null = null, initialText = "") {
  if (e instanceof ScriptDeath) {
    //No dialog for an empty ScriptDeath
    if (e.errorMessage === "") return;
    if (!ws) {
      ws = e;
      e = ws.errorMessage;
    }
  }
  if (ws && typeof e === "string") {
    const headerText = makeBasicErrorMsg(ws, "", "");
    if (!e.includes(headerText)) e = makeBasicErrorMsg(ws, e);
  } else if (e instanceof SyntaxError) {
    const msg = `${e.message} (sorry we can't be more helpful)`;
    e = ws ? makeBasicErrorMsg(ws, msg, "SYNTAX") : `SYNTAX ERROR:\n\n${msg}`;
  } else if (e instanceof Error) {
    // Ignore any cancellation errors from Monaco that get here
    if (e.name === "Canceled" && e.message === "Canceled") return;
    const msg = `${e.message}${e.stack ? `\nstack:\n${e.stack.toString()}` : ""}`;
    e = ws ? makeBasicErrorMsg(ws, msg) : `RUNTIME ERROR:\n\n${msg}`;
  }
  if (typeof e !== "string") {
    console.error("Unexpected error:", e);
    const msg = `Unexpected type of error thrown. This error was likely thrown manually within a script.
      Error has been logged to the console.\n\nType of error: ${typeof e}\nValue of error: ${e}`;
    e = ws ? makeBasicErrorMsg(ws, msg, "UNKNOWN") : msg;
  }
  dialogBoxCreate(initialText + e);
}

// Incrementing value for custom element keys
let customElementKey = 0;

/**
 * Wrap a user-provided React Element (or maybe invalid junk) in an Error-catching component,
 * so the game won't crash and the user gets sensible messages.
 */
export function wrapUserNode(value: unknown) {
  return <CustomBoundary key={`PlayerContent${customElementKey++}`}>{value}</CustomBoundary>;
}
