import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { showMessage } from "../../Message/MessageHelpers";
import { showLiterature } from "../../Literature/LiteratureHelpers";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { isMember } from "../../utils/EnumHelper";

export function cat(args: (string | number | boolean)[], server: BaseServer): undefined {
  if (args.length !== 1) return Terminal.error("cat 命令用法不正确。用法：cat [file]");

  const relative_filename = args[0] + "";
  const path = Terminal.getFilepath(relative_filename);
  if (!path) return Terminal.error(`无效的文件名：${relative_filename}`);

  if (hasScriptExtension(path) || hasTextExtension(path)) {
    const file = server.getContentFile(path);
    if (!file) return Terminal.error(`路径 ${path} 处没有文件`);
    dialogBoxCreate(`${file.filename}\n\n${file.content}`);
    return;
  }
  if (!path.endsWith(".msg") && !path.endsWith(".lit")) {
    return Terminal.error(
      "无效的文件扩展名。文件名必须以 .msg、.lit、脚本扩展名（.js、.jsx、.ts、.tsx）或文本扩展名（.txt、.json、.css）结尾",
    );
  }

  // Message
  if (isMember("MessageFilename", path)) {
    if (server.messages.includes(path)) {
      showMessage(path);
      return;
    }
  }
  if (isMember("LiteratureName", path)) {
    if (server.messages.includes(path)) {
      showLiterature(path);
      return;
    }
  }
  Terminal.error(`路径 ${path} 处没有文件`);
}
