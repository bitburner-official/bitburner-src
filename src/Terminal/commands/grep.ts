import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { Script } from "src/Script/Script";
import { TextFile } from "src/TextFile";

const red: string = "\x1b[31m"; // red
const def: string = "\x1b[0m"; // default
const green: string = "\x1b[32m"; // green
const cyan: string = "\x1b[36m"; // cyan
const magenta: string = "\x1b[35m"; // Magenta

export function grep(args: (string | number | boolean)[], server: BaseServer): void {
  if (!args.length) {
    return Terminal.error("Incorrect usage of grep command. Usage: grep [OPTION]... PATTERN [FILE]...");
  }

  const [optionArgs, otherArgs]: [string[], string[]] = args.reduce(
    ([runArgs, otherArgs]: [string[], string[]], arg) => {
      const strArg: string = arg.toString();
      if (strArg.startsWith("-") || strArg.startsWith("--")) {
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
  const isNumbered: boolean = optionArgs.some((arg) => ["-n", "--line-number"].includes(arg));
  const isMultiscript: boolean =
    optionArgs.some((arg) => ["-H", "--with-filename"].includes(arg)) || validFiles.length > 1;
  const isRegExp: boolean = optionArgs.some((arg) => ["-G", "--basic-regexp"].includes(arg));

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
    if (!content.match(pattern)?.length) return accumulator;

    const editedContent: string = content
      .split("\n")
      .map((line, i) => {
        if (!line.match(pattern)?.length) return null;
        const prefix: string = `${isMultiscript ? `${magenta}${script.filename}${cyan}:${def}` : ""}${
          isNumbered ? `${green}${i + 1}${cyan}:${def}` : ""
        }`;
        return `${prefix}${line.replaceAll(pattern, `${red}$&${def}`)}`;
      })
      .filter((line) => line)
      .join("\n");

    return `${accumulator}${editedContent}\n`;
  }, "");

  Terminal.print(result);
}
