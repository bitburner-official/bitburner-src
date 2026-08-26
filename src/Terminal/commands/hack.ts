import { Terminal } from "../../Terminal";
import type { TerminalAction } from "../TerminalAction";
import { Player } from "@player";
import { BaseServer } from "../../Server/BaseServer";
import { Server } from "../../Server/Server";
import { HacknetServer } from "../../Hacknet/HacknetServer";
import {
  calculateHackingChance,
  calculateHackingExpGain,
  calculatePercentMoneyHacked,
  calculateHackingTime,
} from "../../Hacking";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { Engine } from "../../engine";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { ServerConstants } from "../../Server/data/Constants";
import { formatExp, formatMoney, formatSecurity } from "../../ui/formatNumber";

export function hack(args: (string | number | boolean)[], server: BaseServer): undefined | TerminalAction {
  if (args.length !== 0) return Terminal.error("hack 命令用法不正确。用法：hack");
  if (server.purchasedByPlayer) return Terminal.error("无法入侵你自己的机器！");
  if (!server.hasAdminRights) return Terminal.error("你没有这台机器的管理员权限！");
  // Acts as a functional check that the server is hackable. Hacknet servers should already be filtered out anyway by purchasedByPlayer
  if (server.requiredHackingSkill === undefined) return Terminal.error("无法入侵这台服务器。");
  if (server.requiredHackingSkill > Player.skills.hacking) {
    return Terminal.error(
      "你的黑客等级不足以入侵这台机器。请尝试分析该机器以确定所需的黑客等级",
    );
  }

  // Hacking through Terminal should be faster than hacking through a script
  if (server instanceof HacknetServer) {
    Terminal.error("无法入侵此类服务器");
    return;
  }
  if (!(server instanceof Server)) throw new Error("server should be normal server");
  return Terminal.timedAction(calculateHackingTime(server, Player) / 4, "hack", () => {
    // Calculate whether hack was successful
    const hackChance = calculateHackingChance(server, Player);
    const rand = Math.random();
    let expGainedOnSuccess = calculateHackingExpGain(server, Player);
    const expGainedOnFailure = expGainedOnSuccess / 4;
    if (rand < hackChance) {
      // Success!
      server.backdoorInstalled = true;
      if (SpecialServers.WorldDaemon === server.hostname) {
        Router.toPage(Page.BitVerse, { flume: false, quick: false });
        return;
      }
      // Manually check for faction invitations
      Engine.Counters.checkFactionInvitations = 0;
      Engine.checkCounters();

      let moneyDrained = server.moneyAvailable * calculatePercentMoneyHacked(server, Player);

      // Over-the-top safety checks
      if (moneyDrained < 0) {
        moneyDrained = 0;
      }
      if (moneyDrained > server.moneyAvailable) {
        moneyDrained = server.moneyAvailable;
      }

      if (moneyDrained === 0) {
        expGainedOnSuccess = expGainedOnFailure;
      }

      server.moneyAvailable -= moneyDrained;
      if (server.moneyAvailable < 0) {
        server.moneyAvailable = 0;
      }

      const moneyGained = moneyDrained * currentNodeMults.ManualHackMoney;
      Player.gainMoney(moneyGained, "hacking");
      Player.gainHackingExp(expGainedOnSuccess);
      if (expGainedOnSuccess > 1) {
        Player.gainIntelligenceExp(4 * Math.log10(expGainedOnSuccess));
      }

      const oldSec = server.hackDifficulty;
      server.fortify(ServerConstants.ServerFortifyAmount);
      const newSec = server.hackDifficulty;

      Terminal.print(
        `成功入侵 '${server.hostname}'！获得 ${formatMoney(moneyGained, true)} 资金和 ${formatExp(
          expGainedOnSuccess,
        )} 点黑客经验`,
      );
      Terminal.print(
        `'${server.hostname}' 的安全等级从 ${formatSecurity(oldSec)} 升至 ${formatSecurity(newSec)}`,
      );
    } else {
      // Failure
      Player.gainHackingExp(expGainedOnFailure);
      Terminal.print(`入侵 '${server.hostname}' 失败。获得 ${formatExp(expGainedOnFailure)} 点黑客经验`);
    }
  });
}
