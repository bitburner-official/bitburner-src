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
  if (args.length !== 0) return Terminal.error("Incorrect usage of hack command. Usage: hack");
  if (server.purchasedByPlayer) return Terminal.error("Cannot hack your own machines!");
  if (!server.hasAdminRights) return Terminal.error("You do not have admin rights for this machine!");
  // Acts as a functional check that the server is hackable. Hacknet servers should already be filtered out anyway by purchasedByPlayer
  if (server.requiredHackingSkill === undefined) return Terminal.error("Cannot hack this server.");
  if (server.requiredHackingSkill > Player.skills.hacking) {
    return Terminal.error(
      "Your hacking skill is not high enough to hack this machine. Try analyzing the machine to determine the required hacking skill",
    );
  }

  // Hacking through Terminal should be faster than hacking through a script
  if (server instanceof HacknetServer) {
    Terminal.error("Cannot hack this kind of server");
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
        `Hack successful on '${server.hostname}'! Gained ${formatMoney(moneyGained, true)} and ${formatExp(
          expGainedOnSuccess,
        )} hacking exp`,
      );
      Terminal.print(
        `Security increased on '${server.hostname}' from ${formatSecurity(oldSec)} to ${formatSecurity(newSec)}`,
      );
    } else {
      // Failure
      Player.gainHackingExp(expGainedOnFailure);
      Terminal.print(`Failed to hack '${server.hostname}'. Gained ${formatExp(expGainedOnFailure)} hacking exp`);
    }
  });
}
