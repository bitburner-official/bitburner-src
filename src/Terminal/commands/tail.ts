import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { findRunningScripts, findRunningScriptByPid } from "../../Script/ScriptHelpers";
import { LogBoxEvents } from "../../ui/React/LogBoxManager";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";

export function tail(commandArray: (string | number | boolean)[], server: BaseServer): undefined {
  try {
    if (commandArray.length < 1) {
      Terminal.error("参数数量不正确。用法：tail [pid] 或 tail [scriptname] [arg1] [arg2]...");
    } else if (typeof commandArray[0] === "string") {
      const [rawName, ...args] = commandArray;
      const path = Terminal.getFilepath(rawName);
      if (!path) return Terminal.error(`无效的文件名：${rawName}`);
      if (!hasScriptExtension(path)) return Terminal.error(`无效的文件扩展名。tail 只能用于脚本。`);

      const candidates = findRunningScripts(path, args, server);

      // if there's no candidate then we just don't know.
      if (candidates === null) {
        Terminal.error(`服务器上没有名为 ${path}、参数为 ${JSON.stringify(args)} 的脚本在运行`);
        return;
      }
      // Just use the first one (if there are multiple with the same
      // arguments, they can't be distinguished except by pid).
      const next = candidates.values().next();
      if (!next.done) {
        LogBoxEvents.emit(next.value);
      }
    } else if (typeof commandArray[0] === "number") {
      const runningScript = findRunningScriptByPid(commandArray[0]);
      if (runningScript == null) {
        Terminal.error(`没有 PID 为 ${commandArray[0]} 的脚本在运行`);
        return;
      }
      LogBoxEvents.emit(runningScript);
    }
  } catch (error) {
    console.error(error);
    Terminal.error(String(error));
  }
}
