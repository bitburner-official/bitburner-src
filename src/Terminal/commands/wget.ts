import { Terminal } from "../../Terminal";
import { type TerminalAction, Cancellation } from "../TerminalAction";
import { BaseServer } from "../../Server/BaseServer";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";

export function wget(args: (string | number | boolean)[], server: BaseServer): undefined | TerminalAction {
  if (args.length !== 2 || typeof args[0] !== "string" || typeof args[1] !== "string") {
    Terminal.error("wget 命令用法不正确。用法：wget [url] [target file]");
    return;
  }

  const target = Terminal.getFilepath(args[1]);
  if (!target || (!hasScriptExtension(target) && !hasTextExtension(target))) {
    Terminal.error(`wget 失败：目标文件无效。目标文件必须是脚本文件或文本文件。`);
    return;
  }

  const abort = new AbortController();
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
    abort.abort("请求已取消");
  };

  const p = fetch(args[0], { signal: abort.signal })
    .then(async (response) => {
      if (response.status !== 200) {
        Terminal.error(`wget 失败。HTTP 状态码：${response.status}。`);
        return;
      }
      const writeResult = server.writeToContentFile(target, await response.text());
      if (writeResult.overwritten) {
        Terminal.print(`wget 成功获取内容并覆盖了 ${target}`);
      } else {
        Terminal.print(`wget 成功获取内容并写入新文件 ${target}`);
      }
    })
    .catch((reason) => {
      // Check the comment in wget of src\NetscriptFunctions.ts to see why we use Object.getOwnPropertyNames.
      Terminal.error(`wget 失败：${JSON.stringify(reason, Object.getOwnPropertyNames(reason))}`);
      if (cancelled) {
        // We need to propagate a Cancellation error to abort any chained
        // commands higher up.
        throw new Cancellation("wget");
      }
    });

  let state = 0;
  return {
    cancel: cancel,
    finished: p,
    getProgressText: () => {
      const spinChar = "\\|/-"[state];
      state = (state + 1) % 4;
      return `[${spinChar.repeat(50)}]`;
    },
  };
}
