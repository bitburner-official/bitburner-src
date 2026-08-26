import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";

export function mv(args: (string | number | boolean)[], server: BaseServer): undefined {
  if (args.length !== 2) {
    Terminal.error(`参数数量不正确。用法：mv [src] [dest]`);
    return;
  }
  const [source, destination] = args.map((arg) => arg + "");

  const sourcePath = Terminal.getFilepath(source);
  if (!sourcePath) return Terminal.error(`无效的源文件名：${source}`);
  const destinationPath = Terminal.getFilepath(destination);
  if (!destinationPath) return Terminal.error(`无效的目标文件名：${destinationPath}`);

  if (
    (!hasScriptExtension(sourcePath) && !hasTextExtension(sourcePath)) ||
    (!hasScriptExtension(destinationPath) && !hasTextExtension(destinationPath))
  ) {
    return Terminal.error(`'mv' 只能用于脚本（.js、.jsx、.ts、.tsx）和文本文件（.txt、.json、.css）`);
  }

  // Allow content to be moved between scripts and textfiles, no need to limit this.
  const sourceContentFile = server.getContentFile(sourcePath);
  if (!sourceContentFile) return Terminal.error(`源文件 ${sourcePath} 不存在`);

  if (!sourceContentFile.deleteFromServer(server)) {
    return Terminal.error(
      `无法从原位置移除源文件 ${sourcePath}。如果 ${sourcePath} 是脚本，请确保在使用 'mv' 之前它没有在运行。`,
    );
  }
  Terminal.print(`已将 ${sourcePath} 移动到 ${destinationPath}`);
  const { overwritten } = server.writeToContentFile(destinationPath, sourceContentFile.content);
  if (overwritten) Terminal.warn(`${destinationPath} 已被覆盖。`);
}
