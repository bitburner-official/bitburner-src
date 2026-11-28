import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { showMessage } from "../../Message/MessageHelpers";
import { showLiterature } from "../../Literature/LiteratureHelpers";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { isMember } from "../../utils/EnumHelper";

export function cat(args: (string | number | boolean)[], server: BaseServer): undefined {
  if (args.length !== 1) return Terminal.error("Incorrect usage of cat command. Usage: cat [file]");

  const relative_filename = args[0] + "";
  const path = Terminal.getFilepath(relative_filename);
  if (!path) return Terminal.error(`Invalid filename: ${relative_filename}`);

  if (hasScriptExtension(path) || hasTextExtension(path)) {
    const file = server.getContentFile(path);
    if (!file) return Terminal.error(`No file at path ${path}`);
    dialogBoxCreate(`${file.filename}\n\n${file.content}`);
    return;
  }
  if (!path.endsWith(".msg") && !path.endsWith(".lit")) {
    return Terminal.error(
      "Invalid file extension. Filename must end with .msg, .lit, a script extension (.js, .jsx, .ts, .tsx) or a text extension (.txt, .json, .css)",
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
  Terminal.error(`No file at path ${path}`);
}
