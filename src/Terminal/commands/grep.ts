import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { GetServer } from "../../Server/AllServers";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { Script } from "src/Script/Script";
import { TextFile } from "src/TextFile";
import { Player } from "@player";

const red: string = "\x1b[31m"; // red
const def: string = "\x1b[0m"; // default
const green = "\x1b[32m"; // green
const cyan = "\x1b[36m"; // cyan
const magenta = "\x1b[35m"; // Magenta

export function grep(args: (string | number | boolean)[]): void {
  if (!args.length) {
    return Terminal.error("Incorrect usage of grep command. Usage: grep [search string] ...[optional file path(s)]");
  }

  const query = args[0].toString();
  const [runArgs, otherArgs]: [string[], string[]] = args.slice(1).reduce(
    ([runArgs, fileStrings]: [string[], string[]], arg) => {
      const strArg = arg.toString();

      if (strArg.startsWith("-") || strArg.startsWith("--")) {
        return [[...runArgs, strArg], fileStrings];
      } else {
        return [runArgs, [...fileStrings, strArg]];
      }
    },
    [[], []],
  );

  const badPaths: string[] = [];
  const argFiles: (Script | TextFile | null)[] = otherArgs.map((arg) => {
    const script: Script | TextFile | null = hasTextExtension(arg)
      ? Terminal.getTextFile(arg)
      : Terminal.getScript(arg);
    if (!script) {
      badPaths.push(arg);
    }
    return script;
  });
  // return early if errors found in file args
  if (badPaths.length) {
    return Terminal.error(`Invalid filename(s): ${badPaths.join(", ")}`);
  }

  // passed options
  const isNumbered: boolean = runArgs.some((arg) => ["-n", "--line-number"].includes(arg));
  const isMultiscript: boolean = argFiles.length > 1;

  const server: BaseServer | null = GetServer(Player.currentServer);
  const files: (Script | TextFile | null)[] = argFiles.length
    ? argFiles
    : [...(server?.scripts ?? []), ...(server?.textFiles ?? [])].map((tuple) => tuple[1]);

  const result: string = files.reduce((accumulator: string, script) => {
    if (!script) return accumulator;

    const content: string = "content" in script ? script["content"] : script["code"];
    if (!content.includes(query)) return accumulator;

    const editedContent: string = content
      .split("\n")
      .map((line, i) => {
        if (!line.includes(query)) return null;
        const prefix: string = `${isMultiscript ? `${magenta}${script.filename}${cyan}:${def}` : ""}${
          isNumbered ? `${green}${i + 1}${cyan}:${def}` : ""
        }`;
        const splits = line.split(query);

        return `${prefix}${splits.join(`${red}${query}${def}`)}`;
      })
      .filter((line) => line)
      .join("\n");

    return `${accumulator}${editedContent}\n`;
  }, "");

  Terminal.print(result);
}
