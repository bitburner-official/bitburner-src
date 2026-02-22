import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";

export function weaken(args: (string | number | boolean)[], server: BaseServer): void {
  if (args.length !== 0) return Terminal.error("Incorrect usage of weaken command. Usage: weaken");

  if (server.purchasedByPlayer) return Terminal.error("Cannot weaken your own machines!");
  if (!server.hasAdminRights) return Terminal.error("You do not have admin rights for this machine!");
  // Weaken does not require meeting the hacking level, but undefined requiredHackingSkill indicates the wrong type of server.
  if (server.requiredHackingSkill === undefined) return Terminal.error("Cannot weaken this server.");
  Terminal.startWeaken();
}
