import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { killWorkerScript } from "../../Netscript/killWorkerScript";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";

export function kill(args: (string | number | boolean)[], server: BaseServer): void {
  if (args.length < 1) {
    return Terminal.error("Incorrect usage of kill command. Usage: kill [pid] or kill [scriptname] [arg1] [arg2]...");
  }
  if (typeof args[0] === "number") {
    const pid = args[0];
    if (killWorkerScript(pid)) return Terminal.print(`Killing script with PID ${pid}`);
  }
  // Shift args doesn't need to be sliced to check runningScript args
  const fileName = String(args.shift());
  const path = Terminal.getFilepath(fileName);
  if (!path) return Terminal.error(`Could not parse filename: ${fileName}`);
  if (!hasScriptExtension(path)) return Terminal.error(`${path} does not have a script file extension`);

  const runningScript = server.getRunningScript(path, args);
  if (runningScript == null) return Terminal.error("No such script is running. Nothing to kill");

  killWorkerScript(runningScript.pid);
  Terminal.print(`Killing ${path}`);
}
