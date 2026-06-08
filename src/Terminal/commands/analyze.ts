import { Terminal } from "../../Terminal";
import type { TerminalAction } from "../TerminalAction";
import { Player } from "@player";
import { HacknetServer } from "../../Hacknet/HacknetServer";
import { Server } from "../../Server/Server";
import { DarknetServer } from "../../Server/DarknetServer";
import { formatMoney, formatPercent, formatRam, formatSecurity } from "../../ui/formatNumber";
import { calculateHackingChance, calculateHackingTime } from "../../Hacking";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";

export function analyze(args: (string | number | boolean)[]): undefined | TerminalAction {
  if (args.length !== 0) {
    Terminal.error("Incorrect usage of analyze command. Usage: analyze");
    return;
  }

  Terminal.print("Analyzing system...");
  const server = Player.getCurrentServer();
  return Terminal.timedAction(1, "analyze", () => {
    const isHacknet = server instanceof HacknetServer;
    Terminal.print(server.hostname + ": ");
    const org = server.organizationName;
    Terminal.print("Organization name: " + (!isHacknet ? org : "player"));
    const hasAdminRights = (!isHacknet && server.hasAdminRights) || isHacknet;
    Terminal.print("Root Access: " + (hasAdminRights ? "YES" : "NO"));
    const canRunScripts = hasAdminRights && server.maxRam > 0;
    Terminal.print("Can run scripts on this host: " + (canRunScripts ? "YES" : "NO"));
    Terminal.print("RAM: " + formatRam(server.maxRam));
    if (server instanceof DarknetServer && server.blockedRam) {
      Terminal.print("RAM blocked by owner: " + formatRam(server.blockedRam));
      Terminal.print("Stasis link: " + (server.hasStasisLink ? "YES" : "NO"));
      Terminal.print("Backdoor: " + (server.backdoorInstalled ? "YES" : "NO"));
    }
    if (server instanceof Server) {
      Terminal.print("Backdoor: " + (server.backdoorInstalled ? "YES" : "NO"));
      const hackingSkill = server.requiredHackingSkill;
      Terminal.print("Required hacking skill for hack() and backdoor: " + (!isHacknet ? hackingSkill : "N/A"));
      const security = server.hackDifficulty;
      Terminal.print("Server security level: " + (!isHacknet ? formatSecurity(security) : "N/A"));
      const hackingChance = calculateHackingChance(server, Player);
      Terminal.print("Chance to hack: " + (!isHacknet ? formatPercent(hackingChance) : "N/A"));
      const hackingTime = calculateHackingTime(server, Player) * 1000;
      Terminal.print("Time to hack: " + (!isHacknet ? convertTimeMsToTimeElapsedString(hackingTime, true) : "N/A"));
    }
    Terminal.print(
      `Total money available on server: ${server instanceof Server ? formatMoney(server.moneyAvailable, true) : "N/A"}`,
    );
    if (server instanceof Server) {
      const numPort = server.numOpenPortsRequired;
      Terminal.print("Required number of open ports for NUKE: " + (!isHacknet ? numPort : "N/A"));
      Terminal.print("SSH port: " + (server.sshPortOpen ? "Open" : "Closed"));
      Terminal.print("FTP port: " + (server.ftpPortOpen ? "Open" : "Closed"));
      Terminal.print("SMTP port: " + (server.smtpPortOpen ? "Open" : "Closed"));
      Terminal.print("HTTP port: " + (server.httpPortOpen ? "Open" : "Closed"));
      Terminal.print("SQL port: " + (server.sqlPortOpen ? "Open" : "Closed"));
    }
  });
}
