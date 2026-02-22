import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";

export function grow(args: (string | number | boolean)[], server: BaseServer): void {
  if (args.length !== 0) return Terminal.error("Incorrect usage of grow command. Usage: grow");

  if (server.purchasedByPlayer) return Terminal.error("Cannot grow your own machines!");
  if (!server.hasAdminRights) return Terminal.error("You do not have admin rights for this machine!");
  // Grow does not require meeting the hacking level, but undefined requiredHackingSkill indicates the wrong type of server.
  if (server.requiredHackingSkill === undefined) return Terminal.error("Cannot grow this server.");
  Terminal.startGrow();
}
