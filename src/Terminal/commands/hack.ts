import { Terminal } from "../../Terminal";
import { Player } from "@player";
import { BaseServer } from "../../Server/BaseServer";
import { StdIO } from "../StdIO/StdIO";

export function hack(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): void {
  if (args.length !== 0) return Terminal.fatal("Incorrect usage of hack command. Usage: hack", stdIO);
  if (server.purchasedByPlayer) return Terminal.fatal("Cannot hack your own machines!", stdIO);
  if (!server.hasAdminRights) return Terminal.fatal("You do not have admin rights for this machine!", stdIO);
  // Acts as a functional check that the server is hackable. Hacknet servers should already be filtered out anyway by purchasedByPlayer
  if (server.requiredHackingSkill === undefined) return Terminal.fatal("Cannot hack this server.", stdIO);
  if (server.requiredHackingSkill > Player.skills.hacking) {
    return Terminal.fatal(
      "Your hacking skill is not high enough to hack this machine. Try analyzing the machine to determine the required hacking skill",
      stdIO,
    );
  }
  Terminal.startHack(stdIO);
}
