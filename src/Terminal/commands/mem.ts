import { Terminal } from "../../Terminal";
import { formatRam } from "../../ui/formatNumber";
import { Settings } from "../../Settings/Settings";
import { BaseServer } from "../../Server/BaseServer";

export function mem(args: (string | number | boolean)[], server: BaseServer): undefined {
  try {
    if (args.length !== 1 && args.length !== 3) {
      Terminal.error("mem 命令用法不正确。用法：mem [scriptname] [-t] [number threads]");
      return;
    }

    const scriptName = args[0] + "";
    let numThreads = 1;
    if (args.length === 3 && args[1] === "-t") {
      numThreads = Math.round(parseInt(args[2] + ""));
      if (isNaN(numThreads) || numThreads < 1) {
        Terminal.error("指定的线程数无效。线程数必须大于 1");
        return;
      }
    }

    const script = Terminal.getScript(scriptName);
    if (script == null) {
      Terminal.error("mem 执行失败。该脚本不存在！");
      return;
    }

    const singleRamUsage = script.getRamUsage(server.scripts);
    if (!singleRamUsage) return Terminal.error(`无法计算 ${scriptName} 的 RAM 占用`);

    const ramUsage = singleRamUsage * numThreads;

    Terminal.print(`此脚本以 ${numThreads} 个线程运行需要 ${formatRam(ramUsage)} 的 RAM`);

    const verboseEntries = script.ramUsageEntries.sort((a, b) => b.cost - a.cost) ?? [];
    const padding = Settings.UseIEC60027_2 ? 9 : 8;
    for (const entry of verboseEntries) {
      Terminal.print(`${formatRam(entry.cost * numThreads).padStart(padding)} | ${entry.name} (${entry.type})`);
    }

    if (ramUsage > 0 && verboseEntries.length === 0) {
      // Let's warn the user that he might need to save his script again to generate the detailed entries
      Terminal.warn("你可能需要打开并重新保存此脚本，才能看到详细的 RAM 占用信息。");
    }
  } catch (error) {
    console.error(error);
    Terminal.error(String(error));
  }
}
