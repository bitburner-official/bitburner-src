import { Terminal } from "../../Terminal";
import { Player } from "@player";
import { BaseServer } from "../../Server/BaseServer";

export function hack(args: (string | number | boolean)[], server: BaseServer): void {
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
  Terminal.startHack();
}
