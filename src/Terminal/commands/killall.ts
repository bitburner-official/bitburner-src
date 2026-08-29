import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { killWorkerScriptByPid } from "../../Netscript/killWorkerScript";
import { StdIO } from "../StdIO/StdIO";

export function killall(_args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  Terminal.print("Killing all running scripts", stdIO);
  for (const byPid of server.runningScriptMap.values()) {
    for (const runningScript of byPid.values()) {
      killWorkerScriptByPid(runningScript.pid);
    }
  }
}
