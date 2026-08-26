import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { combinePath, getFilenameOnly } from "../../Paths/FilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";

export function cp(args: (string | number | boolean)[], server: BaseServer): undefined {
  if (args.length !== 2) {
    return Terminal.error("cp 命令用法不正确。用法：cp [source filename] [destination]");
  }
  // Find the source file
  const sourceFilePath = Terminal.getFilepath(String(args[0]));
  if (!sourceFilePath) return Terminal.error(`无效的源文件名 ${args[0]}`);
  if (!hasTextExtension(sourceFilePath) && !hasScriptExtension(sourceFilePath)) {
    return Terminal.error("cp：只能对脚本和文本文件执行");
  }
  const source = server.getContentFile(sourceFilePath);
  if (!source) return Terminal.error(`未找到文件：${sourceFilePath}`);

  // Determine the destination file path.
  const destinationInput = String(args[1]);
  // First treat the input as a file path. If that fails, try treating it as a directory and reusing source filename.
  let destFilePath = Terminal.getFilepath(destinationInput);
  if (!destFilePath) {
    const destDirectory = Terminal.getDirectory(destinationInput);
    if (!destDirectory) return Terminal.error(`无法将 ${destinationInput} 解析为文件路径或目录`);
    destFilePath = combinePath(destDirectory, getFilenameOnly(sourceFilePath));
  }
  if (!hasTextExtension(destFilePath) && !hasScriptExtension(destFilePath)) {
    return Terminal.error(`cp：只能复制到脚本和文本文件（${destFilePath} 是无效的目标）`);
  }

  const result = server.writeToContentFile(destFilePath, source.content);
  Terminal.print(`文件 ${sourceFilePath} 已复制到 ${destFilePath}`);
  if (result.overwritten) Terminal.warn(`${destFilePath} 已被覆盖。`);
}
