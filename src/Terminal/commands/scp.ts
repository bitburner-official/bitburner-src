import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { GetReachableServer } from "../../Server/AllServers";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { isMember } from "../../utils/EnumHelper";
import { LiteratureName } from "@enums";
import { ContentFile } from "../../Paths/ContentFile";

export function scp(args: (string | number | boolean)[], server: BaseServer): undefined {
  if (args.length < 2) {
    return Terminal.error("scp 命令用法不正确。用法：scp [source filename] [destination hostname]");
  }

  // Validate destination server
  const destHostname = String(args.pop());
  const destServer = GetReachableServer(destHostname);
  if (!destServer) return Terminal.error(`无效的目标服务器：${destHostname}`);

  // Validate filepaths
  const filenames = args.map(String);
  const files: (LiteratureName | ContentFile)[] = [];

  // File validation loop, handle all errors before copying any files
  for (const filename of filenames) {
    const path = Terminal.getFilepath(filename);
    if (!path) return Terminal.error(`无效的文件路径：${filename}`);
    // Validate .lit files
    if (path.endsWith(".lit")) {
      if (!isMember("LiteratureName", path) || !server.messages.includes(path)) {
        return Terminal.error(`scp 失败：服务器 ${server.hostname} 上不存在 ${path}`);
      }
      files.push(path);
      continue;
    }
    // Error for invalid filetype
    if (!hasScriptExtension(path) && !hasTextExtension(path)) {
      return Terminal.error(
        `scp 失败：${path} 的扩展名无效。scp 只适用于脚本（.js、.jsx、.ts、.tsx）、文本文件（.txt、.json、.css）和文学文件（.lit）`,
      );
    }
    const sourceContentFile = server.getContentFile(path);
    if (!sourceContentFile) return Terminal.error(`scp 失败：服务器 ${server.hostname} 上不存在 ${path}`);
    files.push(sourceContentFile);
  }

  // Actually copy the files (no more errors possible)
  for (const file of files) {
    // Lit files, entire "file" is just the name
    if (isMember("LiteratureName", file)) {
      if (destServer.messages.includes(file)) {
        Terminal.print(`${file} 已存在于 ${destHostname}，已跳过该文件`);
        continue;
      }
      destServer.messages.push(file);
      Terminal.print(`${file} 已复制到 ${destHostname}`);
      continue;
    }

    // Content files (script and txt)
    const { filename, content } = file;
    const { overwritten } = destServer.writeToContentFile(filename, content);
    if (overwritten) Terminal.warn(`${filename} 已存在于 ${destHostname}，已被覆盖`);
    else Terminal.print(`${filename} 已复制到 ${destHostname}`);
  }
}
