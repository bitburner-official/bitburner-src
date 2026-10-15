import { Program } from "./Program";
import { CONSTANTS } from "../Constants";
import { BaseServer } from "../Server/BaseServer";
import { Server } from "../Server/Server";
import { Terminal } from "../Terminal";
import { Player } from "@player";
import { convertTimeMsToTimeElapsedString } from "../utils/StringHelperFunctions";
import { GetServer } from "../Server/AllServers";
import { formatMoney } from "../ui/formatNumber";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { BitFlumeEvent } from "../BitNode/ui/BitFlumeModal";
import { calculateHackingTime, calculateGrowTime, calculateWeakenTime } from "../Hacking";
import { CompletedProgramName, FactionName } from "@enums";
import { Router } from "../ui/GameRoot";
import { Page } from "../ui/Router";
import { knowAboutBitverse } from "../BitNode/BitNodeUtils";
import { handleStormSeed } from "../DarkNet/effects/webstorm";
import { clampNumber } from "../utils/helpers/clampNumber";
import type { StdIO } from "../Terminal/StdIO/StdIO";

function requireHackingLevel(lvl: number) {
  return function () {
    return Player.skills.hacking >= getEffectiveHackingLevelRequirement(lvl);
  };
}

export function getEffectiveHackingLevelRequirement(level: number): number {
  return clampNumber(level - Player.skills.intelligence / 2, 1);
}

function bitFlumeRequirements() {
  return function () {
    return knowAboutBitverse() && Player.skills.hacking >= 1;
  };
}

function warnIfNonArgProgramIsRunWithArgs(name: CompletedProgramName, args: string[], stdIO: StdIO): void {
  if (args.length === 0) {
    return;
  }
  Terminal.warn(
    `You are running ${name} with arguments, but ${name} does not accept arguments. These arguments will be ignored. ` +
      `${name} only affects the server ('${Player.currentServer}') that you are connecting via the terminal. ` +
      "If you want to pass the target's hostname as an argument, you have to use the respective NS API.",
    stdIO,
  );
}

export const Programs: Record<CompletedProgramName, Program> = {
  [CompletedProgramName.nuke]: new Program({
    name: CompletedProgramName.nuke,
    nsMethod: "nuke",
    create: {
      level: 1,
      tooltip: "This virus is used to gain root access to a machine if enough ports are opened.",
      req: requireHackingLevel(1),
      time: CONSTANTS.MillisecondsPerFiveMinutes,
    },
    run: (args: string[], server: BaseServer, stdIO: StdIO): void => {
      warnIfNonArgProgramIsRunWithArgs(CompletedProgramName.nuke, args, stdIO);
      if (!(server instanceof Server)) {
        Terminal.fatal("Cannot nuke this kind of server.", stdIO);
        return;
      }
      if (server.hasAdminRights) {
        Terminal.print("You already have root access to this computer. There is no reason to run NUKE.exe", stdIO);
        Terminal.print("You can now run scripts on this server.", stdIO);
        return;
      }
      if (server.openPortCount >= server.numOpenPortsRequired) {
        server.hasAdminRights = true;
        Terminal.print("NUKE successful! Gained root access to " + server.hostname, stdIO);
        Terminal.print("You can now run scripts on this server.", stdIO);
        return;
      }

      Terminal.print("NUKE unsuccessful. Not enough ports have been opened", stdIO);
    },
  }),
  [CompletedProgramName.bruteSsh]: new Program({
    name: CompletedProgramName.bruteSsh,
    nsMethod: "brutessh",
    create: {
      level: 50,
      tooltip: "This program executes a brute force attack that opens SSH ports",
      req: requireHackingLevel(50),
      time: CONSTANTS.MillisecondsPerFiveMinutes * 2,
    },
    run: (args: string[], server: BaseServer, stdIO: StdIO): void => {
      warnIfNonArgProgramIsRunWithArgs(CompletedProgramName.bruteSsh, args, stdIO);
      if (!(server instanceof Server)) {
        Terminal.fatal("Cannot run BruteSSH.exe on this kind of server.", stdIO);
        return;
      }
      if (server.sshPortOpen) {
        Terminal.print("SSH Port (22) is already open!", stdIO);
        return;
      }
      if (server.purchasedByPlayer) {
        Terminal.print("Opening ports on your own machines has no negative consequences in the game.", stdIO);
      }

      server.sshPortOpen = true;
      Terminal.print("Opened SSH Port (22)!", stdIO);
      server.openPortCount++;
    },
  }),
  [CompletedProgramName.ftpCrack]: new Program({
    name: CompletedProgramName.ftpCrack,
    nsMethod: "ftpcrack",
    create: {
      level: 100,
      tooltip: "This program cracks open FTP ports by exploiting weak credentials",
      req: requireHackingLevel(100),
      time: CONSTANTS.MillisecondsPerHalfHour,
    },
    run: (args: string[], server: BaseServer, stdIO: StdIO): void => {
      warnIfNonArgProgramIsRunWithArgs(CompletedProgramName.ftpCrack, args, stdIO);
      if (!(server instanceof Server)) {
        Terminal.fatal("Cannot run FTPCrack.exe on this kind of server.", stdIO);
        return;
      }
      if (server.ftpPortOpen) {
        Terminal.print("FTP Port (21) is already open!", stdIO);
        return;
      }
      if (server.purchasedByPlayer) {
        Terminal.print("Opening ports on your own machines has no negative consequences in the game.", stdIO);
      }

      server.ftpPortOpen = true;
      Terminal.print("Opened FTP Port (21)!", stdIO);
      server.openPortCount++;
    },
  }),
  [CompletedProgramName.relaySmtp]: new Program({
    name: CompletedProgramName.relaySmtp,
    nsMethod: "relaysmtp",
    create: {
      level: 250,
      tooltip: "This program opens SMTP ports by redirecting data",
      req: requireHackingLevel(250),
      time: CONSTANTS.MillisecondsPer2Hours,
    },
    run: (args: string[], server: BaseServer, stdIO: StdIO): void => {
      warnIfNonArgProgramIsRunWithArgs(CompletedProgramName.relaySmtp, args, stdIO);
      if (!(server instanceof Server)) {
        Terminal.fatal("Cannot run relaySMTP.exe on this kind of server.", stdIO);
        return;
      }
      if (server.smtpPortOpen) {
        Terminal.print("SMTP Port (25) is already open!", stdIO);
        return;
      }
      if (server.purchasedByPlayer) {
        Terminal.print("Opening ports on your own machines has no negative consequences in the game.", stdIO);
      }

      server.smtpPortOpen = true;
      Terminal.print("Opened SMTP Port (25)!", stdIO);
      server.openPortCount++;
    },
  }),
  [CompletedProgramName.httpWorm]: new Program({
    name: CompletedProgramName.httpWorm,
    nsMethod: "httpworm",
    create: {
      level: 500,
      tooltip: "This virus opens up HTTP ports by exploiting web servers' vulnerabilities",
      req: requireHackingLevel(500),
      time: CONSTANTS.MillisecondsPer4Hours,
    },
    run: (args: string[], server: BaseServer, stdIO: StdIO): void => {
      warnIfNonArgProgramIsRunWithArgs(CompletedProgramName.httpWorm, args, stdIO);
      if (!(server instanceof Server)) {
        Terminal.fatal("Cannot run HTTPWorm.exe on this kind of server.", stdIO);
        return;
      }
      if (server.httpPortOpen) {
        Terminal.print("HTTP Port (80) is already open!", stdIO);
        return;
      }
      if (server.purchasedByPlayer) {
        Terminal.print("Opening ports on your own machines has no negative consequences in the game.", stdIO);
      }

      server.httpPortOpen = true;
      Terminal.print("Opened HTTP Port (80)!", stdIO);
      server.openPortCount++;
    },
  }),
  [CompletedProgramName.sqlInject]: new Program({
    name: CompletedProgramName.sqlInject,
    nsMethod: "sqlinject",
    create: {
      level: 750,
      tooltip: "This virus opens SQL ports by injecting malicious code into databases",
      req: requireHackingLevel(750),
      time: CONSTANTS.MillisecondsPer8Hours,
    },
    run: (args: string[], server: BaseServer, stdIO: StdIO): void => {
      warnIfNonArgProgramIsRunWithArgs(CompletedProgramName.sqlInject, args, stdIO);
      if (!(server instanceof Server)) {
        Terminal.fatal("Cannot run SQLInject.exe on this kind of server.", stdIO);
        return;
      }
      if (server.sqlPortOpen) {
        Terminal.print("SQL Port (1433) is already open!", stdIO);
        return;
      }
      if (server.purchasedByPlayer) {
        Terminal.print("Opening ports on your own machines has no negative consequences in the game.", stdIO);
      }

      server.sqlPortOpen = true;
      Terminal.print("Opened SQL Port (1433)!", stdIO);
      server.openPortCount++;
    },
  }),
  [CompletedProgramName.deepScan1]: new Program({
    name: CompletedProgramName.deepScan1,
    create: {
      level: 75,
      tooltip: "This program allows you to use the scan-analyze command with a depth up to 5",
      req: requireHackingLevel(75),
      time: CONSTANTS.MillisecondsPerQuarterHour,
    },
    run: (__, ___, stdIO: StdIO): void => {
      Terminal.print("This executable cannot be run.", stdIO);
      Terminal.print("DeepscanV1.exe lets you run 'scan-analyze' with a depth up to 5.", stdIO);
    },
  }),
  [CompletedProgramName.deepScan2]: new Program({
    name: CompletedProgramName.deepScan2,
    create: {
      level: 400,
      tooltip: "This program allows you to use the scan-analyze command with a depth up to 10",
      req: requireHackingLevel(400),
      time: CONSTANTS.MillisecondsPer2Hours,
    },
    run: (__, ___, stdIO: StdIO): void => {
      Terminal.print("This executable cannot be run.", stdIO);
      Terminal.print("DeepscanV2.exe lets you run 'scan-analyze' with a depth up to 10.", stdIO);
    },
  }),
  [CompletedProgramName.serverProfiler]: new Program({
    name: CompletedProgramName.serverProfiler,
    nsMethod: "getServer",
    create: {
      level: 75,
      tooltip: "This program is used to display hacking and Netscript-related information about servers",
      req: requireHackingLevel(75),
      time: CONSTANTS.MillisecondsPerHalfHour,
    },
    run: (args: string[], __, stdIO: StdIO): void => {
      if (args.length !== 1) {
        Terminal.fatal("Must pass a server hostname or IP as an argument for ServerProfiler.exe", stdIO);
        return;
      }

      const targetServer = GetServer(args[0]);
      if (targetServer == null) {
        Terminal.fatal("Invalid server IP/hostname", stdIO);
        return;
      }

      if (!(targetServer instanceof Server)) {
        Terminal.fatal(`ServerProfiler.exe can only be run on normal servers.`, stdIO);
        return;
      }

      Terminal.print(targetServer.hostname + ":", stdIO);
      Terminal.print("Server base security level: " + targetServer.baseDifficulty, stdIO);
      Terminal.print("Server current security level: " + targetServer.hackDifficulty, stdIO);
      Terminal.print("Server growth rate: " + targetServer.serverGrowth, stdIO);
      Terminal.print(
        `Netscript hack() execution time: ${convertTimeMsToTimeElapsedString(
          calculateHackingTime(targetServer, Player) * 1000,
          true,
        )}`,
        stdIO,
      );
      Terminal.print(
        `Netscript grow() execution time: ${convertTimeMsToTimeElapsedString(
          calculateGrowTime(targetServer, Player) * 1000,
          true,
        )}`,
        stdIO,
      );
      Terminal.print(
        `Netscript weaken() execution time: ${convertTimeMsToTimeElapsedString(
          calculateWeakenTime(targetServer, Player) * 1000,
          true,
        )}`,
        stdIO,
      );
    },
  }),
  [CompletedProgramName.autoLink]: new Program({
    name: CompletedProgramName.autoLink,
    create: {
      level: 25,
      tooltip: "This program allows you to directly connect to other servers through the 'scan-analyze' command",
      req: requireHackingLevel(25),
      time: CONSTANTS.MillisecondsPerQuarterHour,
    },
    run: (__, ___, stdIO: StdIO): void => {
      Terminal.print("This executable cannot be run.", stdIO);
      Terminal.print("AutoLink.exe lets you automatically connect to other servers when using 'scan-analyze'.", stdIO);
      Terminal.print("When using scan-analyze, click on a server's hostname to connect to it.", stdIO);
    },
  }),
  [CompletedProgramName.formulas]: new Program({
    name: CompletedProgramName.formulas,
    create: {
      level: 1000,
      tooltip: "This program allows you to use the formulas API",
      req: requireHackingLevel(1000),
      time: CONSTANTS.MillisecondsPer4Hours,
    },
    run: (__, ___, stdIO: StdIO): void => {
      Terminal.print("This executable cannot be run.", stdIO);
      Terminal.print("Formulas.exe lets you use the formulas API.", stdIO);
    },
  }),
  [CompletedProgramName.bitFlume]: new Program({
    name: CompletedProgramName.bitFlume,
    create: {
      level: 1,
      tooltip: "This program creates a portal to the BitNode Nexus (allows you to restart and switch BitNodes)",
      req: bitFlumeRequirements(),
      time: CONSTANTS.MillisecondsPerFiveMinutes / 20,
    },
    run: (args: string[]): void => {
      if (args.length == 1) {
        if (args[0] == "-q") {
          Router.toPage(Page.BitVerse, { flume: true, quick: true });
        }
      } else {
        BitFlumeEvent.emit();
      }
    },
  }),
  [CompletedProgramName.flight]: new Program({
    name: CompletedProgramName.flight,
    create: null,
    run: (__, ___, stdIO: StdIO): void => {
      const numAugReq = currentNodeMults.DaedalusAugsRequirement;
      const fulfilled =
        Player.augmentations.length >= numAugReq && Player.money >= 1e11 && Player.skills.hacking >= 2500;
      if (!fulfilled) {
        if (Player.augmentations.length >= numAugReq) {
          Terminal.print(`[x] Augmentations: ${Player.augmentations.length} / ${numAugReq}`, stdIO);
        } else {
          Terminal.print(`[ ] Augmentations: ${Player.augmentations.length} / ${numAugReq}`, stdIO);
        }
        if (Player.money >= 1e11) {
          Terminal.print(`[x] Money: ${formatMoney(Player.money)} / ${formatMoney(1e11)}`, stdIO);
        } else {
          Terminal.print(`[ ] Money: ${formatMoney(Player.money)} / ${formatMoney(1e11)}`, stdIO);
        }
        if (Player.skills.hacking >= 2500) {
          Terminal.print(`[x] Hacking skill: ${Player.skills.hacking} / 2500`, stdIO);
        } else {
          Terminal.print(`[ ] Hacking skill: ${Player.skills.hacking} / 2500`, stdIO);
        }
        return;
      }

      Terminal.print("We will contact you.", stdIO);
      Terminal.print(`-- ${FactionName.Daedalus} --`, stdIO);
    },
  }),
  [CompletedProgramName.darkscape]: new Program({
    name: CompletedProgramName.darkscape,
    create: null,
    run: (__, ___, stdIO: StdIO): void => {
      Terminal.print("This program gives access to the dark net.", stdIO);
      Terminal.print(
        "The dark net is an unstable, constantly shifting network of servers that are only connected to the normal network through the darkweb server.",
        stdIO,
      );
      Terminal.print(
        "This network can be accessed using the `ns.dnet` api functions, or the DarkNet UI on the left-hand panel.",
        stdIO,
      );
    },
  }),
  [CompletedProgramName.stormSeed]: new Program({
    name: CompletedProgramName.stormSeed,
    nsMethod: "dnet.unleashStormSeed",
    create: null,
    run: (__, ___, stdIO: StdIO): void => {
      Terminal.print("You can feel a storm approaching...", stdIO);
      const connectedServer = Player.getCurrentServer();
      handleStormSeed(connectedServer);
    },
  }),
};
