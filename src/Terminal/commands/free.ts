import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { formatPercent, formatRam } from "../../ui/formatNumber";

export function free(args: (string | number | boolean)[], server: BaseServer): undefined {
  if (args.length !== 0) {
    Terminal.error("free 命令用法不正确。用法：free");
    return;
  }
  const ram = formatRam(server.maxRam);
  const used = formatRam(server.ramUsed);
  const avail = formatRam(server.maxRam - server.ramUsed);
  const maxLength = Math.max(ram.length, Math.max(used.length, avail.length));
  const usedPercent = formatPercent(server.ramUsed / server.maxRam);

  Terminal.print(`总计：     ${" ".repeat(maxLength - ram.length)}${ram}`);
  Terminal.print(
    `已用：      ${" ".repeat(maxLength - used.length)}${used}` + (server.maxRam > 0 ? ` (${usedPercent})` : ""),
  );
  Terminal.print(`可用： ${" ".repeat(maxLength - avail.length)}${avail}`);
}
