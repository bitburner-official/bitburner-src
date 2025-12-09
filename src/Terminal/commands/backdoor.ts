import { Terminal } from "../../Terminal";
import { Player } from "@player";
import { BaseServer } from "../../Server/BaseServer";
import { Server } from "../../Server/Server";
import { StdIO } from "../StdIO/StdIO";

export function backdoor(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): void {
  if (args.length !== 0) {
    Terminal.error("Incorrect usage of backdoor command. Usage: backdoor", stdIO);
    return;
  }

  if (!(server instanceof Server)) {
    Terminal.error("Can only install a backdoor on normal servers", stdIO);
    return;
  }
  if (server.purchasedByPlayer) {
    Terminal.error(
      "Cannot install a backdoor on your own machines! You are currently connected to your home PC or one of your cloud servers.",
      stdIO,
    );
    return;
  }
  if (!server.hasAdminRights) {
    Terminal.error("You do not have admin rights for this machine", stdIO);
    return;
  }
  if (server.requiredHackingSkill > Player.skills.hacking) {
    Terminal.error(
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

  Terminal.startBackdoor(stdIO);
}
