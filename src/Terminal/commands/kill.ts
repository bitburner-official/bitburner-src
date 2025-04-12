import { Terminal } from "../../Terminal";
import { findRunningScripts } from "../../Script/ScriptHelpers";
import { killWorkerScriptByPid } from "../../Netscript/killWorkerScript";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";

import type { BaseServer } from "../../Server/BaseServer";

export function kill(args: (string | number | boolean)[], server: BaseServer): void {
  try {
    if (args.length < 1 || typeof args[0] === "boolean") {
      Terminal.error("Incorrect usage of kill command. Usage: kill [pid] or kill [scriptname] [arg1] [arg2]...");
      return;
    }

    // Kill by PID
    if (typeof args[0] === "number") {
      const pid = args[0];
      const res = killWorkerScriptByPid(pid);
      if (res) {
        Terminal.print(`Killing script with PID ${pid}`);
      } else {
        Terminal.error(`Failed to kill script with PID ${pid}. No such script is running`);
      }

      return;
    }

    const path = Terminal.getFilepath(args[0]);
    if (!path) return Terminal.error(`Invalid filename: ${args[0]}`);
    if (!hasScriptExtension(path)) return Terminal.error(`Invalid file extension. Kill can only be used on scripts.`);
    const runningScripts = findRunningScripts(path, args.slice(1), server);
    if (runningScripts === null) {
      Terminal.error("No such script is running. Nothing to kill");
      return;
    }
    let killed = 0;
    for (const pid of runningScripts.keys()) {
      killed++;
      if (killed < 5) {
        Terminal.print(`Killing ${path} with pid ${pid}`);
      }
      killWorkerScriptByPid(pid);
    }
    if (killed >= 5) {
      Terminal.print(`... killed ${killed} instances total`);
    }
  } catch (error) {
    console.error(error);
    Terminal.error(String(error));
  }
}
