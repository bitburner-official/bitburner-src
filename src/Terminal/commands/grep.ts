import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { Script } from "src/Script/Script";
import { TextFile } from "src/TextFile";

const RED: string = "\x1b[31m"; // red
const DEF: string = "\x1b[0m"; // default
const GREEN: string = "\x1b[32m"; // green
const CYAN: string = "\x1b[36m"; // cyan
const MAGENTA: string = "\x1b[35m"; // Magenta

const VALID_ARGS = {
  lineNo: ["-n", "--line-number"],
  fileName: ["-H", "--with-filename"],
  regExp: ["-G", "--basic-regexp"],
};

export function grep(args: (string | number | boolean)[], server: BaseServer): void {
  if (!args.length) {
    return Terminal.error("Incorrect usage of grep command. Usage: grep [OPTION]... PATTERN [FILE]...");
  }

  const [optionArgs, otherArgs]: [string[], string[]] = args.reduce(
    ([runArgs, otherArgs]: [string[], string[]], arg) => {
      const strArg: string = arg.toString();
      const validArgs = Object.values(VALID_ARGS).flat();
      if (validArgs.includes(strArg)) {
        return [[...runArgs, strArg], otherArgs];
      } else {
        return [runArgs, [...otherArgs, strArg]];
      }
    },
    [[], []],
  );

  const badFiles: string[] = [];
  const validFiles: (Script | TextFile | null)[] = otherArgs.slice(1).map((arg) => {
    const script: Script | TextFile | null = hasTextExtension(arg)
      ? Terminal.getTextFile(arg)
      : Terminal.getScript(arg);
    if (!script) {
      badFiles.push(arg);
    }
    return script;
  });
  // return early if errors found in file args
  if (badFiles.length) {
    return Terminal.error(`Invalid filename(s): ${badFiles.join(", ")}`);
  }

  // passed options
  const isNumbered: boolean = optionArgs.some((arg) => VALID_ARGS.lineNo.includes(arg));
  const isMultiscript: boolean = optionArgs.some((arg) => VALID_ARGS.fileName.includes(arg)) || validFiles.length > 1;
  const isRegExp: boolean = optionArgs.some((arg) => VALID_ARGS.regExp.includes(arg));

  let pattern: string | RegExp = otherArgs[0];
  if (isRegExp) {
    try {
      pattern = new RegExp(pattern, "g");
    } catch (e) {
      return Terminal.error(`Regular expression ${e}`);
    }
  }

  // search all files on server if no file arguments passed
  const searchFiles: (Script | TextFile | null)[] = validFiles.length
    ? validFiles
    : [...(server?.scripts ?? []), ...(server?.textFiles ?? [])].map((tuple) => tuple[1]);

  const result: string = searchFiles.reduce((accumulator: string, script) => {
    if (!script) return accumulator;

    const content: string = "content" in script ? script["content"] : script["code"];

    const editedContent: string = content
      .split("\n")
      .map((line, i) => {
        const editedLine = line.replaceAll(pattern, `${RED}$&${DEF}`);
        if (line === editedLine) return null; // don't print unmatched lines
        const fileName: string = isMultiscript ? `${MAGENTA}${script.filename}${CYAN}:${DEF}` : "";
        const lineNo: string = isNumbered ? `${GREEN}${i + 1}${CYAN}:${DEF}` : "";
        const prefix: string = fileName + lineNo;

        return `${prefix}${editedLine}`;
      })
      .filter((line) => line)
      .join("\n");

    return `${accumulator}${editedContent}\n`;
  }, "");

  Terminal.print(result);
}
