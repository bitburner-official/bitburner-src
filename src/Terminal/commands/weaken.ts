import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { StdIO } from "../StdIO/StdIO";

export function weaken(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): void {
  if (args.length !== 0) return Terminal.fatal("Incorrect usage of weaken command. Usage: weaken", stdIO);

  if (server.purchasedByPlayer) return Terminal.fatal("Cannot weaken your own machines!", stdIO);
  if (!server.hasAdminRights) return Terminal.fatal("You do not have admin rights for this machine!", stdIO);
  // Weaken does not require meeting the hacking level, but undefined requiredHackingSkill indicates the wrong type of server.
  if (server.requiredHackingSkill === undefined) return Terminal.fatal("Cannot weaken this server.", stdIO);
  Terminal.startWeaken(stdIO);
}
