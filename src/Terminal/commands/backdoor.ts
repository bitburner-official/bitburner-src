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
    Terminal.error("Incorrect usage of backdoor command. Usage: backdoor");
    return;
  }

  if (!(server instanceof Server) && !(server instanceof DarknetServer)) {
    Terminal.error("Can only install a backdoor on normal servers");
    return;
  }
  if (server.purchasedByPlayer) {
    Terminal.error(
      "Cannot install a backdoor on your own machines! You are currently connected to your home PC or one of your cloud servers.",
    );
    return;
  }
  if (!server.hasAdminRights) {
    Terminal.error("You do not have admin rights for this machine!");
    return;
  }
  if (server.requiredHackingSkill && server.requiredHackingSkill > Player.skills.hacking) {
    Terminal.error(
      "Your hacking skill is not high enough to install a backdoor on this machine. Try analyzing the machine to determine the required hacking skill.",
    );
    return;
  }

  if (server.backdoorInstalled) {
    Terminal.warn(
      `You have already installed a backdoor on this server. You can check the "Backdoor" status via the "analyze" command.`,
    );
  }

  // Backdoor should take the same amount of time as hack
  if (server instanceof HacknetServer) {
    Terminal.error("Cannot backdoor this kind of server");
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

    Terminal.print(`Backdoor on '${server.hostname}' successful!`);
  });
}
