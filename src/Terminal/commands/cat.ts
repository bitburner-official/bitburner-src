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

export function cat(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  const initialStdIn = stdIO.getAllCurrentStdin(false);
  const stdin = stdIO.stdin?.deref();
  const stdinIsClosed = !stdin || (stdin.isClosed && stdin.empty());
  const hasStdOut = !!stdIO.stdout;

  if (args.length === 0 && initialStdIn.length === 0 && stdinIsClosed) {
    return Terminal.fatal(
      `Incorrect use of cat command: No files specified, and no stdin provided. Try "cat [filename]"`,
      stdIO,
    );
  }
  if (!validateFilenames(args, server, stdIO)) {
    return;
  }

  // If only a single file is being catted, and no stdin/stdout redirects are being used, show the file dialog
  if (args.length === 1 && args[0] !== "-" && !initialStdIn.length && stdinIsClosed && !hasStdOut) {
    return showFileContentDialog(String(args[0]), server, stdIO);
  }

  const output = concatenateFileContents(args, server, initialStdIn);

  stdIO.write(output);

  if (stdinIsClosed) {
    stdIO.close();
  } else {
    void callOnRead(stdIO, (data: unknown, stdInOut) => {
      stdInOut.write(stringify(data));
    });
  }
}

export function concatenateFileContents(
  filenames: (string | number | boolean)[],
  server: BaseServer,
  initialStdin: string,
): string {
  let result = "";
  for (const arg of filenames) {
    const filename = String(arg);
    if (filename === "-") {
      result += initialStdin;
    } else {
      result += getFileContents(filename, server);
    }
  }
  if (!filenames.find((arg) => arg === "-")) {
    // If stdin location is not specified, append it to the end by default
    result += initialStdin;
  }
  return result;
}

export function getFileContents(filename: string, server: BaseServer): string {
  const path = Terminal.getFilepath(filename);
  if (!path) return "";

  if (hasScriptExtension(path) || hasTextExtension(path)) {
    const file = server.getContentFile(path);
    if (!file) return "";
    return file.content ?? "";
  }
  if (isMember("MessageFilename", path) && server.messages.includes(path)) {
    return stringify(Messages[path as MessageFilename].msg) + "\n";
  }
  if (isMember("LiteratureName", path) && server.messages.includes(path)) {
    const lit = Literatures[path as LiteratureName];
    return `${lit.title}\n\n${stringify(lit.text)}\n`;
  }
  return "";
}

function showFileContentDialog(filename: string, server: BaseServer, stdIO: StdIO): undefined {
  const path = Terminal.getFilepath(filename);
  if (!path) return Terminal.fatal(`Invalid filename: ${filename}`, stdIO);

  if (hasScriptExtension(path) || hasTextExtension(path)) {
    const file = server.getContentFile(path);
    if (!file) return Terminal.fatal(`No file at path ${path}`, stdIO);
    dialogBoxCreate(`${file.filename}\n\n${file.content}`);
    return;
  }
  if (isMember("MessageFilename", path) && server.messages.includes(path)) {
    showMessage(path);
    return;
  }
  if (isMember("LiteratureName", path) && server.messages.includes(path)) {
    showLiterature(path);
    return;
  }
}

export function validateFilenames(filenames: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): boolean {
  for (const filename of filenames) {
    if (filename === "-") continue;
    if (typeof filename !== "string") {
      Terminal.fatal(`Invalid filename: ${filename}`, stdIO);
      return false;
    }
    const path = Terminal.getFilepath(filename);
    if (!path) {
      Terminal.fatal(`Invalid filename: ${filename}`, stdIO);
      return false;
    }

    if (hasScriptExtension(path) || hasTextExtension(path)) {
      const file = server.getContentFile(path);
      if (!file) {
        Terminal.fatal(`No file at path ${path}`, stdIO);
        return false;
      }
    } else if (path.endsWith(".msg")) {
      if (!isMember("MessageFilename", path) || !server.messages.includes(path)) {
        Terminal.fatal(`No file at path ${path}`, stdIO);
        return false;
      }
    } else if (path.endsWith(".lit")) {
      if (!isMember("LiteratureName", path) || !server.messages.includes(path)) {
        Terminal.fatal(`No file at path ${path}`, stdIO);
        return false;
      }
    } else {
      Terminal.fatal(
        "Invalid file extension. Filename must end with .msg, .lit, a script extension (.js, .jsx, .ts, .tsx) or a text extension (.txt, .json, .css)",
        stdIO,
      );
      return false;
    }
  }
  return true;
}
