import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { killWorkerScriptByPid } from "../../Netscript/killWorkerScript";

export function killall(_args: (string | number | boolean)[], server: BaseServer): undefined {
  Terminal.print("正在终止所有运行中的脚本");
  for (const byPid of server.runningScriptMap.values()) {
    for (const runningScript of byPid.values()) {
      killWorkerScriptByPid(runningScript.pid);
    }
  }
}
