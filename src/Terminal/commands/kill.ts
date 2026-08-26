import { Terminal } from "../../Terminal";
import { findRunningScripts } from "../../Script/ScriptHelpers";
import { killWorkerScriptByPid } from "../../Netscript/killWorkerScript";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";

import type { BaseServer } from "../../Server/BaseServer";

export function kill(args: (string | number | boolean)[], server: BaseServer): undefined {
  try {
    if (args.length < 1 || typeof args[0] === "boolean") {
      Terminal.error("kill 命令用法不正确。用法：kill [pid] 或 kill [scriptname] [arg1] [arg2]...");
      return;
    }

    // Kill by PID
    if (typeof args[0] === "number") {
      const pid = args[0];
      const res = killWorkerScriptByPid(pid);
      if (res) {
        Terminal.print(`正在终止 PID 为 ${pid} 的脚本`);
      } else {
        Terminal.error(`终止 PID 为 ${pid} 的脚本失败。该脚本没有在运行`);
      }

      return;
    }

    const path = Terminal.getFilepath(args[0]);
    if (!path) return Terminal.error(`无效的文件名：${args[0]}`);
    if (!hasScriptExtension(path)) return Terminal.error(`无效的文件扩展名。kill 只能用于脚本。`);
    const runningScripts = findRunningScripts(path, args.slice(1), server);
    if (runningScripts === null) {
      Terminal.error("该脚本没有在运行。没有可终止的脚本");
      return;
    }
    let killed = 0;
    for (const pid of runningScripts.keys()) {
      killed++;
      if (killed < 5) {
        Terminal.print(`正在终止 ${path}（pid ${pid}）`);
      }
      killWorkerScriptByPid(pid);
    }
    if (killed >= 5) {
      Terminal.print(`... 共终止了 ${killed} 个实例`);
    }
  } catch (error) {
    console.error(error);
    Terminal.error(String(error));
  }
}
