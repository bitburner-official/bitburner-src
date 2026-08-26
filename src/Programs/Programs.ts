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

function warnIfNonArgProgramIsRunWithArgs(name: CompletedProgramName, args: string[]): void {
  if (args.length === 0) {
    return;
  }
  Terminal.warn(
    `你正在带参数运行 ${name}，但 ${name} 不接受参数。这些参数将被忽略。` +
      `${name} 只影响你通过终端连接的服务器（'${Player.currentServer}'）。` +
      "如果你想将目标主机名作为参数传递，必须使用相应的 NS API。",
  );
}

export const Programs: Record<CompletedProgramName, Program> = {
  [CompletedProgramName.nuke]: new Program({
    name: CompletedProgramName.nuke,
    nsMethod: "nuke",
    create: {
      level: 1,
      tooltip: "这种病毒用于在足够多的端口被打开后获取机器的 root 权限。",
      req: requireHackingLevel(1),
      time: CONSTANTS.MillisecondsPerFiveMinutes,
    },
    run: (args: string[], server: BaseServer): void => {
      warnIfNonArgProgramIsRunWithArgs(CompletedProgramName.nuke, args);
      if (!(server instanceof Server)) {
        Terminal.error("无法入侵（nuke）这种类型的服务器。");
        return;
      }
      if (server.hasAdminRights) {
        Terminal.print("你已经拥有这台计算机的 root 权限。没有必要运行 NUKE.exe");
        Terminal.print("你现在可以在这个服务器上运行脚本了。");
        return;
      }
      if (server.openPortCount >= server.numOpenPortsRequired) {
        server.hasAdminRights = true;
        Terminal.print("NUKE 成功！已获得 " + server.hostname + " 的 root 权限");
        Terminal.print("你现在可以在这个服务器上运行脚本了。");
        return;
      }

      Terminal.print("NUKE 失败。打开的端口数量不足");
    },
  }),
  [CompletedProgramName.bruteSsh]: new Program({
    name: CompletedProgramName.bruteSsh,
    nsMethod: "brutessh",
    create: {
      level: 50,
      tooltip: "该程序执行暴力破解攻击以打开 SSH 端口",
      req: requireHackingLevel(50),
      time: CONSTANTS.MillisecondsPerFiveMinutes * 2,
    },
    run: (args: string[], server: BaseServer): void => {
      warnIfNonArgProgramIsRunWithArgs(CompletedProgramName.bruteSsh, args);
      if (!(server instanceof Server)) {
        Terminal.error("无法在这种类型的服务器上运行 BruteSSH.exe。");
        return;
      }
      if (server.sshPortOpen) {
        Terminal.print("SSH 端口 (22) 已经打开！");
        return;
      }
      if (server.purchasedByPlayer) {
        Terminal.print("在自己的机器上打开端口在游戏中没有任何负面后果。");
      }

      server.sshPortOpen = true;
      Terminal.print("已打开 SSH 端口 (22)！");
      server.openPortCount++;
    },
  }),
  [CompletedProgramName.ftpCrack]: new Program({
    name: CompletedProgramName.ftpCrack,
    nsMethod: "ftpcrack",
    create: {
      level: 100,
      tooltip: "该程序利用弱凭据破解 FTP 端口",
      req: requireHackingLevel(100),
      time: CONSTANTS.MillisecondsPerHalfHour,
    },
    run: (args: string[], server: BaseServer): void => {
      warnIfNonArgProgramIsRunWithArgs(CompletedProgramName.ftpCrack, args);
      if (!(server instanceof Server)) {
        Terminal.error("无法在这种类型的服务器上运行 FTPCrack.exe。");
        return;
      }
      if (server.ftpPortOpen) {
        Terminal.print("FTP 端口 (21) 已经打开！");
        return;
      }
      if (server.purchasedByPlayer) {
        Terminal.print("在自己的机器上打开端口在游戏中没有任何负面后果。");
      }

      server.ftpPortOpen = true;
      Terminal.print("已打开 FTP 端口 (21)！");
      server.openPortCount++;
    },
  }),
  [CompletedProgramName.relaySmtp]: new Program({
    name: CompletedProgramName.relaySmtp,
    nsMethod: "relaysmtp",
    create: {
      level: 250,
      tooltip: "该程序通过重定向数据来打开 SMTP 端口",
      req: requireHackingLevel(250),
      time: CONSTANTS.MillisecondsPer2Hours,
    },
    run: (args: string[], server: BaseServer): void => {
      warnIfNonArgProgramIsRunWithArgs(CompletedProgramName.relaySmtp, args);
      if (!(server instanceof Server)) {
        Terminal.error("无法在这种类型的服务器上运行 relaySMTP.exe。");
        return;
      }
      if (server.smtpPortOpen) {
        Terminal.print("SMTP 端口 (25) 已经打开！");
        return;
      }
      if (server.purchasedByPlayer) {
        Terminal.print("在自己的机器上打开端口在游戏中没有任何负面后果。");
      }

      server.smtpPortOpen = true;
      Terminal.print("已打开 SMTP 端口 (25)！");
      server.openPortCount++;
    },
  }),
  [CompletedProgramName.httpWorm]: new Program({
    name: CompletedProgramName.httpWorm,
    nsMethod: "httpworm",
    create: {
      level: 500,
      tooltip: "该病毒利用 Web 服务器的漏洞打开 HTTP 端口",
      req: requireHackingLevel(500),
      time: CONSTANTS.MillisecondsPer4Hours,
    },
    run: (args: string[], server: BaseServer): void => {
      warnIfNonArgProgramIsRunWithArgs(CompletedProgramName.httpWorm, args);
      if (!(server instanceof Server)) {
        Terminal.error("无法在这种类型的服务器上运行 HTTPWorm.exe。");
        return;
      }
      if (server.httpPortOpen) {
        Terminal.print("HTTP 端口 (80) 已经打开！");
        return;
      }
      if (server.purchasedByPlayer) {
        Terminal.print("在自己的机器上打开端口在游戏中没有任何负面后果。");
      }

      server.httpPortOpen = true;
      Terminal.print("已打开 HTTP 端口 (80)！");
      server.openPortCount++;
    },
  }),
  [CompletedProgramName.sqlInject]: new Program({
    name: CompletedProgramName.sqlInject,
    nsMethod: "sqlinject",
    create: {
      level: 750,
      tooltip: "该病毒通过向数据库注入恶意代码来打开 SQL 端口",
      req: requireHackingLevel(750),
      time: CONSTANTS.MillisecondsPer8Hours,
    },
    run: (args: string[], server: BaseServer): void => {
      warnIfNonArgProgramIsRunWithArgs(CompletedProgramName.sqlInject, args);
      if (!(server instanceof Server)) {
        Terminal.error("无法在这种类型的服务器上运行 SQLInject.exe。");
        return;
      }
      if (server.sqlPortOpen) {
        Terminal.print("SQL 端口 (1433) 已经打开！");
        return;
      }
      if (server.purchasedByPlayer) {
        Terminal.print("在自己的机器上打开端口在游戏中没有任何负面后果。");
      }

      server.sqlPortOpen = true;
      Terminal.print("已打开 SQL 端口 (1433)！");
      server.openPortCount++;
    },
  }),
  [CompletedProgramName.deepScan1]: new Program({
    name: CompletedProgramName.deepScan1,
    create: {
      level: 75,
      tooltip: "该程序让你可以使用深度最高为 5 的 scan-analyze 命令",
      req: requireHackingLevel(75),
      time: CONSTANTS.MillisecondsPerQuarterHour,
    },
    run: (): void => {
      Terminal.print("此可执行文件无法运行。");
      Terminal.print("DeepscanV1.exe 让你可以使用深度最高为 5 的 'scan-analyze'。");
    },
  }),
  [CompletedProgramName.deepScan2]: new Program({
    name: CompletedProgramName.deepScan2,
    create: {
      level: 400,
      tooltip: "该程序让你可以使用深度最高为 10 的 scan-analyze 命令",
      req: requireHackingLevel(400),
      time: CONSTANTS.MillisecondsPer2Hours,
    },
    run: (): void => {
      Terminal.print("此可执行文件无法运行。");
      Terminal.print("DeepscanV2.exe 让你可以使用深度最高为 10 的 'scan-analyze'。");
    },
  }),
  [CompletedProgramName.serverProfiler]: new Program({
    name: CompletedProgramName.serverProfiler,
    nsMethod: "getServer",
    create: {
      level: 75,
      tooltip: "该程序用于显示有关服务器的入侵与 Netscript 相关信息",
      req: requireHackingLevel(75),
      time: CONSTANTS.MillisecondsPerHalfHour,
    },
    run: (args: string[]): void => {
      if (args.length !== 1) {
        Terminal.error("必须为 ServerProfiler.exe 传入一个服务器主机名或 IP 作为参数");
        return;
      }

      const targetServer = GetServer(args[0]);
      if (targetServer == null) {
        Terminal.error("无效的服务器 IP/主机名");
        return;
      }

      if (!(targetServer instanceof Server)) {
        Terminal.error(`ServerProfiler.exe 只能在普通服务器上运行。`);
        return;
      }

      Terminal.print(targetServer.hostname + ":");
      Terminal.print("服务器基础安全等级：" + targetServer.baseDifficulty);
      Terminal.print("服务器当前安全等级：" + targetServer.hackDifficulty);
      Terminal.print("服务器增长率：" + targetServer.serverGrowth);
      Terminal.print(
        `Netscript hack() 执行时间：${convertTimeMsToTimeElapsedString(
          calculateHackingTime(targetServer, Player) * 1000,
          true,
        )}`,
      );
      Terminal.print(
        `Netscript grow() 执行时间：${convertTimeMsToTimeElapsedString(
          calculateGrowTime(targetServer, Player) * 1000,
          true,
        )}`,
      );
      Terminal.print(
        `Netscript weaken() 执行时间：${convertTimeMsToTimeElapsedString(
          calculateWeakenTime(targetServer, Player) * 1000,
          true,
        )}`,
      );
    },
  }),
  [CompletedProgramName.autoLink]: new Program({
    name: CompletedProgramName.autoLink,
    create: {
      level: 25,
      tooltip: "该程序让你可以通过 'scan-analyze' 命令直接连接到其他服务器",
      req: requireHackingLevel(25),
      time: CONSTANTS.MillisecondsPerQuarterHour,
    },
    run: (): void => {
      Terminal.print("此可执行文件无法运行。");
      Terminal.print("AutoLink.exe 让你在使用 'scan-analyze' 时自动连接到其他服务器。");
      Terminal.print("使用 scan-analyze 时，点击服务器的主机名即可连接到它。");
    },
  }),
  [CompletedProgramName.formulas]: new Program({
    name: CompletedProgramName.formulas,
    create: {
      level: 1000,
      tooltip: "该程序让你可以使用 formulas API",
      req: requireHackingLevel(1000),
      time: CONSTANTS.MillisecondsPer4Hours,
    },
    run: (): void => {
      Terminal.print("此可执行文件无法运行。");
      Terminal.print("Formulas.exe 让你可以使用 formulas API。");
    },
  }),
  [CompletedProgramName.bitFlume]: new Program({
    name: CompletedProgramName.bitFlume,
    create: {
      level: 1,
      tooltip: "该程序创建一个通往 BitNode 枢纽的传送门（允许你重启并切换 BitNode）",
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
    run: (): void => {
      const numAugReq = currentNodeMults.DaedalusAugsRequirement;
      const fulfilled =
        Player.augmentations.length >= numAugReq && Player.money >= 1e11 && Player.skills.hacking >= 2500;
      if (!fulfilled) {
        if (Player.augmentations.length >= numAugReq) {
          Terminal.print(`[x] 强化：${Player.augmentations.length} / ${numAugReq}`);
        } else {
          Terminal.print(`[ ] 强化：${Player.augmentations.length} / ${numAugReq}`);
        }
        if (Player.money >= 1e11) {
          Terminal.print(`[x] 资金：${formatMoney(Player.money)} / ${formatMoney(1e11)}`);
        } else {
          Terminal.print(`[ ] 资金：${formatMoney(Player.money)} / ${formatMoney(1e11)}`);
        }
        if (Player.skills.hacking >= 2500) {
          Terminal.print(`[x] 黑客技能：${Player.skills.hacking} / 2500`);
        } else {
          Terminal.print(`[ ] 黑客技能：${Player.skills.hacking} / 2500`);
        }
        return;
      }

      Terminal.print("我们会联系你。");
      Terminal.print(`-- ${FactionName.Daedalus} --`);
    },
  }),
  [CompletedProgramName.darkscape]: new Program({
    name: CompletedProgramName.darkscape,
    create: null,
    run: (): void => {
      Terminal.print("该程序提供对暗网的访问。");
      Terminal.print(
        "暗网是一个不稳定的、不断变化的服务器网络，仅通过 darkweb 服务器与普通网络相连。",
      );
      Terminal.print(
        "可以使用 `ns.dnet` API 函数或左侧面板的 DarkNet UI 访问这个网络。",
      );
    },
  }),
  [CompletedProgramName.stormSeed]: new Program({
    name: CompletedProgramName.stormSeed,
    nsMethod: "dnet.unleashStormSeed",
    create: null,
    run: (): void => {
      Terminal.print("你能感觉到一场风暴正在逼近……");
      const connectedServer = Player.getCurrentServer();
      handleStormSeed(connectedServer);
    },
  }),
};
