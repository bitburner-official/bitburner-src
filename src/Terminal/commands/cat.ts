import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { Messages, showMessage } from "../../Message/MessageHelpers";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { isMember } from "../../utils/EnumHelper";
import { StdIO } from "../StdIO/StdIO";
import { Literatures } from "../../Literature/Literatures";
import { LiteratureName, MessageFilename } from "@enums";
import { callOnRead } from "../StdIO/RedirectIO";
import { stringify } from "../StdIO/utils";
import { showLiterature } from "../../Literature/LiteratureHelpers";
import { dialogBoxCreate } from "../../ui/React/DialogBox";

export function cat(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): void {
  const initialStdIn = stdIO.getAllCurrentStdin();
  const stdin = stdIO.stdin?.deref();
  const stdinIsClosed = !stdin || (stdin.isClosed && stdin.empty());
  const hasStdOut = !!stdIO.stdout;
  let initialStdOut = "";

  // If only a single file is being catted, and no stdin/stdout redirects are being used, show the file dialog that cat has always used
  const isBasicFileCat = args.length === 1 && args[0] !== "-" && !initialStdIn.length && stdinIsClosed && !hasStdOut;

  if (args.length === 0 && initialStdIn.length === 0 && stdinIsClosed) {
    return Terminal.error(
      `Incorrect use of cat command: No files specified, and no stdin provided. Try "cat [filename]"`,
      stdIO,
    );
  }

  for (const arg of args) {
    if (arg === "-") {
      initialStdOut += initialStdIn;
    } else {
      const content = getFileContents(String(arg), server, stdIO, isBasicFileCat);
      if (content === undefined) {
        stdIO.close();
        return;
      }
      initialStdOut += content + "\n";
    }
  }

  if (!args.find((arg) => arg === "-")) {
    // If stdin location is not specified, append it to the end by default
    initialStdOut += initialStdIn;
  }

  stdIO.write(initialStdOut.trim());

  void callOnRead(stdIO, (data: unknown, stdInOut) => {
    stdInOut.write(stringify(data) + "\n");
  });
}

function getFileContents(filename: string, server: BaseServer, stdIO: StdIO, isBasicFileCat: boolean) {
  const path = Terminal.getFilepath(filename);
  if (!path) return Terminal.error(`Invalid filename: ${filename}`, stdIO);

  if (hasScriptExtension(path) || hasTextExtension(path)) {
    const file = server.getContentFile(path);
    if (!file) return Terminal.error(`No file at path ${path}`, stdIO);
    if (isBasicFileCat) {
      return dialogBoxCreate(`${file.filename}\n\n${file.content}`);
    }
    return file.content;
  }
  if (!path.endsWith(".msg") && !path.endsWith(".lit")) {
    return Terminal.error(
      "Invalid file extension. Filename must end with .msg, .lit, a script extension (.js, .jsx, .ts, .tsx) or a text extension (.txt, .json, .css)",
      stdIO,
    );
  }

  // Message
  if (isMember("MessageFilename", path) && server.messages.includes(path)) {
    if (isBasicFileCat) {
      return showMessage(path);
    }
    return stringify(Messages[path as MessageFilename].msg);
  }
  if (isMember("LiteratureName", path) && server.messages.includes(path)) {
    if (isBasicFileCat) {
      return showLiterature(path);
    }
    const lit = Literatures[path as LiteratureName];
    return `${lit.title}\n\n${stringify(lit.text)}`;
  }
  Terminal.error(`No file at path ${path}`, stdIO);
}
