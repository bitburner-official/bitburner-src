import { Terminal } from "../../Terminal";
import { formatRam } from "../../ui/formatNumber";
import { Settings } from "../../Settings/Settings";
import { BaseServer } from "../../Server/BaseServer";
import { StdIO } from "../StdIO/StdIO";

export function mem(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  try {
    if (args.length !== 1 && args.length !== 3) {
      Terminal.fatal("Incorrect usage of mem command. usage: mem [scriptname] [-t] [number threads]", stdIO);
      return;
    }

    const scriptName = args[0] + "";
    let numThreads = 1;
    if (args.length === 3 && args[1] === "-t") {
      numThreads = Math.round(parseInt(args[2] + ""));
      if (isNaN(numThreads) || numThreads < 1) {
        Terminal.fatal("Invalid number of threads specified. Number of threads must be greater than 1", stdIO);
        return;
      }
    }

    const script = Terminal.getScript(scriptName);
    if (script == null) {
      Terminal.fatal("mem failed. No such script exists!", stdIO);
      return;
    }

    const singleRamUsage = script.getRamUsage(server.scripts);
    if (!singleRamUsage) return Terminal.fatal(`Could not calculate ram usage for ${scriptName}`, stdIO);

    const ramUsage = singleRamUsage * numThreads;

    Terminal.print(`This script requires ${formatRam(ramUsage)} of RAM to run for ${numThreads} thread(s)`, stdIO);

    const verboseEntries = script.ramUsageEntries.sort((a, b) => b.cost - a.cost) ?? [];
    const padding = Settings.UseIEC60027_2 ? 9 : 8;
    for (const entry of verboseEntries) {
      Terminal.print(`${formatRam(entry.cost * numThreads).padStart(padding)} | ${entry.name} (${entry.type})`, stdIO);
    }

    if (ramUsage > 0 && verboseEntries.length === 0) {
      // Let's warn the user that he might need to save his script again to generate the detailed entries
      Terminal.warn("You might have to open & save this script to see the detailed RAM usage information.", stdIO);
    }
  } catch (error) {
    console.error(error);
    Terminal.fatal(String(error), stdIO);
  }
}
