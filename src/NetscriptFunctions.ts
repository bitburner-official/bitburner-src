import $ from "jquery";
import { vsprintf, sprintf } from "sprintf-js";
import { WorkerScriptStartStopEventEmitter } from "./Netscript/WorkerScriptStartStopEventEmitter";
import { BitNodeMultipliers, IBitNodeMultipliers } from "./BitNode/BitNodeMultipliers";
import { CONSTANTS } from "./Constants";
import {
  calculateHackingChance,
  calculateHackingExpGain,
  calculatePercentMoneyHacked,
  calculateHackingTime,
  calculateGrowTime,
  calculateWeakenTime,
} from "./Hacking";
import { netscriptCanGrow, netscriptCanWeaken } from "./Hacking/netscriptCanHack";
import { Terminal } from "./Terminal";
import { Player } from "@player";
import { CompletedProgramName } from "./Programs/Programs";
import { PromptEvent } from "./ui/React/PromptManager";
import { GetServer, DeleteServer, AddToAllServers, createUniqueRandomIp } from "./Server/AllServers";
import {
  getServerOnNetwork,
  numCycleForGrowth,
  numCycleForGrowthCorrected,
  processSingleServerGrowth,
  safelyCreateUniqueServer,
} from "./Server/ServerHelpers";
import {
  getPurchasedServerUpgradeCost,
  getPurchaseServerCost,
  getPurchaseServerLimit,
  getPurchaseServerMaxRam,
  renamePurchasedServer,
  upgradePurchasedServer,
} from "./Server/ServerPurchases";
import { Server } from "./Server/Server";
import { influenceStockThroughServerGrow } from "./StockMarket/PlayerInfluencing";
import { runScriptFromScript } from "./NetscriptWorker";
import { killWorkerScript } from "./Netscript/killWorkerScript";
import { workerScripts } from "./Netscript/WorkerScripts";
import { WorkerScript } from "./Netscript/WorkerScript";
import { helpers, assertObjectType } from "./Netscript/NetscriptHelpers";
import {
  formatExp,
  formatNumberNoSuffix,
  formatMoney,
  formatPercent,
  formatRam,
  formatSecurity,
  formatThreads,
  formatNumber,
} from "./ui/formatNumber";
import { convertTimeMsToTimeElapsedString } from "./utils/StringHelperFunctions";
import { LogBoxEvents, LogBoxCloserEvents, LogBoxPositionEvents, LogBoxSizeEvents } from "./ui/React/LogBoxManager";
import { arrayToString } from "./utils/helpers/arrayToString";
import { NetscriptGang } from "./NetscriptFunctions/Gang";
import { NetscriptSleeve } from "./NetscriptFunctions/Sleeve";
import { NetscriptExtra } from "./NetscriptFunctions/Extra";
import { NetscriptHacknet } from "./NetscriptFunctions/Hacknet";
import { NetscriptStanek } from "./NetscriptFunctions/Stanek";
import { NetscriptInfiltration } from "./NetscriptFunctions/Infiltration";
import { NetscriptUserInterface } from "./NetscriptFunctions/UserInterface";
import { NetscriptBladeburner } from "./NetscriptFunctions/Bladeburner";
import { NetscriptCodingContract } from "./NetscriptFunctions/CodingContract";
import { NetscriptCorporation } from "./NetscriptFunctions/Corporation";
import { NetscriptFormulas } from "./NetscriptFunctions/Formulas";
import { NetscriptStockMarket } from "./NetscriptFunctions/StockMarket";
import { NetscriptGrafting } from "./NetscriptFunctions/Grafting";
import { NS, RecentScript, BasicHGWOptions, ProcessInfo, NSEnums } from "@nsdefs";
import { NetscriptSingularity } from "./NetscriptFunctions/Singularity";

import { dialogBoxCreate } from "./ui/React/DialogBox";
import { SnackbarEvents, ToastVariant } from "./ui/React/Snackbar";
import { checkEnum } from "./utils/helpers/enum";

import { Flags } from "./NetscriptFunctions/Flags";
import { calculateIntelligenceBonus } from "./PersonObjects/formulas/intelligence";
import { CalculateShareMult, StartSharing } from "./NetworkShare/Share";
import { recentScripts } from "./Netscript/RecentScripts";
import { InternalAPI, removedFunction, NSProxy } from "./Netscript/APIWrapper";
import { INetscriptExtra } from "./NetscriptFunctions/Extra";
import { ScriptDeath } from "./Netscript/ScriptDeath";
import { getBitNodeMultipliers } from "./BitNode/BitNode";
import { assert, arrayAssert, stringAssert, objectAssert } from "./utils/helpers/typeAssertion";
import { CityName, JobName, CrimeType, GymType, LocationName, UniversityClassType } from "./Enums";
import { cloneDeep } from "lodash";
import { FactionWorkType } from "./Enums";
import numeral from "numeral";
import { clearPort, peekPort, portHandle, readPort, tryWritePort, writePort } from "./NetscriptPort";
import { FilePath, resolveFilePath } from "./Paths/FilePath";
import { hasScriptExtension, resolveScriptFilePath } from "./Paths/ScriptFilePath";
import { hasTextExtension } from "./Paths/TextFilePath";
import { ContentFilePath } from "./Paths/ContentFile";
import { LiteratureName } from "./Literature/data/LiteratureNames";

export const enums: NSEnums = {
  CityName,
  CrimeType,
  FactionWorkType,
  GymType,
  LocationName,
  JobName,
  ToastVariant,
  UniversityClassType,
};
for (const val of Object.values(enums)) Object.freeze(val);
Object.freeze(enums);

export type NSFull = Readonly<Omit<NS & INetscriptExtra, "pid" | "args" | "enums">>;

export const ns: InternalAPI<NSFull> = {
  singularity: NetscriptSingularity(),
  gang: NetscriptGang(),
  bladeburner: NetscriptBladeburner(),
  codingcontract: NetscriptCodingContract(),
  sleeve: NetscriptSleeve(),
  corporation: NetscriptCorporation(),
  stanek: NetscriptStanek(),
  infiltration: NetscriptInfiltration(),
  ui: NetscriptUserInterface(),
  formulas: NetscriptFormulas(),
  stock: NetscriptStockMarket(),
  grafting: NetscriptGrafting(),
  hacknet: NetscriptHacknet(),
  sprintf: () => sprintf,
  vsprintf: () => vsprintf,
  scan: (ctx) => (_hostname) => {
    const hostname = _hostname ? helpers.string(ctx, "hostname", _hostname) : ctx.workerScript.hostname;
    const server = helpers.getServer(ctx, hostname);
    const out: string[] = [];
    for (let i = 0; i < server.serversOnNetwork.length; i++) {
      const s = getServerOnNetwork(server, i);
      if (s === null) continue;
      const entry = s.hostname;
      if (entry === null) continue;
      out.push(entry);
    }
    helpers.log(ctx, () => `returned ${server.serversOnNetwork.length} connections for ${server.hostname}`);
    return out;
  },
  hasTorRouter: () => () => Player.hasTorRouter(),
  hack:
    (ctx) =>
    (_hostname, opts = {}) => {
      const hostname = helpers.string(ctx, "hostname", _hostname);
      // TODO 2.2: better type safety rework for functions using assertObjectType, then remove function.
      const optsValidator: BasicHGWOptions = {};
      assertObjectType(ctx, "opts", opts, optsValidator);
      return helpers.hack(ctx, hostname, false, opts);
    },
  hackAnalyzeThreads: (ctx) => (_hostname, _hackAmount) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const hackAmount = helpers.number(ctx, "hackAmount", _hackAmount);

    // Check argument validity
    const server = helpers.getServer(ctx, hostname);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return -1;
    }
    if (isNaN(hackAmount)) {
      throw helpers.makeRuntimeErrorMsg(
        ctx,
        `Invalid hackAmount argument passed into hackAnalyzeThreads: ${hackAmount}. Must be numeric.`,
      );
    }

    if (hackAmount < 0 || hackAmount > server.moneyAvailable) {
      return -1;
    } else if (hackAmount === 0) {
      return 0;
    }

    const percentHacked = calculatePercentMoneyHacked(server, Player);

    if (percentHacked === 0 || server.moneyAvailable === 0) {
      return -1; // To prevent returning infinity below
    }

    return hackAmount / (server.moneyAvailable * percentHacked);
  },
  hackAnalyze: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);

    const server = helpers.getServer(ctx, hostname);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 0;
    }

    return calculatePercentMoneyHacked(server, Player);
  },
  hackAnalyzeSecurity: (ctx) => (_threads, _hostname?) => {
    let threads = helpers.number(ctx, "threads", _threads);
    if (_hostname) {
      const hostname = helpers.string(ctx, "hostname", _hostname);
      const server = helpers.getServer(ctx, hostname);
      if (!(server instanceof Server)) {
        helpers.log(ctx, () => "Cannot be executed on this server.");
        return 0;
      }

      const percentHacked = calculatePercentMoneyHacked(server, Player);

      if (percentHacked > 0) {
        // thread count is limited to the maximum number of threads needed
        threads = Math.min(threads, Math.ceil(1 / percentHacked));
      }
    }

    return CONSTANTS.ServerFortifyAmount * threads;
  },
  hackAnalyzeChance: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);

    const server = helpers.getServer(ctx, hostname);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 0;
    }

    return calculateHackingChance(server, Player);
  },
  sleep:
    (ctx) =>
    (_time = 0) => {
      const time = helpers.number(ctx, "time", _time);
      helpers.log(ctx, () => `Sleeping for ${time} milliseconds`);
      return helpers.netscriptDelay(ctx, time).then(function () {
        return Promise.resolve(true);
      });
    },
  asleep:
    (ctx) =>
    (_time = 0) => {
      const time = helpers.number(ctx, "time", _time);
      helpers.log(ctx, () => `Sleeping for ${time} milliseconds`);
      return new Promise((resolve) => setTimeout(() => resolve(true), time));
    },
  grow:
    (ctx) =>
    (_hostname, opts = {}) => {
      const hostname = helpers.string(ctx, "hostname", _hostname);
      const optsValidator: BasicHGWOptions = {};
      assertObjectType(ctx, "opts", opts, optsValidator);
      const threads = helpers.resolveNetscriptRequestedThreads(ctx, opts.threads);
      const additionalMsec = helpers.number(ctx, "opts.additionalMsec", opts.additionalMsec ?? 0);
      if (additionalMsec < 0) {
        throw helpers.makeRuntimeErrorMsg(ctx, `additionalMsec must be non-negative, got ${additionalMsec}`);
      }

      const server = helpers.getServer(ctx, hostname);
      if (!(server instanceof Server)) {
        helpers.log(ctx, () => "Cannot be executed on this server.");
        return Promise.resolve(0);
      }

      const host = GetServer(ctx.workerScript.hostname);
      if (host === null) {
        throw new Error("Workerscript host is null");
      }

      // No root access or skill level too low
      const canHack = netscriptCanGrow(server);
      if (!canHack.res) {
        throw helpers.makeRuntimeErrorMsg(ctx, canHack.msg || "");
      }

      const growTime = calculateGrowTime(server, Player) + additionalMsec / 1000.0;
      helpers.log(
        ctx,
        () =>
          `Executing on '${server.hostname}' in ${convertTimeMsToTimeElapsedString(
            growTime * 1000,
            true,
          )} (t=${formatThreads(threads)}).`,
      );
      return helpers.netscriptDelay(ctx, growTime * 1000).then(function () {
        const moneyBefore = server.moneyAvailable <= 0 ? 1 : server.moneyAvailable;
        processSingleServerGrowth(server, threads, host.cpuCores);
        const moneyAfter = server.moneyAvailable;
        ctx.workerScript.scriptRef.recordGrow(server.hostname, threads);
        const expGain = calculateHackingExpGain(server, Player) * threads;
        const logGrowPercent = moneyAfter / moneyBefore - 1;
        helpers.log(
          ctx,
          () =>
            `Available money on '${server.hostname}' grown by ${formatPercent(logGrowPercent, 6)}. Gained ${formatExp(
              expGain,
            )} hacking exp (t=${formatThreads(threads)}).`,
        );
        ctx.workerScript.scriptRef.onlineExpGained += expGain;
        Player.gainHackingExp(expGain);
        if (opts.stock) {
          influenceStockThroughServerGrow(server, moneyAfter - moneyBefore);
        }
        return Promise.resolve(moneyAfter / moneyBefore);
      });
    },
  growthAnalyze:
    (ctx) =>
    (_host, _multiplier, _cores = 1) => {
      const host = helpers.string(ctx, "hostname", _host);
      const mult = helpers.number(ctx, "multiplier", _multiplier);
      const cores = helpers.number(ctx, "cores", _cores);

      // Check argument validity
      const server = helpers.getServer(ctx, host);
      if (!(server instanceof Server)) {
        // Todo 2.3: Make this throw instead of returning 0?
        helpers.log(ctx, () => `${host} is not a hackable server. Returning 0.`);
        return 0;
      }
      if (mult < 1 || !isFinite(mult)) {
        throw helpers.makeRuntimeErrorMsg(ctx, `Invalid argument: multiplier must be finite and >= 1, is ${mult}.`);
      }
      // TODO 2.3: Add assertion function for positive integer, there are a lot of places everywhere that can use this
      if (!Number.isInteger(cores) || cores < 1) {
        throw helpers.makeRuntimeErrorMsg(ctx, `Cores should be a positive integer. Cores provided: ${cores}`);
      }

      return numCycleForGrowth(server, mult, cores);
    },
  growthAnalyzeSecurity:
    (ctx) =>
    (_threads, _hostname?, _cores = 1) => {
      let threads = helpers.number(ctx, "threads", _threads);
      if (_hostname) {
        const cores = helpers.number(ctx, "cores", _cores);
        const hostname = helpers.string(ctx, "hostname", _hostname);
        const server = helpers.getServer(ctx, hostname);

        if (!(server instanceof Server)) {
          helpers.log(ctx, () => "Cannot be executed on this server.");
          return 0;
        }

        const maxThreadsNeeded = Math.ceil(
          numCycleForGrowthCorrected(server, server.moneyMax, server.moneyAvailable, cores),
        );

        threads = Math.min(threads, maxThreadsNeeded);
      }

      return 2 * CONSTANTS.ServerFortifyAmount * threads;
    },
  weaken:
    (ctx) =>
    async (_hostname, opts = {}) => {
      const hostname = helpers.string(ctx, "hostname", _hostname);
      const optsValidator: BasicHGWOptions = {};
      assertObjectType(ctx, "opts", opts, optsValidator);
      const threads = helpers.resolveNetscriptRequestedThreads(ctx, opts.threads);
      const additionalMsec = helpers.number(ctx, "opts.additionalMsec", opts.additionalMsec ?? 0);
      if (additionalMsec < 0) {
        throw helpers.makeRuntimeErrorMsg(ctx, `additionalMsec must be non-negative, got ${additionalMsec}`);
      }

      const server = helpers.getServer(ctx, hostname);
      if (!(server instanceof Server)) {
        helpers.log(ctx, () => "Cannot be executed on this server.");
        return Promise.resolve(0);
      }

      // No root access or skill level too low
      const canHack = netscriptCanWeaken(server);
      if (!canHack.res) {
        throw helpers.makeRuntimeErrorMsg(ctx, canHack.msg || "");
      }

      const weakenTime = calculateWeakenTime(server, Player) + additionalMsec / 1000.0;
      helpers.log(
        ctx,
        () =>
          `Executing on '${server.hostname}' in ${convertTimeMsToTimeElapsedString(
            weakenTime * 1000,
            true,
          )} (t=${formatThreads(threads)})`,
      );
      return helpers.netscriptDelay(ctx, weakenTime * 1000).then(function () {
        const host = GetServer(ctx.workerScript.hostname);
        if (host === null) {
          helpers.log(ctx, () => "Server is null, did it die?");
          return Promise.resolve(0);
        }
        const coreBonus = 1 + (host.cpuCores - 1) / 16;
        const weakenAmt = CONSTANTS.ServerWeakenAmount * threads * coreBonus;
        server.weaken(weakenAmt);
        ctx.workerScript.scriptRef.recordWeaken(server.hostname, threads);
        const expGain = calculateHackingExpGain(server, Player) * threads;
        helpers.log(
          ctx,
          () =>
            `'${server.hostname}' security level weakened to ${server.hackDifficulty}. Gained ${formatExp(
              expGain,
            )} hacking exp (t=${formatThreads(threads)})`,
        );
        ctx.workerScript.scriptRef.onlineExpGained += expGain;
        Player.gainHackingExp(expGain);
        // Account for hidden multiplier in Server.weaken()
        return Promise.resolve(weakenAmt * BitNodeMultipliers.ServerWeakenRate);
      });
    },
  weakenAnalyze:
    (ctx) =>
    (_threads, _cores = 1) => {
      const threads = helpers.number(ctx, "threads", _threads);
      const cores = helpers.number(ctx, "cores", _cores);
      const coreBonus = 1 + (cores - 1) / 16;
      return CONSTANTS.ServerWeakenAmount * threads * coreBonus * BitNodeMultipliers.ServerWeakenRate;
    },
  share: (ctx) => () => {
    helpers.log(ctx, () => "Sharing this computer.");
    const end = StartSharing(
      ctx.workerScript.scriptRef.threads * calculateIntelligenceBonus(Player.skills.intelligence, 2),
    );
    return helpers.netscriptDelay(ctx, 10000).finally(function () {
      helpers.log(ctx, () => "Finished sharing this computer.");
      end();
    });
  },
  getSharePower: () => () => {
    return CalculateShareMult();
  },
  print:
    (ctx) =>
    (...args) => {
      if (args.length === 0) {
        throw helpers.makeRuntimeErrorMsg(ctx, "Takes at least 1 argument.");
      }
      ctx.workerScript.print(helpers.argsToString(args));
    },
  printf:
    (ctx) =>
    (_format, ...args) => {
      const format = helpers.string(ctx, "format", _format);
      if (typeof format !== "string") {
        throw helpers.makeRuntimeErrorMsg(ctx, "First argument must be string for the format.");
      }
      ctx.workerScript.print(vsprintf(format, args));
    },
  tprint:
    (ctx) =>
    (...args) => {
      if (args.length === 0) {
        throw helpers.makeRuntimeErrorMsg(ctx, "Takes at least 1 argument.");
      }
      const str = helpers.argsToString(args);
      if (str.startsWith("ERROR") || str.startsWith("FAIL")) {
        Terminal.error(`${ctx.workerScript.name}: ${str}`);
        return;
      }
      if (str.startsWith("SUCCESS")) {
        Terminal.success(`${ctx.workerScript.name}: ${str}`);
        return;
      }
      if (str.startsWith("WARN")) {
        Terminal.warn(`${ctx.workerScript.name}: ${str}`);
        return;
      }
      if (str.startsWith("INFO")) {
        Terminal.info(`${ctx.workerScript.name}: ${str}`);
        return;
      }
      Terminal.print(`${ctx.workerScript.name}: ${str}`);
    },
  tprintf:
    (ctx) =>
    (_format, ...args) => {
      const format = helpers.string(ctx, "format", _format);
      const str = vsprintf(format, args);

      if (str.startsWith("ERROR") || str.startsWith("FAIL")) {
        Terminal.error(`${str}`);
        return;
      }
      if (str.startsWith("SUCCESS")) {
        Terminal.success(`${str}`);
        return;
      }
      if (str.startsWith("WARN")) {
        Terminal.warn(`${str}`);
        return;
      }
      if (str.startsWith("INFO")) {
        Terminal.info(`${str}`);
        return;
      }
      Terminal.print(`${str}`);
    },
  clearLog: (ctx) => () => {
    ctx.workerScript.scriptRef.clearLog();
  },
  disableLog: (ctx) => (_fn) => {
    const fn = helpers.string(ctx, "fn", _fn);
    if (fn === "ALL") {
      for (const fn of Object.keys(possibleLogs)) {
        ctx.workerScript.disableLogs[fn] = true;
      }
      helpers.log(ctx, () => `Disabled logging for all functions`);
    } else if (possibleLogs[fn] === undefined) {
      throw helpers.makeRuntimeErrorMsg(ctx, `Invalid argument: ${fn}.`);
    } else {
      ctx.workerScript.disableLogs[fn] = true;
      helpers.log(ctx, () => `Disabled logging for ${fn}`);
    }
  },
  enableLog: (ctx) => (_fn) => {
    const fn = helpers.string(ctx, "fn", _fn);
    if (fn === "ALL") {
      for (const fn of Object.keys(possibleLogs)) {
        delete ctx.workerScript.disableLogs[fn];
      }
      helpers.log(ctx, () => `Enabled logging for all functions`);
    } else if (possibleLogs[fn] === undefined) {
      throw helpers.makeRuntimeErrorMsg(ctx, `Invalid argument: ${fn}.`);
    }
    delete ctx.workerScript.disableLogs[fn];
    helpers.log(ctx, () => `Enabled logging for ${fn}`);
  },
  isLogEnabled: (ctx) => (_fn) => {
    const fn = helpers.string(ctx, "fn", _fn);
    if (possibleLogs[fn] === undefined) {
      throw helpers.makeRuntimeErrorMsg(ctx, `Invalid argument: ${fn}.`);
    }
    return !ctx.workerScript.disableLogs[fn];
  },
  getScriptLogs:
    (ctx) =>
    (scriptID, hostname, ...scriptArgs) => {
      const ident = helpers.scriptIdentifier(ctx, scriptID, hostname, scriptArgs);
      const runningScriptObj = helpers.getRunningScript(ctx, ident);
      if (runningScriptObj == null) {
        helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(ident));
        return [] as string[];
      }

      return runningScriptObj.logs.map((x) => "" + x);
    },
  tail:
    (ctx) =>
    (scriptID, hostname, ...scriptArgs) => {
      const ident = helpers.scriptIdentifier(ctx, scriptID, hostname, scriptArgs);
      const runningScriptObj = helpers.getRunningScript(ctx, ident);
      if (runningScriptObj == null) {
        helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(ident));
        return;
      }

      LogBoxEvents.emit(runningScriptObj);
    },
  moveTail:
    (ctx) =>
    (_x, _y, _pid = ctx.workerScript.scriptRef.pid) => {
      const x = helpers.number(ctx, "x", _x);
      const y = helpers.number(ctx, "y", _y);
      const pid = helpers.number(ctx, "pid", _pid);
      LogBoxPositionEvents.emit({ pid, data: { x, y } });
    },
  resizeTail:
    (ctx) =>
    (_w, _h, _pid = ctx.workerScript.scriptRef.pid) => {
      const w = helpers.number(ctx, "w", _w);
      const h = helpers.number(ctx, "h", _h);
      const pid = helpers.number(ctx, "pid", _pid);
      LogBoxSizeEvents.emit({ pid, data: { w, h } });
    },
  closeTail:
    (ctx) =>
    (_pid = ctx.workerScript.scriptRef.pid) => {
      const pid = helpers.number(ctx, "pid", _pid);
      //Emit an event to tell the game to close the tail window if it exists
      LogBoxCloserEvents.emit(pid);
    },
  nuke: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);

    const server = helpers.getServer(ctx, hostname);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return false;
    }
    if (server.hasAdminRights) {
      helpers.log(ctx, () => `Already have root access to '${server.hostname}'.`);
      return true;
    }
    if (!Player.hasProgram(CompletedProgramName.nuke)) {
      throw helpers.makeRuntimeErrorMsg(ctx, "You do not have the NUKE.exe virus!");
    }
    if (server.openPortCount < server.numOpenPortsRequired) {
      throw helpers.makeRuntimeErrorMsg(ctx, "Not enough ports opened to use NUKE.exe virus.");
    }
    server.hasAdminRights = true;
    helpers.log(ctx, () => `Executed NUKE.exe virus on '${server.hostname}' to gain root access.`);
    return true;
  },
  brutessh: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const server = helpers.getServer(ctx, hostname);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return false;
    }
    if (!Player.hasProgram(CompletedProgramName.bruteSsh)) {
      throw helpers.makeRuntimeErrorMsg(ctx, "You do not have the BruteSSH.exe program!");
    }
    if (!server.sshPortOpen) {
      helpers.log(ctx, () => `Executed BruteSSH.exe on '${server.hostname}' to open SSH port (22).`);
      server.sshPortOpen = true;
      ++server.openPortCount;
    } else {
      helpers.log(ctx, () => `SSH Port (22) already opened on '${server.hostname}'.`);
    }
    return true;
  },
  ftpcrack: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const server = helpers.getServer(ctx, hostname);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return false;
    }
    if (!Player.hasProgram(CompletedProgramName.ftpCrack)) {
      throw helpers.makeRuntimeErrorMsg(ctx, "You do not have the FTPCrack.exe program!");
    }
    if (!server.ftpPortOpen) {
      helpers.log(ctx, () => `Executed FTPCrack.exe on '${server.hostname}' to open FTP port (21).`);
      server.ftpPortOpen = true;
      ++server.openPortCount;
    } else {
      helpers.log(ctx, () => `FTP Port (21) already opened on '${server.hostname}'.`);
    }
    return true;
  },
  relaysmtp: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const server = helpers.getServer(ctx, hostname);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return false;
    }
    if (!Player.hasProgram(CompletedProgramName.relaySmtp)) {
      throw helpers.makeRuntimeErrorMsg(ctx, "You do not have the relaySMTP.exe program!");
    }
    if (!server.smtpPortOpen) {
      helpers.log(ctx, () => `Executed relaySMTP.exe on '${server.hostname}' to open SMTP port (25).`);
      server.smtpPortOpen = true;
      ++server.openPortCount;
    } else {
      helpers.log(ctx, () => `SMTP Port (25) already opened on '${server.hostname}'.`);
    }
    return true;
  },
  httpworm: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const server = helpers.getServer(ctx, hostname);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return false;
    }
    if (!Player.hasProgram(CompletedProgramName.httpWorm)) {
      throw helpers.makeRuntimeErrorMsg(ctx, "You do not have the HTTPWorm.exe program!");
    }
    if (!server.httpPortOpen) {
      helpers.log(ctx, () => `Executed HTTPWorm.exe on '${server.hostname}' to open HTTP port (80).`);
      server.httpPortOpen = true;
      ++server.openPortCount;
    } else {
      helpers.log(ctx, () => `HTTP Port (80) already opened on '${server.hostname}'.`);
    }
    return true;
  },
  sqlinject: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const server = helpers.getServer(ctx, hostname);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return false;
    }
    if (!Player.hasProgram(CompletedProgramName.sqlInject)) {
      throw helpers.makeRuntimeErrorMsg(ctx, "You do not have the SQLInject.exe program!");
    }
    if (!server.sqlPortOpen) {
      helpers.log(ctx, () => `Executed SQLInject.exe on '${server.hostname}' to open SQL port (1433).`);
      server.sqlPortOpen = true;
      ++server.openPortCount;
    } else {
      helpers.log(ctx, () => `SQL Port (1433) already opened on '${server.hostname}'.`);
    }
    return true;
  },
  run:
    (ctx) =>
    (_scriptname, _thread_or_opt = 1, ..._args) => {
      const path = resolveScriptFilePath(helpers.string(ctx, "scriptname", _scriptname), ctx.workerScript.name);
      if (!path) throw helpers.makeRuntimeErrorMsg(ctx, `${path} is not a valid script file path.`);
      const runOpts = helpers.runOptions(ctx, _thread_or_opt);
      const args = helpers.scriptArgs(ctx, _args);
      const scriptServer = ctx.workerScript.getServer();

      return runScriptFromScript("run", scriptServer, path, args, ctx.workerScript, runOpts);
    },
  exec:
    (ctx) =>
    (_scriptname, _hostname, _thread_or_opt = 1, ..._args) => {
      const path = resolveScriptFilePath(helpers.string(ctx, "scriptname", _scriptname), ctx.workerScript.name);
      if (!path) throw helpers.makeRuntimeErrorMsg(ctx, `${path} is not a valid script file path.`);
      const hostname = helpers.string(ctx, "hostname", _hostname);
      const runOpts = helpers.runOptions(ctx, _thread_or_opt);
      const args = helpers.scriptArgs(ctx, _args);
      const server = helpers.getServer(ctx, hostname);
      return runScriptFromScript("exec", server, path, args, ctx.workerScript, runOpts);
    },
  spawn:
    (ctx) =>
    (_scriptname, _thread_or_opt = 1, ..._args) => {
      const path = resolveScriptFilePath(helpers.string(ctx, "scriptname", _scriptname), ctx.workerScript.name);
      if (!path) throw helpers.makeRuntimeErrorMsg(ctx, `${path} is not a valid script file path.`);
      const runOpts = helpers.runOptions(ctx, _thread_or_opt);
      const args = helpers.scriptArgs(ctx, _args);
      const spawnDelay = 10;
      setTimeout(() => {
        const scriptServer = GetServer(ctx.workerScript.hostname);
        if (scriptServer == null) {
          throw helpers.makeRuntimeErrorMsg(ctx, "Could not find server. This is a bug. Report to dev");
        }

        return runScriptFromScript("spawn", scriptServer, path, args, ctx.workerScript, runOpts);
      }, spawnDelay * 1e3);

      helpers.log(ctx, () => `Will execute '${path}' in ${spawnDelay} seconds`);

      if (killWorkerScript(ctx.workerScript)) {
        helpers.log(ctx, () => "Exiting...");
      }
    },
  kill:
    (ctx) =>
    (scriptID, hostname = ctx.workerScript.hostname, ...scriptArgs) => {
      const ident = helpers.scriptIdentifier(ctx, scriptID, hostname, scriptArgs);
      let res;
      const killByPid = typeof ident === "number";
      if (killByPid) {
        // Kill by pid
        res = killWorkerScript(ident);
      } else {
        // Kill by filename/hostname
        if (scriptID === undefined) {
          throw helpers.makeRuntimeErrorMsg(ctx, "Usage: kill(scriptname, server, [arg1], [arg2]...)");
        }

        const server = helpers.getServer(ctx, ident.hostname);
        const runningScriptObj = helpers.getRunningScriptByArgs(ctx, ident.scriptname, ident.hostname, ident.args);
        if (runningScriptObj == null) {
          helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(ident));
          return false;
        }

        res = killWorkerScript({ runningScript: runningScriptObj, hostname: server.hostname });
      }

      if (res) {
        if (killByPid) {
          helpers.log(ctx, () => `Killing script with PID ${ident}`);
        } else {
          helpers.log(ctx, () => `Killing '${scriptID}' on '${hostname}' with args: ${arrayToString(scriptArgs)}.`);
        }
        return true;
      } else {
        if (killByPid) {
          helpers.log(ctx, () => `No script with PID ${ident}`);
        } else {
          helpers.log(
            ctx,
            () => `No such script '${scriptID}' on '${hostname}' with args: ${arrayToString(scriptArgs)}`,
          );
        }
        return false;
      }
    },
  killall:
    (ctx) =>
    (_hostname = ctx.workerScript.hostname, _safetyguard = true) => {
      const hostname = helpers.string(ctx, "hostname", _hostname);
      const safetyguard = !!_safetyguard;
      const server = helpers.getServer(ctx, hostname);

      let scriptsKilled = 0;

      for (let i = server.runningScripts.length - 1; i >= 0; --i) {
        if (safetyguard === true && server.runningScripts[i].pid == ctx.workerScript.pid) continue;
        killWorkerScript({ runningScript: server.runningScripts[i], hostname: server.hostname });
        ++scriptsKilled;
      }
      WorkerScriptStartStopEventEmitter.emit();
      helpers.log(
        ctx,
        () => `Killing all scripts on '${server.hostname}'. May take a few minutes for the scripts to die.`,
      );

      return scriptsKilled > 0;
    },
  exit: (ctx) => () => {
    helpers.log(ctx, () => "Exiting...");
    killWorkerScript(ctx.workerScript);
    throw new ScriptDeath(ctx.workerScript);
  },
  scp: (ctx) => (_files, _destination, _source) => {
    const destination = helpers.string(ctx, "destination", _destination);
    const source = helpers.string(ctx, "source", _source ?? ctx.workerScript.hostname);
    const destServer = helpers.getServer(ctx, destination);
    const sourceServer = helpers.getServer(ctx, source);
    const files = Array.isArray(_files) ? _files : [_files];
    const lits: (FilePath & LiteratureName)[] = [];
    const contentFiles: ContentFilePath[] = [];
    //First loop through filenames to find all errors before moving anything.
    for (const file of files) {
      // Not a string
      if (typeof file !== "string") {
        throw helpers.makeRuntimeErrorMsg(ctx, "files should be a string or an array of strings.");
      }
      if (hasScriptExtension(file) || hasTextExtension(file)) {
        const path = resolveScriptFilePath(file, ctx.workerScript.name);
        if (!path) throw helpers.makeRuntimeErrorMsg(ctx, `Invalid filepath: ${file}`);
        contentFiles.push(path);
        continue;
      }
      if (!file.endsWith(".lit")) {
        throw helpers.makeRuntimeErrorMsg(ctx, "Only works for scripts, .lit and .txt files.");
      }
      const sanitizedPath = resolveFilePath(file, ctx.workerScript.name);
      if (!sanitizedPath || !checkEnum(LiteratureName, sanitizedPath)) {
        throw helpers.makeRuntimeErrorMsg(ctx, `Invalid filename: '${file}'`);
      }
      lits.push(sanitizedPath);
    }

    let noFailures = true;
    // --- Scripts and Text Files---
    for (const contentFilePath of contentFiles) {
      const sourceContentFile = sourceServer.getContentFile(contentFilePath);
      if (!sourceContentFile) {
        helpers.log(ctx, () => `File '${contentFilePath}' does not exist.`);
        noFailures = false;
        continue;
      }
      // Overwrite script if it already exists
      const result = destServer.writeToContentFile(contentFilePath, sourceContentFile.content);
      helpers.log(ctx, () => `Copied file ${contentFilePath} from ${sourceServer} to ${destServer}`);
      if (result.overwritten) helpers.log(ctx, () => `Warning: ${contentFilePath} was overwritten on ${destServer}`);
    }

    // --- Literature Files ---
    for (const litFilePath of lits) {
      const sourceMessage = sourceServer.messages.find((message) => message === litFilePath);
      if (!sourceMessage) {
        helpers.log(ctx, () => `File '${litFilePath}' does not exist.`);
        noFailures = false;
        continue;
      }

      const destMessage = destServer.messages.find((message) => message === litFilePath);
      if (destMessage) {
        helpers.log(ctx, () => `File '${litFilePath}' was already on '${destServer?.hostname}'.`);
        continue;
      }

      destServer.messages.push(litFilePath);
      helpers.log(ctx, () => `File '${litFilePath}' copied over to '${destServer?.hostname}'.`);
      continue;
    }
    return noFailures;
  },
  ls: (ctx) => (_hostname, _substring) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const substring = helpers.string(ctx, "substring", _substring ?? "");
    const server = helpers.getServer(ctx, hostname);

    const allFilenames = [
      ...server.contracts.map((contract) => contract.fn),
      ...server.messages,
      ...server.programs,
      ...server.scripts.keys(),
      ...server.textFiles.keys(),
    ];

    if (!substring) return allFilenames.sort();
    return allFilenames.filter((filename) => filename.includes(substring)).sort();
  },
  getRecentScripts: () => (): RecentScript[] => {
    return recentScripts.map((rs) => ({
      timeOfDeath: rs.timeOfDeath,
      ...helpers.createPublicRunningScript(rs.runningScript),
    }));
  },
  ps:
    (ctx) =>
    (_hostname = ctx.workerScript.hostname) => {
      const hostname = helpers.string(ctx, "hostname", _hostname);
      const server = helpers.getServer(ctx, hostname);
      const processes: ProcessInfo[] = [];
      for (const script of server.runningScripts) {
        processes.push({
          filename: script.filename,
          threads: script.threads,
          args: script.args.slice(),
          pid: script.pid,
          temporary: script.temporary,
        });
      }
      return processes;
    },
  hasRootAccess: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const server = helpers.getServer(ctx, hostname);
    return server.hasAdminRights;
  },
  getHostname: (ctx) => () => ctx.workerScript.hostname,
  getHackingLevel: (ctx) => () => {
    Player.updateSkillLevels();
    helpers.log(ctx, () => `returned ${Player.skills.hacking}`);
    return Player.skills.hacking;
  },
  getHackingMultipliers: () => () => {
    return {
      chance: Player.mults.hacking_chance,
      speed: Player.mults.hacking_speed,
      money: Player.mults.hacking_money,
      growth: Player.mults.hacking_grow,
    };
  },
  getHacknetMultipliers: () => () => {
    return {
      production: Player.mults.hacknet_node_money,
      purchaseCost: Player.mults.hacknet_node_purchase_cost,
      ramCost: Player.mults.hacknet_node_ram_cost,
      coreCost: Player.mults.hacknet_node_core_cost,
      levelCost: Player.mults.hacknet_node_level_cost,
    };
  },
  getBitNodeMultipliers:
    (ctx) =>
    (_n = Player.bitNodeN, _lvl = Player.sourceFileLvl(Player.bitNodeN) + 1): IBitNodeMultipliers => {
      if (Player.sourceFileLvl(5) <= 0 && Player.bitNodeN !== 5)
        throw helpers.makeRuntimeErrorMsg(ctx, "Requires Source-File 5 to run.");
      const n = Math.round(helpers.number(ctx, "n", _n));
      const lvl = Math.round(helpers.number(ctx, "lvl", _lvl));
      if (n < 1 || n > 13) throw new Error("n must be between 1 and 13");
      if (lvl < 1) throw new Error("lvl must be >= 1");

      return Object.assign({}, getBitNodeMultipliers(n, lvl));
    },
  getServer: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
    const server = helpers.getServer(ctx, hostname);
    return {
      hostname: server.hostname,
      ip: server.ip,
      sshPortOpen: server.sshPortOpen,
      ftpPortOpen: server.ftpPortOpen,
      smtpPortOpen: server.smtpPortOpen,
      httpPortOpen: server.httpPortOpen,
      sqlPortOpen: server.sqlPortOpen,
      hasAdminRights: server.hasAdminRights,
      cpuCores: server.cpuCores,
      isConnectedTo: server.isConnectedTo,
      ramUsed: server.ramUsed,
      maxRam: server.maxRam,
      organizationName: server.organizationName,
      purchasedByPlayer: server.purchasedByPlayer,
      backdoorInstalled: server.backdoorInstalled,
      baseDifficulty: server.baseDifficulty,
      hackDifficulty: server.hackDifficulty,
      minDifficulty: server.minDifficulty,
      moneyAvailable: server.moneyAvailable,
      moneyMax: server.moneyMax,
      numOpenPortsRequired: server.numOpenPortsRequired,
      openPortCount: server.openPortCount,
      requiredHackingSkill: server.requiredHackingSkill,
      serverGrowth: server.serverGrowth,
    };
  },
  getServerMoneyAvailable: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const server = helpers.getServer(ctx, hostname);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 0;
    }
    if (helpers.failOnHacknetServer(ctx, server)) {
      return 0;
    }
    if (server.hostname == "home") {
      // Return player's money
      helpers.log(ctx, () => `returned player's money: ${formatMoney(Player.money)}`);
      return Player.money;
    }
    helpers.log(ctx, () => `returned ${formatMoney(server.moneyAvailable)} for '${server.hostname}'`);
    return server.moneyAvailable;
  },
  getServerSecurityLevel: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const server = helpers.getServer(ctx, hostname);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 1;
    }
    if (helpers.failOnHacknetServer(ctx, server)) {
      return 1;
    }
    helpers.log(ctx, () => `returned ${formatSecurity(server.hackDifficulty)} for '${server.hostname}'`);
    return server.hackDifficulty;
  },
  getServerBaseSecurityLevel: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const server = helpers.getServer(ctx, hostname);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 1;
    }
    if (helpers.failOnHacknetServer(ctx, server)) {
      return 1;
    }
    helpers.log(ctx, () => `returned ${formatSecurity(server.baseDifficulty)} for '${server.hostname}'`);
    return server.baseDifficulty;
  },
  getServerMinSecurityLevel: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const server = helpers.getServer(ctx, hostname);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 1;
    }
    if (helpers.failOnHacknetServer(ctx, server)) {
      return 1;
    }
    helpers.log(ctx, () => `returned ${formatSecurity(server.minDifficulty)} for ${server.hostname}`);
    return server.minDifficulty;
  },
  getServerRequiredHackingLevel: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const server = helpers.getServer(ctx, hostname);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 1;
    }
    if (helpers.failOnHacknetServer(ctx, server)) {
      return 1;
    }
    helpers.log(ctx, () => `returned ${formatNumberNoSuffix(server.requiredHackingSkill, 0)} for '${server.hostname}'`);
    return server.requiredHackingSkill;
  },
  getServerMaxMoney: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const server = helpers.getServer(ctx, hostname);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 0;
    }
    if (helpers.failOnHacknetServer(ctx, server)) {
      return 0;
    }
    helpers.log(ctx, () => `returned ${formatMoney(server.moneyMax)} for '${server.hostname}'`);
    return server.moneyMax;
  },
  getServerGrowth: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const server = helpers.getServer(ctx, hostname);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 1;
    }
    if (helpers.failOnHacknetServer(ctx, server)) {
      return 1;
    }
    helpers.log(ctx, () => `returned ${server.serverGrowth} for '${server.hostname}'`);
    return server.serverGrowth;
  },
  getServerNumPortsRequired: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const server = helpers.getServer(ctx, hostname);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => "Cannot be executed on this server.");
      return 5;
    }
    if (helpers.failOnHacknetServer(ctx, server)) {
      return 5;
    }
    helpers.log(ctx, () => `returned ${server.numOpenPortsRequired} for '${server.hostname}'`);
    return server.numOpenPortsRequired;
  },
  getServerMaxRam: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const server = helpers.getServer(ctx, hostname);
    helpers.log(ctx, () => `returned ${formatRam(server.maxRam)}`);
    return server.maxRam;
  },
  getServerUsedRam: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const server = helpers.getServer(ctx, hostname);
    helpers.log(ctx, () => `returned ${formatRam(server.ramUsed)}`);
    return server.ramUsed;
  },
  serverExists: (ctx) => (_hostname) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    return GetServer(hostname) !== null;
  },
  fileExists:
    (ctx) =>
    (_filename, _hostname = ctx.workerScript.hostname) => {
      const filename = helpers.string(ctx, "filename", _filename);
      const hostname = helpers.string(ctx, "hostname", _hostname);
      const server = helpers.getServer(ctx, hostname);
      if (server.scripts.has(filename) || server.textFiles.has(filename)) return true;
      for (let i = 0; i < server.programs.length; ++i) {
        if (filename.toLowerCase() == server.programs[i].toLowerCase()) {
          return true;
        }
      }
      for (let i = 0; i < server.messages.length; ++i) {
        if (filename.toLowerCase() === server.messages[i].toLowerCase()) {
          return true;
        }
      }
      const contract = server.contracts.find((c) => c.fn.toLowerCase() === filename.toLowerCase());
      if (contract) return true;
      return false;
    },
  isRunning:
    (ctx) =>
    (fn, hostname, ...scriptArgs) => {
      const ident = helpers.scriptIdentifier(ctx, fn, hostname, scriptArgs);
      return helpers.getRunningScript(ctx, ident) !== null;
    },
  getPurchasedServerLimit: () => () => {
    return getPurchaseServerLimit();
  },
  getPurchasedServerMaxRam: () => () => {
    return getPurchaseServerMaxRam();
  },
  getPurchasedServerCost: (ctx) => (_ram) => {
    const ram = helpers.number(ctx, "ram", _ram);

    const cost = getPurchaseServerCost(ram);
    if (cost === Infinity) {
      helpers.log(ctx, () => `Invalid argument: ram='${ram}'`);
      return Infinity;
    }

    return cost;
  },
  purchaseServer: (ctx) => (_name, _ram) => {
    const name = helpers.string(ctx, "name", _name);
    const ram = helpers.number(ctx, "ram", _ram);
    let hostnameStr = String(name);
    hostnameStr = hostnameStr.replace(/\s+/g, "");
    if (hostnameStr == "") {
      helpers.log(ctx, () => `Invalid argument: hostname='${hostnameStr}'`);
      return "";
    }

    if (Player.purchasedServers.length >= getPurchaseServerLimit()) {
      helpers.log(
        ctx,
        () =>
          `You have reached the maximum limit of ${getPurchaseServerLimit()} servers. You cannot purchase any more.`,
      );
      return "";
    }

    const cost = getPurchaseServerCost(ram);
    if (cost === Infinity) {
      if (ram > getPurchaseServerMaxRam()) {
        helpers.log(ctx, () => `Invalid argument: ram='${ram}' must not be greater than getPurchaseServerMaxRam`);
      } else {
        helpers.log(ctx, () => `Invalid argument: ram='${ram}' must be a positive power of 2`);
      }

      return "";
    }

    if (Player.money < cost) {
      helpers.log(ctx, () => `Not enough money to purchase server. Need ${formatMoney(cost)}`);
      return "";
    }
    const newServ = safelyCreateUniqueServer({
      ip: createUniqueRandomIp(),
      hostname: hostnameStr,
      organizationName: "",
      isConnectedTo: false,
      adminRights: true,
      purchasedByPlayer: true,
      maxRam: ram,
    });
    AddToAllServers(newServ);

    Player.purchasedServers.push(newServ.hostname);
    const homeComputer = Player.getHomeComputer();
    homeComputer.serversOnNetwork.push(newServ.hostname);
    newServ.serversOnNetwork.push(homeComputer.hostname);
    Player.loseMoney(cost, "servers");
    helpers.log(ctx, () => `Purchased new server with hostname '${newServ.hostname}' for ${formatMoney(cost)}`);
    return newServ.hostname;
  },

  getPurchasedServerUpgradeCost: (ctx) => (_hostname, _ram) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const ram = helpers.number(ctx, "ram", _ram);
    try {
      return getPurchasedServerUpgradeCost(hostname, ram);
    } catch (err) {
      helpers.log(ctx, () => String(err));
      return -1;
    }
  },

  upgradePurchasedServer: (ctx) => (_hostname, _ram) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const ram = helpers.number(ctx, "ram", _ram);
    try {
      upgradePurchasedServer(hostname, ram);
      return true;
    } catch (err) {
      helpers.log(ctx, () => String(err));
      return false;
    }
  },

  renamePurchasedServer: (ctx) => (_hostname, _newName) => {
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const newName = helpers.string(ctx, "newName", _newName);
    try {
      renamePurchasedServer(hostname, newName);
      return true;
    } catch (err) {
      helpers.log(ctx, () => String(err));
      return false;
    }
  },

  deleteServer: (ctx) => (_name) => {
    const name = helpers.string(ctx, "name", _name);
    let hostnameStr = String(name);
    hostnameStr = hostnameStr.replace(/\s\s+/g, "");
    const server = GetServer(hostnameStr);
    if (!(server instanceof Server)) {
      helpers.log(ctx, () => `Invalid argument: hostname='${hostnameStr}'`);
      return false;
    }

    if (!server.purchasedByPlayer || server.hostname === "home") {
      helpers.log(ctx, () => "Cannot delete non-purchased server.");
      return false;
    }

    const hostname = server.hostname;

    // Can't delete server you're currently connected to
    if (server.isConnectedTo) {
      helpers.log(ctx, () => "You are currently connected to the server you are trying to delete.");
      return false;
    }

    // A server cannot delete itself
    if (hostname === ctx.workerScript.hostname) {
      helpers.log(ctx, () => "Cannot delete the server this script is running on.");
      return false;
    }

    // Delete all scripts running on server
    if (server.runningScripts.length > 0) {
      helpers.log(ctx, () => `Cannot delete server '${hostname}' because it still has scripts running.`);
      return false;
    }

    // Delete from player's purchasedServers array
    let found = false;
    for (let i = 0; i < Player.purchasedServers.length; ++i) {
      if (hostname == Player.purchasedServers[i]) {
        found = true;
        Player.purchasedServers.splice(i, 1);
        break;
      }
    }

    if (!found) {
      helpers.log(
        ctx,
        () => `Could not identify server ${hostname} as a purchased server. This is a bug. Report to dev.`,
      );
      return false;
    }

    // Delete from all servers
    DeleteServer(hostname);

    // Delete from home computer
    found = false;
    const homeComputer = Player.getHomeComputer();
    for (let i = 0; i < homeComputer.serversOnNetwork.length; ++i) {
      if (hostname == homeComputer.serversOnNetwork[i]) {
        homeComputer.serversOnNetwork.splice(i, 1);
        helpers.log(ctx, () => `Deleted server '${hostnameStr}`);
        return true;
      }
    }
    // Wasn't found on home computer
    helpers.log(ctx, () => `Could not find server ${hostname} as a purchased server. This is a bug. Report to dev.`);
    return false;
  },
  getPurchasedServers: () => (): string[] => {
    const res: string[] = [];
    Player.purchasedServers.forEach(function (hostname) {
      res.push(hostname);
    });
    return res;
  },
  writePort: (ctx) => (_portNumber, data) => {
    const portNumber = helpers.portNumber(ctx, _portNumber);
    if (typeof data !== "string" && typeof data !== "number") {
      throw helpers.makeRuntimeErrorMsg(
        ctx,
        `Trying to write invalid data to a port: only strings and numbers are valid.`,
      );
    }
    return writePort(portNumber, data);
  },
  write: (ctx) => (_filename, _data, _mode) => {
    const filepath = resolveFilePath(helpers.string(ctx, "filename", _filename), ctx.workerScript.name);
    const data = helpers.string(ctx, "data", _data ?? "");
    const mode = helpers.string(ctx, "mode", _mode ?? "a");

    if (!filepath) throw helpers.makeRuntimeErrorMsg(ctx, `Invalid filepath: ${filepath}`);

    const server = helpers.getServer(ctx, ctx.workerScript.hostname);

    if (hasScriptExtension(filepath)) {
      if (mode === "w") {
        server.writeToScriptFile(filepath, data);
        return;
      }
      const existingScript = server.scripts.get(filepath);
      const existingCode = existingScript ? existingScript.code : "";
      server.writeToScriptFile(filepath, existingCode + data);
      return;
    }
    if (!hasTextExtension(filepath)) {
      throw helpers.makeRuntimeErrorMsg(ctx, `File path should be a text file or script. ${filepath} is invalid.`);
    }
    if (mode === "w") {
      server.writeToTextFile(filepath, data);
      return;
    }
    const existingTextFile = server.textFiles.get(filepath);
    const existingText = existingTextFile?.text ?? "";
    server.writeToTextFile(filepath, mode === "w" ? data : existingText + data);
  },
  tryWritePort: (ctx) => (_portNumber, data) => {
    const portNumber = helpers.portNumber(ctx, _portNumber);
    if (typeof data !== "string" && typeof data !== "number") {
      throw helpers.makeRuntimeErrorMsg(
        ctx,
        `Trying to write invalid data to a port: only strings and numbers are valid.`,
      );
    }
    return tryWritePort(portNumber, data);
  },
  readPort: (ctx) => (_portNumber) => {
    const portNumber = helpers.portNumber(ctx, _portNumber);
    return readPort(portNumber);
  },
  read: (ctx) => (_filename) => {
    const path = resolveFilePath(helpers.string(ctx, "filename", _filename), ctx.workerScript.name);
    if (!path || (!hasScriptExtension(path) && !hasTextExtension(path))) return "";
    const server = ctx.workerScript.getServer();
    return server.getContentFile(path)?.content ?? "";
  },
  peek: (ctx) => (_portNumber) => {
    const portNumber = helpers.portNumber(ctx, _portNumber);
    return peekPort(portNumber);
  },
  clear: (ctx) => (_file) => {
    const path = resolveFilePath(helpers.string(ctx, "file", _file), ctx.workerScript.name);
    if (!path || (!hasScriptExtension(path) && !hasTextExtension(path))) {
      throw helpers.makeRuntimeErrorMsg(ctx, `Invalid file path or extension: ${_file}`);
    }
    const server = ctx.workerScript.getServer();
    const file = server.getContentFile(path);
    if (!file) throw helpers.makeRuntimeErrorMsg(ctx, `${path} does not exist on ${server.hostname}`);
    // The content setter handles invalidating script modules where applicable.
    file.content = "";
  },
  clearPort: (ctx) => (_portNumber) => {
    const portNumber = helpers.portNumber(ctx, _portNumber);
    return clearPort(portNumber);
  },
  getPortHandle: (ctx) => (_portNumber) => {
    const portNumber = helpers.portNumber(ctx, _portNumber);
    return portHandle(portNumber);
  },
  rm: (ctx) => (_fn, _hostname) => {
    const filepath = resolveFilePath(helpers.string(ctx, "fn", _fn), ctx.workerScript.name);
    const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
    const s = helpers.getServer(ctx, hostname);
    if (!filepath) {
      helpers.log(ctx, () => `Error while parsing filepath ${filepath}`);
      return false;
    }

    const status = s.removeFile(filepath);
    if (!status.res) {
      helpers.log(ctx, () => status.msg + "");
    }

    return status.res;
  },
  scriptRunning: (ctx) => (_scriptname, _hostname) => {
    const scriptname = helpers.string(ctx, "scriptname", _scriptname);
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const server = helpers.getServer(ctx, hostname);
    for (let i = 0; i < server.runningScripts.length; ++i) {
      if (server.runningScripts[i].filename == scriptname) {
        return true;
      }
    }
    return false;
  },
  scriptKill: (ctx) => (_scriptname, _hostname) => {
    const scriptname = helpers.string(ctx, "scriptname", _scriptname);
    const hostname = helpers.string(ctx, "hostname", _hostname);
    const server = helpers.getServer(ctx, hostname);
    let suc = false;
    for (let i = 0; i < server.runningScripts.length; i++) {
      if (server.runningScripts[i].filename == scriptname) {
        killWorkerScript({ runningScript: server.runningScripts[i], hostname: server.hostname });
        suc = true;
        i--;
      }
    }
    return suc;
  },
  getScriptName: (ctx) => () => ctx.workerScript.name,
  getScriptRam: (ctx) => (_scriptname, _hostname) => {
    const path = resolveScriptFilePath(helpers.string(ctx, "scriptname", _scriptname), ctx.workerScript.name);
    if (!path) throw helpers.makeRuntimeErrorMsg(ctx, `Could not parse file path ${_scriptname}`);
    const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
    const server = helpers.getServer(ctx, hostname);
    const script = server.scripts.get(path);
    if (!script) return 0;
    const ramUsage = script.getRamUsage(server.scripts);
    if (!ramUsage) {
      helpers.log(ctx, () => `Could not calculate ram usage for ${path} on ${hostname}.`);
      return 0;
    }
    return ramUsage;
  },
  getRunningScript:
    (ctx) =>
    (fn, hostname, ...args) => {
      const ident = helpers.scriptIdentifier(ctx, fn, hostname, args);
      const runningScript = helpers.getRunningScript(ctx, ident);
      if (runningScript === null) return null;
      return helpers.createPublicRunningScript(runningScript);
    },
  getHackTime:
    (ctx) =>
    (_hostname = ctx.workerScript.hostname) => {
      const hostname = helpers.string(ctx, "hostname", _hostname);
      const server = helpers.getServer(ctx, hostname);
      if (!(server instanceof Server)) {
        helpers.log(ctx, () => "invalid for this kind of server");
        return Infinity;
      }
      if (helpers.failOnHacknetServer(ctx, server)) {
        return Infinity;
      }

      return calculateHackingTime(server, Player) * 1000;
    },
  getGrowTime:
    (ctx) =>
    (_hostname = ctx.workerScript.hostname) => {
      const hostname = helpers.string(ctx, "hostname", _hostname);
      const server = helpers.getServer(ctx, hostname);
      if (!(server instanceof Server)) {
        helpers.log(ctx, () => "invalid for this kind of server");
        return Infinity;
      }
      if (helpers.failOnHacknetServer(ctx, server)) {
        return Infinity;
      }

      return calculateGrowTime(server, Player) * 1000;
    },
  getWeakenTime:
    (ctx) =>
    (_hostname = ctx.workerScript.hostname) => {
      const hostname = helpers.string(ctx, "hostname", _hostname);
      const server = helpers.getServer(ctx, hostname);
      if (!(server instanceof Server)) {
        helpers.log(ctx, () => "invalid for this kind of server");
        return Infinity;
      }
      if (helpers.failOnHacknetServer(ctx, server)) {
        return Infinity;
      }

      return calculateWeakenTime(server, Player) * 1000;
    },
  getTotalScriptIncome: () => () => {
    // First element is total income of all currently running scripts
    let total = 0;
    for (const script of workerScripts.values()) {
      total += script.scriptRef.onlineMoneyMade / script.scriptRef.onlineRunningTime;
    }

    return [total, Player.scriptProdSinceLastAug / (Player.playtimeSinceLastAug / 1000)];
  },
  getScriptIncome:
    (ctx) =>
    (fn, hostname, ...args) => {
      const ident = helpers.scriptIdentifier(ctx, fn, hostname, args);
      const runningScript = helpers.getRunningScript(ctx, ident);
      if (runningScript == null) {
        helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(ident));
        return -1;
      }
      return runningScript.onlineMoneyMade / runningScript.onlineRunningTime;
    },
  getTotalScriptExpGain: () => () => {
    let total = 0;
    for (const ws of workerScripts.values()) {
      total += ws.scriptRef.onlineExpGained / ws.scriptRef.onlineRunningTime;
    }
    return total;
  },
  getScriptExpGain:
    (ctx) =>
    (fn, hostname, ...args) => {
      const ident = helpers.scriptIdentifier(ctx, fn, hostname, args);
      const runningScript = helpers.getRunningScript(ctx, ident);
      if (runningScript == null) {
        helpers.log(ctx, () => helpers.getCannotFindRunningScriptErrorMessage(ident));
        return -1;
      }
      return runningScript.onlineExpGained / runningScript.onlineRunningTime;
    },
  formatNumber:
    (ctx) =>
    (_n, _fractionalDigits = 3, _suffixStart = 1000, isInteger) => {
      const n = helpers.number(ctx, "n", _n);
      const fractionalDigits = helpers.number(ctx, "fractionalDigits", _fractionalDigits);
      const suffixStart = helpers.number(ctx, "suffixStart", _suffixStart);
      return formatNumber(n, fractionalDigits, suffixStart, !!isInteger);
    },
  formatRam:
    (ctx) =>
    (_n, _fractionalDigits = 2) => {
      const n = helpers.number(ctx, "n", _n);
      const fractionalDigits = helpers.number(ctx, "fractionalDigits", _fractionalDigits);
      return formatRam(n, fractionalDigits);
    },
  formatPercent:
    (ctx) =>
    (_n, _fractionalDigits = 2, _multStart = 1e6) => {
      const n = helpers.number(ctx, "n", _n);
      const fractionalDigits = helpers.number(ctx, "fractionalDigits", _fractionalDigits);
      const multStart = helpers.number(ctx, "multStart", _multStart);
      return formatPercent(n, fractionalDigits, multStart);
    },
  // Todo: Remove function for real though in 2.4. Until then it just directly wraps numeral.
  nFormat: (ctx) => (_n, _format) => {
    deprecationWarning(
      "ns.nFormat",
      "Use ns.formatNumber, formatRam, formatPercent, or js builtins like Intl.NumberFormat instead.",
    );
    const n = helpers.number(ctx, "n", _n);
    const format = helpers.string(ctx, "format", _format);
    return numeral(n).format(format);
  },
  tFormat: (ctx) => (_milliseconds, _milliPrecision) => {
    const milliseconds = helpers.number(ctx, "milliseconds", _milliseconds);
    const milliPrecision = !!_milliPrecision;
    return convertTimeMsToTimeElapsedString(milliseconds, milliPrecision);
  },
  getTimeSinceLastAug: () => () => {
    deprecationWarning("ns.getTimeSinceLastAug()", "Use ns.getResetInfo().lastAugReset instead.");
    return Player.playtimeSinceLastAug;
  },
  alert: (ctx) => (_message) => {
    const message = helpers.string(ctx, "message", _message);
    dialogBoxCreate(message, true);
  },
  toast:
    (ctx) =>
    (_message, _variant = ToastVariant.SUCCESS, _duration = 2000) => {
      const message = helpers.string(ctx, "message", _message);
      const variant = helpers.string(ctx, "variant", _variant);
      const duration = _duration === null ? null : helpers.number(ctx, "duration", _duration);
      if (!checkEnum(ToastVariant, variant))
        throw new Error(`variant must be one of ${Object.values(ToastVariant).join(", ")}`);
      SnackbarEvents.emit(message, variant as ToastVariant, duration);
    },
  prompt: (ctx) => (_txt, _options) => {
    const options: { type?: string; choices?: string[] } = {};
    _options ??= options;
    const txt = helpers.string(ctx, "txt", _txt);
    assert(_options, objectAssert, (type) =>
      helpers.makeRuntimeErrorMsg(ctx, `Invalid type for options: ${type}. Should be object.`, "TYPE"),
    );
    if (_options.type !== undefined) {
      assert(_options.type, stringAssert, (type) =>
        helpers.makeRuntimeErrorMsg(ctx, `Invalid type for options.type: ${type}. Should be string.`, "TYPE"),
      );
      options.type = _options.type;
      const validTypes = ["boolean", "text", "select"];
      if (!["boolean", "text", "select"].includes(options.type)) {
        throw helpers.makeRuntimeErrorMsg(
          ctx,
          `Invalid value for options.type: ${options.type}. Must be one of ${validTypes.join(", ")}.`,
        );
      }
      if (options.type === "select") {
        assert(_options.choices, arrayAssert, (type) =>
          helpers.makeRuntimeErrorMsg(
            ctx,
            `Invalid type for options.choices: ${type}. If options.type is "select", options.choices must be an array.`,
            "TYPE",
          ),
        );
        options.choices = _options.choices.map((choice, i) => helpers.string(ctx, `options.choices[${i}]`, choice));
      }
    }
    return new Promise(function (resolve) {
      PromptEvent.emit({
        txt: txt,
        options,
        resolve: resolve,
      });
    });
  },
  wget: (ctx) => async (_url, _target, _hostname) => {
    const url = helpers.string(ctx, "url", _url);
    const target = resolveFilePath(helpers.string(ctx, "target", _target), ctx.workerScript.name);
    const hostname = _hostname ? helpers.string(ctx, "hostname", _hostname) : ctx.workerScript.hostname;
    const server = helpers.getServer(ctx, hostname);
    if (!target || (!hasTextExtension(target) && !hasScriptExtension(target))) {
      helpers.log(ctx, () => `Invalid target file: '${target}'. Must be a script or text file.`);
      return Promise.resolve(false);
    }
    return new Promise(function (resolve) {
      $.get(
        url,
        function (data) {
          let res;
          if (hasScriptExtension(target)) {
            res = server.writeToScriptFile(target, data);
          } else {
            res = server.writeToTextFile(target, data);
          }
          if (res.overwritten) {
            helpers.log(ctx, () => `Successfully retrieved content and overwrote '${target}' on '${hostname}'`);
            return resolve(true);
          }
          helpers.log(ctx, () => `Successfully retrieved content to new file '${target}' on '${hostname}'`);
          return resolve(true);
        },
        "text",
      ).fail(function (e) {
        helpers.log(ctx, () => JSON.stringify(e));
        return resolve(false);
      });
    });
  },
  getFavorToDonate: () => () => {
    return Math.floor(CONSTANTS.BaseFavorToDonate * BitNodeMultipliers.RepToDonateToFaction);
  },
  getPlayer: () => () => {
    const data = {
      // Person
      hp: cloneDeep(Player.hp),
      skills: cloneDeep(Player.skills),
      exp: cloneDeep(Player.exp),
      mults: cloneDeep(Player.mults),
      city: Player.city,
      // Player-specific
      numPeopleKilled: Player.numPeopleKilled,
      money: Player.money,
      location: Player.location,
      totalPlaytime: Player.totalPlaytime,
      jobs: cloneDeep(Player.jobs),
      factions: Player.factions.slice(),
      entropy: Player.entropy,
    };
    setDeprecatedProperties(data, {
      playtimeSinceLastAug: {
        identifier: "ns.getPlayer().playtimeSinceLastAug",
        message: "Use ns.getResetInfo().lastAugReset instead. This is a static timestamp instead of an elapsed time.",
        value: Player.playtimeSinceLastAug,
      },
      playtimeSinceLastBitnode: {
        identifier: "ns.getPlayer().playtimeSinceLastBitnode",
        message: "Use ns.getResetInfo().lastNodeReset instead. This is a static timestamp instead of an elapsed time.",
        value: Player.playtimeSinceLastBitnode,
      },
      bitNodeN: {
        identifier: "ns.getPlayer().bitNodeN",
        message: "Use ns.getResetInto().currentNode instead",
        value: Player.bitNodeN,
      },
    });
    return data;
  },
  getMoneySources: () => () => ({
    sinceInstall: Object.assign({}, Player.moneySourceA),
    sinceStart: Object.assign({}, Player.moneySourceB),
  }),
  atExit: (ctx) => (f) => {
    if (typeof f !== "function") {
      throw helpers.makeRuntimeErrorMsg(ctx, "argument should be function");
    }
    ctx.workerScript.atExit = () => {
      f();
    }; // Wrap the user function to prevent WorkerScript leaking as 'this'
  },
  mv: (ctx) => (_host, _source, _destination) => {
    const hostname = helpers.string(ctx, "host", _host);
    const server = helpers.getServer(ctx, hostname);
    const sourcePath = resolveFilePath(helpers.string(ctx, "source", _source));
    if (!sourcePath) throw helpers.makeRuntimeErrorMsg(ctx, `Invalid source filename: '${_source}'`);
    const destinationPath = resolveFilePath(helpers.string(ctx, "destination", _destination), sourcePath);
    if (!destinationPath) throw helpers.makeRuntimeErrorMsg(ctx, `Invalid destination filename: '${destinationPath}'`);

    if (
      (!hasTextExtension(sourcePath) && !hasScriptExtension(sourcePath)) ||
      (!hasTextExtension(destinationPath) && !hasScriptExtension(destinationPath))
    ) {
      throw helpers.makeRuntimeErrorMsg(ctx, `'mv' can only be used on scripts and text files (.txt)`);
    }
    if (sourcePath === destinationPath) {
      helpers.log(ctx, () => "WARNING: Did nothing, source and destination paths were the same.");
      return;
    }
    const sourceContentFile = server.getContentFile(sourcePath);
    if (!sourceContentFile) {
      throw helpers.makeRuntimeErrorMsg(ctx, `Source text file ${sourcePath} does not exist on ${hostname}`);
    }
    const success = sourceContentFile.deleteFromServer(server);
    if (success) {
      const { overwritten } = server.writeToContentFile(destinationPath, sourceContentFile.content);
      if (overwritten) helpers.log(ctx, () => `WARNING: Overwriting file ${destinationPath} on ${hostname}`);
      helpers.log(ctx, () => `Moved ${sourcePath} to ${destinationPath} on ${hostname}`);
      return;
    }
    helpers.log(ctx, () => `ERROR: Failed. Was unable to remove file ${sourcePath} from its original location.`);
  },
  getResetInfo: () => () => ({
    lastAugReset: Player.lastAugReset,
    lastNodeReset: Player.lastNodeReset,
    currentNode: Player.bitNodeN,
  }),
  flags: Flags,
  ...NetscriptExtra(),
};
// Object.assign to bypass ts for removedFunctions which have no documentation or ramcost
Object.assign(ns, {
  getServerRam: removedFunction("v2.2.0", "getServerMaxRam and getServerUsedRam"),
});

export function NetscriptFunctions(ws: WorkerScript): NSFull {
  return NSProxy(ws, ns, [], { args: ws.args.slice(), pid: ws.pid, enums });
}

const possibleLogs = Object.fromEntries([...getFunctionNames(ns, "")].map((a) => [a, true]));
/** Provides an array of all function names on a nested object */
function getFunctionNames(obj: object, prefix: string): string[] {
  const functionNames: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key === "args") {
      continue;
    } else if (typeof value == "function") {
      functionNames.push(prefix + key);
    } else if (typeof value == "object") {
      functionNames.push(...getFunctionNames(value, key + "."));
    }
  }
  return functionNames;
}

const deprecatedWarningsGiven = new Set();
function setDeprecatedProperties(
  obj: object,
  properties: Record<string, { identifier: string; message: string; value: any }>,
) {
  for (const [name, info] of Object.entries(properties)) {
    Object.defineProperty(obj, name, {
      get: () => {
        deprecationWarning(info.identifier, info.message);
        return info.value;
      },
      set: (value: any) => (info.value = value),
      enumerable: true,
    });
  }
}
function deprecationWarning(identifier: string, message: string) {
  if (!deprecatedWarningsGiven.has(identifier)) {
    deprecatedWarningsGiven.add(identifier);
    Terminal.warn(`Accessed deprecated function or property: ${identifier}`);
    Terminal.warn(`This is no longer supported usage and will be removed in a later version.`);
    Terminal.warn(message);
    Terminal.info(`This message can also appear for object properties when the object's values are iterated.`);
    Terminal.info(`This message will only be shown once per game session for each deprecated item accessed.`);
  }
}
