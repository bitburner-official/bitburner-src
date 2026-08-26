import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { directoryExistsOnServer, resolveDirectory } from "../../Paths/Directory";

export function cd(args: (string | number | boolean)[], server: BaseServer): undefined {
  if (args.length > 1) return Terminal.error("参数数量不正确。用法：cd [dir]");
  // If no arg was provided, just use "/".
  const userInput = String(args[0] ?? "/");
  const targetDir = resolveDirectory(userInput, Terminal.currDir);
  // Explicitly checking null due to root being ""
  if (targetDir === null) return Terminal.error(`无法解析目录 ${userInput}`);
  if (!directoryExistsOnServer(targetDir, server)) return Terminal.error(`目录 ${targetDir} 不存在。`);
  Terminal.setcwd(targetDir);
}
