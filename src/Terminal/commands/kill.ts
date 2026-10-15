import { Terminal } from "../../Terminal";
import { findRunningScripts } from "../../Script/ScriptHelpers";
import { killWorkerScriptByPid } from "../../Netscript/killWorkerScript";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";

import type { BaseServer } from "../../Server/BaseServer";
import { StdIO } from "../StdIO/StdIO";

export function kill(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  try {
    if (args.length < 1 || typeof args[0] === "boolean") {
      Terminal.fatal("Incorrect usage of kill command. Usage: kill [pid] or kill [scriptname] [arg1] [arg2]...", stdIO);
      return;
    }

    // Kill by PID
    if (typeof args[0] === "number") {
      const pid = args[0];
      const res = killWorkerScriptByPid(pid);
      if (res) {
        Terminal.print(`Killing script with PID ${pid}`, stdIO);
      } else {
        Terminal.fatal(`Failed to kill script with PID ${pid}. No such script is running`, stdIO);
      }

      return;
    }

    const path = Terminal.getFilepath(args[0]);
    if (!path) return Terminal.fatal(`Invalid filename: ${args[0]}`, stdIO);
    if (!hasScriptExtension(path))
      return Terminal.fatal(`Invalid file extension. Kill can only be used on scripts.`, stdIO);
    const runningScripts = findRunningScripts(path, args.slice(1), server);
    if (runningScripts === null) {
      Terminal.fatal("No such script is running. Nothing to kill", stdIO);
      return;
    }
    let killed = 0;
    for (const pid of runningScripts.keys()) {
      killed++;
      if (killed < 5) {
        Terminal.print(`Killing ${path} with pid ${pid}`, stdIO);
      }
      killWorkerScriptByPid(pid);
    }
    if (killed >= 5) {
      Terminal.print(`... killed ${killed} instances total`, stdIO);
    }
  } catch (error) {
    console.error(error);
    Terminal.fatal(String(error), stdIO);
  }
}
