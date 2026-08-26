import { Terminal } from "../../Terminal";
import type { TerminalAction } from "../TerminalAction";
import { Player } from "@player";
import { BaseServer } from "../../Server/BaseServer";
import { HacknetServer } from "../../Hacknet/HacknetServer";
import { Server } from "../../Server/Server";
import { DarknetServer } from "../../Server/DarknetServer";
import { Page } from "../../ui/Router";
import { Router } from "../../ui/GameRoot";
import { Engine } from "../../engine";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { calculateHackingTime } from "../../Hacking";

export function backdoor(args: (string | number | boolean)[], server: BaseServer): undefined | TerminalAction {
  if (args.length !== 0) {
    Terminal.error("backdoor 命令用法不正确。用法：backdoor");
    return;
  }

  if (!(server instanceof Server) && !(server instanceof DarknetServer)) {
    Terminal.error("只能在普通服务器上安装后门");
    return;
  }
  if (server.purchasedByPlayer) {
    Terminal.error(
      "无法在你自己的机器上安装后门！你当前连接的是你的家用电脑或某台云服务器。",
    );
    return;
  }
  if (!server.hasAdminRights) {
    Terminal.error("你没有这台机器的管理员权限！");
    return;
  }
  if (server.requiredHackingSkill && server.requiredHackingSkill > Player.skills.hacking) {
    Terminal.error(
      "你的黑客等级不足以在这台机器上安装后门。请尝试分析该机器以确定所需的黑客等级。",
    );
    return;
  }

  if (server.backdoorInstalled) {
    Terminal.warn(
      `你已经在此服务器上安装过后门。可以使用 "analyze" 命令查看 "Backdoor"（后门）状态。`,
    );
  }

  // Backdoor should take the same amount of time as hack
  if (server instanceof HacknetServer) {
    Terminal.error("无法对此类服务器安装后门");
    return;
  }
  if (!(server instanceof Server || server instanceof DarknetServer)) {
    throw new Error("server should be normal server");
  }
  return Terminal.timedAction(calculateHackingTime(server, Player) / 4, "backdoor", () => {
    server.backdoorInstalled = true;
    if (SpecialServers.WorldDaemon === server.hostname) {
      if (Player.bitNodeN == null) {
        Player.bitNodeN = 1;
      }
      Router.toPage(Page.BitVerse, { flume: false, quick: false });
      return;
    }
    // Manunally check for faction invites
    Engine.Counters.checkFactionInvitations = 0;
    Engine.checkCounters();

    Terminal.print(`已成功在 '${server.hostname}' 上安装后门！`);
  });
}
