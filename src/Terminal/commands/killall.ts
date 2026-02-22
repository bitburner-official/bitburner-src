import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { killWorkerScriptByPid } from "../../Netscript/killWorkerScript";

export function killall(_args: (string | number | boolean)[], server: BaseServer): void {
  Terminal.print("Killing all running scripts");
  for (const byPid of server.runningScriptMap.values()) {
    for (const runningScript of byPid.values()) {
      killWorkerScriptByPid(runningScript.pid);
    }
  }
}
