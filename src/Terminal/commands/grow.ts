import { Terminal } from "../../Terminal";
import type { TerminalAction } from "../TerminalAction";
import { BaseServer } from "../../Server/BaseServer";
import { Server } from "../../Server/Server";
import { HacknetServer } from "../../Hacknet/HacknetServer";
import { Player } from "@player";
import { formatExp, formatPercent, formatSecurity } from "../../ui/formatNumber";
import { calculateHackingExpGain, calculateGrowTime } from "../../Hacking";
import { processSingleServerGrowth } from "../../Server/ServerHelpers";

export function grow(args: (string | number | boolean)[], server: BaseServer): undefined | TerminalAction {
  if (args.length !== 0) return Terminal.error("grow 命令用法不正确。用法：grow");

  if (server.purchasedByPlayer) return Terminal.error("无法增长你自己的机器！");
  if (!server.hasAdminRights) return Terminal.error("你没有这台机器的管理员权限！");
  // Grow does not require meeting the hacking level, but undefined requiredHackingSkill indicates the wrong type of server.
  if (server.requiredHackingSkill === undefined) return Terminal.error("无法增长这台服务器。");

  if (server instanceof HacknetServer) {
    Terminal.error("无法对此类服务器执行增长");
    return;
  }
  if (!(server instanceof Server)) throw new Error("server should be normal server");
  return Terminal.timedAction(calculateGrowTime(server, Player) / 16, "grow", () => {
    const expGain = calculateHackingExpGain(server, Player);
    const oldSec = server.hackDifficulty;
    const growth = processSingleServerGrowth(server, 25, server.cpuCores);
    const newSec = server.hackDifficulty;

    Player.gainHackingExp(expGain);
    Terminal.print(
      `'${server.hostname}' 上的可用资金增长了 ${formatPercent(growth - 1, 6)}。获得 ${formatExp(
        expGain,
      )} 点黑客经验。`,
    );
    Terminal.print(
      `'${server.hostname}' 的安全等级从 ${formatSecurity(oldSec)} 升至 ${formatSecurity(newSec)}`,
    );
  });
}
