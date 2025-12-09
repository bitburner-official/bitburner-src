import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { StdIO } from "../StdIO/StdIO";

export function grow(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): void {
  if (args.length !== 0) return Terminal.error("Incorrect usage of grow command. Usage: grow", stdIO);

  if (server.purchasedByPlayer) return Terminal.error("Cannot grow your own machines!", stdIO);
  if (!server.hasAdminRights) return Terminal.error("You do not have admin rights for this machine!", stdIO);
  // Grow does not require meeting the hacking level, but undefined requiredHackingSkill indicates the wrong type of server.
  if (server.requiredHackingSkill === undefined) return Terminal.error("Cannot grow this server.", stdIO);
  Terminal.startGrow(stdIO);
}
