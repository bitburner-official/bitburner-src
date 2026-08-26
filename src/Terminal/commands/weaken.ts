import { Terminal } from "../../Terminal";
import type { TerminalAction } from "../TerminalAction";
import { BaseServer } from "../../Server/BaseServer";
import { HacknetServer } from "../../Hacknet/HacknetServer";
import { Server } from "../../Server/Server";
import { Player } from "@player";
import { calculateHackingExpGain, calculateWeakenTime } from "../../Hacking";
import { formatExp, formatSecurity } from "../../ui/formatNumber";
import { getWeakenEffect } from "../../Server/ServerHelpers";

export function weaken(args: (string | number | boolean)[], server: BaseServer): undefined | TerminalAction {
  if (args.length !== 0) return Terminal.error("weaken 命令用法不正确。用法：weaken");

  if (server.purchasedByPlayer) return Terminal.error("无法削弱你自己的机器！");
  if (!server.hasAdminRights) return Terminal.error("你没有这台机器的管理员权限！");
  // Weaken does not require meeting the hacking level, but undefined requiredHackingSkill indicates the wrong type of server.
  if (server.requiredHackingSkill === undefined) return Terminal.error("无法削弱这台服务器。");

  if (server instanceof HacknetServer) {
    Terminal.error("无法削弱此类服务器");
    return;
  }
  if (!(server instanceof Server)) throw new Error("server should be normal server");
  return Terminal.timedAction(calculateWeakenTime(server, Player) / 16, "weaken", () => {
    const expGain = calculateHackingExpGain(server, Player);
    const oldSec = server.hackDifficulty;
    const weakenAmt = getWeakenEffect(1, server.cpuCores);
    server.weaken(weakenAmt);
    const newSec = server.hackDifficulty;

    Player.gainHackingExp(expGain);
    Terminal.print(
      `'${server.hostname}' 的安全等级降低了 ${formatSecurity(weakenAmt)}，从 ${formatSecurity(
        oldSec,
      )} 降至 ${formatSecurity(newSec)}（最低：${formatSecurity(server.minDifficulty)}）` +
        `，并获得 ${formatExp(expGain)} 点黑客经验。`,
    );
  });
}
