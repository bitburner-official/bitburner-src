import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { formatPercent, formatRam } from "../../ui/formatNumber";
import { StdIO } from "../StdIO/StdIO";

export function free(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  if (args.length !== 0) {
    Terminal.fatal("Incorrect usage of free command. Usage: free", stdIO);
    return;
  }
  const ram = formatRam(server.maxRam);
  const used = formatRam(server.ramUsed);
  const avail = formatRam(server.maxRam - server.ramUsed);
  const maxLength = Math.max(ram.length, Math.max(used.length, avail.length));
  const usedPercent = formatPercent(server.ramUsed / server.maxRam);

  Terminal.print(`Total:     ${" ".repeat(maxLength - ram.length)}${ram}`, stdIO);
  Terminal.print(
    `Used:      ${" ".repeat(maxLength - used.length)}${used}` + (server.maxRam > 0 ? ` (${usedPercent})` : ""),
    stdIO,
  );
  Terminal.print(`Available: ${" ".repeat(maxLength - avail.length)}${avail}`, stdIO);
}
