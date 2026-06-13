import { Terminal } from "../../Terminal";
import type { TerminalAction } from "../TerminalAction";
import { BaseServer } from "../../Server/BaseServer";
import { HacknetServer } from "../../Hacknet/HacknetServer";
import { Server } from "../../Server/Server";
import { Player } from "@player";
import { calculateHackingExpGain, calculateWeakenTime } from "../../Hacking";
import { formatExp, formatSecurity } from "../../ui/formatNumber";
import { getWeakenEffect } from "../../Server/ServerHelpers";
import { StdIO } from "../StdIO/StdIO";

export function weaken(
  args: (string | number | boolean)[],
  server: BaseServer,
  stdIO: StdIO,
): undefined | TerminalAction {
  if (args.length !== 0) return Terminal.fatal("Incorrect usage of weaken command. Usage: weaken", stdIO);

  if (server.purchasedByPlayer) return Terminal.fatal("Cannot weaken your own machines!", stdIO);
  if (!server.hasAdminRights) return Terminal.fatal("You do not have admin rights for this machine!", stdIO);
  // Weaken does not require meeting the hacking level, but undefined requiredHackingSkill indicates the wrong type of server.
  if (server.requiredHackingSkill === undefined) return Terminal.fatal("Cannot weaken this server.", stdIO);

  if (server instanceof HacknetServer) {
    Terminal.fatal("Cannot weaken this kind of server", stdIO);
    return;
  }
  if (!(server instanceof Server)) throw new Error("server should be normal server");
  return Terminal.timedAction(
    calculateWeakenTime(server, Player) / 16,
    "weaken",
    () => {
      const expGain = calculateHackingExpGain(server, Player);
      const oldSec = server.hackDifficulty;
      const weakenAmt = getWeakenEffect(1, server.cpuCores);
      server.weaken(weakenAmt);
      const newSec = server.hackDifficulty;

      Player.gainHackingExp(expGain);
      Terminal.print(
        `Security decreased on '${server.hostname}' by ${formatSecurity(weakenAmt)} from ${formatSecurity(
          oldSec,
        )} to ${formatSecurity(newSec)} (min: ${formatSecurity(server.minDifficulty)})` +
          ` and Gained ${formatExp(expGain)} hacking exp.`,
        stdIO,
      );
    },
    stdIO,
  );
}
