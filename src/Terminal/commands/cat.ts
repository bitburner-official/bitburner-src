import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { Messages, showMessage } from "../../Message/MessageHelpers";
import { showLiterature } from "../../Literature/LiteratureHelpers";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { isMember } from "../../utils/EnumHelper";
import { StdIO } from "../StdIO/StdIO";
import { Literatures } from "../../Literature/Literatures";
import { LiteratureName, MessageFilename } from "@enums";

export function cat(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): void {
  if (args.length !== 1) return Terminal.error("Incorrect usage of cat command. Usage: cat [file]", stdIO);

  const relative_filename = args[0] + "";
  const path = Terminal.getFilepath(relative_filename);
  if (!path) return Terminal.error(`Invalid filename: ${relative_filename}`, stdIO);

  if (hasScriptExtension(path) || hasTextExtension(path)) {
    const file = server.getContentFile(path);
    if (!file) return Terminal.error(`No file at path ${path}`, stdIO);

    if (stdIO.stdout?.isClosed) {
      return dialogBoxCreate(`${file.filename}\n\n${file.content}`);
    } else {
      stdIO.write(file.content);
      return;
    }
  }
  if (!path.endsWith(".msg") && !path.endsWith(".lit")) {
    return Terminal.error(
      "Invalid file extension. Filename must end with .msg, .lit, a script extension (.js, .jsx, .ts, .tsx) or a text extension (.txt, .json, .css)",
      stdIO,
    );
  }

  // Message
  if (isMember("MessageFilename", path) && server.messages.includes(path)) {
    if (stdIO.stdout?.isClosed) {
      return showMessage(path);
    } else {
      stdIO.write(Messages[path as MessageFilename]);
      return;
    }
  }
  if (isMember("LiteratureName", path) && server.messages.includes(path)) {
    if (stdIO.stdout?.isClosed) {
      return showLiterature(path);
    } else {
      stdIO.write(Literatures[path as LiteratureName]);
      return;
    }
  }
  Terminal.error(`No file at path ${path}`, stdIO);
}
