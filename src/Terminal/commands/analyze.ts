import { Terminal } from "../../Terminal";
import type { TerminalAction } from "../TerminalAction";
import { StdIO } from "../StdIO/StdIO";
import { BaseServer } from "../../Server/BaseServer";
import { Player } from "@player";
import { HacknetServer } from "../../Hacknet/HacknetServer";
import { Server } from "../../Server/Server";
import { DarknetServer } from "../../Server/DarknetServer";
import { formatMoney, formatPercent, formatRam, formatSecurity } from "../../ui/formatNumber";
import { calculateHackingChance, calculateHackingTime } from "../../Hacking";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";

export function analyze(
  args: (string | number | boolean)[],
  server: BaseServer,
  stdIO: StdIO,
): undefined | TerminalAction {
  if (args.length !== 0) {
    Terminal.error("Incorrect usage of analyze command. Usage: analyze", stdIO);
    return;
  }

  Terminal.print("Analyzing system...", stdIO);
  return Terminal.timedAction(
    1,
    "analyze",
    () => {
      const isHacknet = server instanceof HacknetServer;
      Terminal.print(server.hostname + ": ", stdIO);
      const org = server.organizationName;
      Terminal.print("Organization name: " + (!isHacknet ? org : "player"), stdIO);
      const hasAdminRights = (!isHacknet && server.hasAdminRights) || isHacknet;
      Terminal.print("Root Access: " + (hasAdminRights ? "YES" : "NO"), stdIO);
      const canRunScripts = hasAdminRights && server.maxRam > 0;
      Terminal.print("Can run scripts on this host: " + (canRunScripts ? "YES" : "NO"), stdIO);
      Terminal.print("RAM: " + formatRam(server.maxRam), stdIO);
      if (server instanceof DarknetServer && server.blockedRam) {
        Terminal.print("RAM blocked by owner: " + formatRam(server.blockedRam), stdIO);
        Terminal.print("Stasis link: " + (server.hasStasisLink ? "YES" : "NO"), stdIO);
        Terminal.print("Backdoor: " + (server.backdoorInstalled ? "YES" : "NO"), stdIO);
      }
      if (server instanceof Server) {
        Terminal.print("Backdoor: " + (server.backdoorInstalled ? "YES" : "NO"), stdIO);
        const hackingSkill = server.requiredHackingSkill;
        Terminal.print("Required hacking skill for hack() and backdoor: " + (!isHacknet ? hackingSkill : "N/A"), stdIO);
        const security = server.hackDifficulty;
        Terminal.print("Server security level: " + (!isHacknet ? formatSecurity(security) : "N/A"), stdIO);
        const hackingChance = calculateHackingChance(server, Player);
        Terminal.print("Chance to hack: " + (!isHacknet ? formatPercent(hackingChance) : "N/A"), stdIO);
        const hackingTime = calculateHackingTime(server, Player) * 1000;
        Terminal.print(
          "Time to hack: " + (!isHacknet ? convertTimeMsToTimeElapsedString(hackingTime, true) : "N/A"),
          stdIO,
        );
      }
      Terminal.print(
        `Total money available on server: ${
          server instanceof Server ? formatMoney(server.moneyAvailable, true) : "N/A"
        }`,
        stdIO,
      );
      if (server instanceof Server) {
        const numPort = server.numOpenPortsRequired;
        Terminal.print("Required number of open ports for NUKE: " + (!isHacknet ? numPort : "N/A"), stdIO);
        Terminal.print("SSH port: " + (server.sshPortOpen ? "Open" : "Closed"), stdIO);
        Terminal.print("FTP port: " + (server.ftpPortOpen ? "Open" : "Closed"), stdIO);
        Terminal.print("SMTP port: " + (server.smtpPortOpen ? "Open" : "Closed"), stdIO);
        Terminal.print("HTTP port: " + (server.httpPortOpen ? "Open" : "Closed"), stdIO);
        Terminal.print("SQL port: " + (server.sqlPortOpen ? "Open" : "Closed"), stdIO);
      }
    },
    stdIO,
  );
}
