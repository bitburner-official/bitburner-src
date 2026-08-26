import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { findRunningScripts } from "../../Script/ScriptHelpers";
import { hasScriptExtension, validScriptExtensions } from "../../Paths/ScriptFilePath";

export function check(args: (string | number | boolean)[], server: BaseServer): undefined {
  if (args.length < 1) {
    Terminal.error(`参数数量不正确。用法：check [script] [arg1] [arg2]...`);
  } else {
    const scriptName = Terminal.getFilepath(args[0] + "");
    if (!scriptName) return Terminal.error(`无效的文件名：${args[0]}`);

    // Can only tail script files
    if (!hasScriptExtension(scriptName)) {
      return Terminal.error(`check：文件扩展名必须是以下之一：${validScriptExtensions.join(", ")})`);
    }

    // Check that the script is running on this machine
    const runningScripts = findRunningScripts(scriptName, args.slice(1), server);
    if (runningScripts === null) {
      Terminal.error(`服务器上没有名为 ${scriptName} 的脚本在运行`);
      return;
    }
    const next = runningScripts.values().next();
    if (!next.done) {
      next.value.displayLog();
    }
  }
}
