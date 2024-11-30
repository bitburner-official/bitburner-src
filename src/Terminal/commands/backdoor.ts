import { Terminal } from "../../Terminal";
import { Player } from "@player";
import { BaseServer } from "../../Server/BaseServer";
import { Server } from "../../Server/Server";

export function backdoor(args: (string | number | boolean)[], server: BaseServer): void {
  if (args.length !== 0) {
    Terminal.error("Incorrect usage of backdoor command. Usage: backdoor");
    return;
  }

  if (!(server instanceof Server)) {
    Terminal.error("Can only install a backdoor on normal servers");
    return;
  }
  if (server.purchasedByPlayer) {
    Terminal.error(
      "Cannot install a backdoor on your own machines! You are currently connected to your home PC or one of your purchased servers.",
    );
    return;
  }
  if (!server.hasAdminRights) {
    Terminal.error("You do not have admin rights for this machine");
    return;
  }
  if (server.requiredHackingSkill > Player.skills.hacking) {
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

  Terminal.startBackdoor();
}
