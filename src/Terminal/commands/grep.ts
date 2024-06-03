import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { GetServer } from "../../Server/AllServers";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { Script } from "src/Script/Script";
import { TextFile } from "src/TextFile";
import { Player } from "@player";

export function grep(args: (string | number | boolean)[]): void {
  if (!args.length) {
    return Terminal.error("Incorrect usage of grep command. Usage: grep [search string] ...[optional file path(s)]");
  }

  const argStrings: string[] = args.map(String);
  const badPaths: string[] = [];
  const argScripts: (Script | TextFile | null)[] = argStrings.slice(1).map((arg) => {
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

  const server: BaseServer | null = GetServer(Player.currentServer);
  const files: (Script | TextFile | null)[] = argScripts.length
    ? argScripts
    : [...(server?.scripts ?? []), ...(server?.textFiles ?? [])].map((tuple) => tuple[1]);

  const query: string = argStrings[0];
  const result: string = files.reduce((accumulator: string, script) => {
    if (!script) return accumulator;

    const content: string = "content" in script ? script["content"] : script["code"];
    if (!content.includes(query)) return accumulator;

    const editedContent: string = content
      .split("\n")
      .map((line, i) => (line.includes(query) ? editLine(line.split(query), query, i) : null))
      .filter((line) => line)
      .join("\n");

    return `${accumulator}\n${script.filename}\n${editedContent}\n`;
  }, "");

  Terminal.print(result);
}

function editLine(line: string[], query: string, i: number): string {
  const red: string = "\x1b[31m"; // red
  const def: string = "\x1b[0m"; // default
  return `${i + 1}:${line.join(`${red}${query}${def}`)}`;
}
