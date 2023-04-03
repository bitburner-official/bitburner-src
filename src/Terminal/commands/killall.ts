import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { killWorkerScript } from "../../Netscript/killWorkerScript";
import { WorkerScriptStartStopEventEmitter } from "../../Netscript/WorkerScriptStartStopEventEmitter";

export function killall(_args: (string | number | boolean)[], server: BaseServer): void {
  Terminal.print("Killing all running scripts");
  for (const runningScript of server.runningScripts) killWorkerScript(runningScript.pid);
  WorkerScriptStartStopEventEmitter.emit();
}
