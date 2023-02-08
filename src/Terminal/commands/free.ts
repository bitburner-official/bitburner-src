import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { formatPercent, formatRam } from "../../ui/formatNumber";

export function free(args: (string | number | boolean)[], server: BaseServer): void {
  if (args.length !== 0) {
    Terminal.error("Incorrect usage of free command. Usage: free");
    return;
  }
  const ram = formatRam(server.maxRam);
  const used = formatRam(server.ramUsed);
  const avail = formatRam(server.maxRam - server.ramUsed);
  const maxLength = Math.max(ram.length, Math.max(used.length, avail.length));
  const usedPercent = formatPercent(server.ramUsed / server.maxRam);

  Terminal.print(`Total:     ${" ".repeat(maxLength - ram.length)}${ram}`);
  Terminal.print(`Used:      ${" ".repeat(maxLength - used.length)}${used} (${usedPercent})`);
  Terminal.print(`Available: ${" ".repeat(maxLength - avail.length)}${avail}`);
}
