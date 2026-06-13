import { Terminal } from "../../Terminal";
import type { TerminalAction } from "../TerminalAction";
import { Player } from "@player";
import { BaseServer } from "../../Server/BaseServer";
import { HacknetServer } from "../../Hacknet/HacknetServer";
import { Server } from "../../Server/Server";
import { StdIO } from "../StdIO/StdIO";
import { DarknetServer } from "../../Server/DarknetServer";
import { Page } from "../../ui/Router";
import { Router } from "../../ui/GameRoot";
import { Engine } from "../../engine";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { calculateHackingTime } from "../../Hacking";

export function backdoor(
  args: (string | number | boolean)[],
  server: BaseServer,
  stdIO: StdIO,
): undefined | TerminalAction {
  if (args.length !== 0) {
    Terminal.fatal("Incorrect usage of backdoor command. Usage: backdoor", stdIO);
    return;
  }

  if (!(server instanceof Server) && !(server instanceof DarknetServer)) {
    Terminal.fatal("Can only install a backdoor on normal servers", stdIO);
    return;
  }
  if (server.purchasedByPlayer) {
    Terminal.fatal(
      "Cannot install a backdoor on your own machines! You are currently connected to your home PC or one of your cloud servers.",
      stdIO,
    );
    return;
  }
  if (!server.hasAdminRights) {
    Terminal.fatal("You do not have admin rights for this machine!", stdIO);
    return;
  }
  if (server.requiredHackingSkill && server.requiredHackingSkill > Player.skills.hacking) {
    Terminal.fatal(
      "Your hacking skill is not high enough to install a backdoor on this machine. Try analyzing the machine to determine the required hacking skill.",
      stdIO,
    );
    return;
  }

  if (server.backdoorInstalled) {
    Terminal.warn(
      `You have already installed a backdoor on this server. You can check the "Backdoor" status via the "analyze" command.`,
      stdIO,
    );
  }

  // Backdoor should take the same amount of time as hack
  if (server instanceof HacknetServer) {
    Terminal.error("Cannot backdoor this kind of server", stdIO);
    return;
  }
  if (!(server instanceof Server || server instanceof DarknetServer)) {
    throw new Error("server should be normal server");
  }
  return Terminal.timedAction(
    calculateHackingTime(server, Player) / 4,
    "backdoor",
    () => {
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

      Terminal.print(`Backdoor on '${server.hostname}' successful!`, stdIO);
    },
    stdIO,
  );
}
