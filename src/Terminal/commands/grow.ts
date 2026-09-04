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
  if (args.length !== 0) return Terminal.error("Incorrect usage of grow command. Usage: grow");

  if (server.purchasedByPlayer) return Terminal.error("Cannot grow your own machines!");
  if (!server.hasAdminRights) return Terminal.error("You do not have admin rights for this machine!");
  // Grow does not require meeting the hacking level, but undefined requiredHackingSkill indicates the wrong type of server.
  if (server.requiredHackingSkill === undefined) return Terminal.error("Cannot grow this server.");

  if (server instanceof HacknetServer) {
    Terminal.error("Cannot grow this kind of server");
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
      `Available money on '${server.hostname}' grown by ${formatPercent(growth - 1, 6)}. Gained ${formatExp(
        expGain,
      )} hacking exp.`,
    );
    Terminal.print(
      `Security increased on '${server.hostname}' from ${formatSecurity(oldSec)} to ${formatSecurity(newSec)}`,
    );
  });
}
