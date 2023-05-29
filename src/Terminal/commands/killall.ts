import { killWorkerScriptByPid } from "../../Netscript/killWorkerScript";
import { BaseServer } from "../../Server/BaseServer";
import { Terminal } from "../../Terminal";

export function killall(_args: (string | number | boolean)[], server: BaseServer): void {
  Terminal.print("Killing all running scripts");
  for (const byPid of server.runningScriptMap.values()) {
    for (const runningScript of byPid.values()) {
      killWorkerScriptByPid(runningScript.pid);
    }
  }
}
