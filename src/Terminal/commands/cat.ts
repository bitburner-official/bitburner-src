import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { MessageFilename, showMessage } from "../../Message/MessageHelpers";
import { showLiterature } from "../../Literature/LiteratureHelpers";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { checkEnum } from "../../utils/helpers/enum";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { LiteratureName } from "../../Literature/data/LiteratureNames";

export function cat(args: (string | number | boolean)[], server: BaseServer): void {
  if (args.length !== 1) return Terminal.error("Incorrect usage of cat command. Usage: cat [file]");

  const relative_filename = args[0] + "";
  const path = Terminal.getFilepath(relative_filename);
  if (!path) return Terminal.error(`Invalid filename: ${relative_filename}`);

  if (hasScriptExtension(path) || hasTextExtension(path)) {
    const file = server.getContentFile(path);
    if (!file) return Terminal.error(`No file at path ${path}`);
    return dialogBoxCreate(`${file.filename}\n\n${file.content}`);
  }
  if (!path.endsWith(".msg") && !path.endsWith(".lit")) {
    return Terminal.error("Invalid file extension. Filename must end with .msg, .txt, .lit, .script or .js");
  }

  // Message
  if (checkEnum(MessageFilename, path)) {
    if (server.messages.includes(path)) return showMessage(path);
  }
  if (checkEnum(LiteratureName, path)) {
    if (server.messages.includes(path)) return showLiterature(path);
  }
  Terminal.error(`No file at path ${path}`);
}
