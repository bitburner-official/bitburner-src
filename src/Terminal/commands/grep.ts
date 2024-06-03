import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { GetServer } from "../../Server/AllServers";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { Script } from "src/Script/Script";
import { TextFile } from "src/TextFile";
import { Player } from "@player";

export function grep(args: (string | number | boolean)[]): void {
  if (args.length === 0) {
    return Terminal.error("Incorrect usage of grep command. Usage: grep [search string] ...[optional file path(s)]");
  }
  const argStrings: string[] = args.map(String);
  const query: string = argStrings[0];
  const server: BaseServer | null = GetServer(Player.currentServer);

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

  const defaultFiles: (Script | TextFile | null)[] = [...(server?.scripts ?? []), ...(server?.textFiles ?? [])].map(
    (tuple) => tuple[1],
  );

  const files : (Script | TextFile | null)[] = argScripts.length ? argScripts : defaultFiles;

  const result: string = files.reduce((accumulator: string, script) => {
    if (!script) return accumulator;
    let content: string = "";
    if ("content" in script) {
      content = script["content"];
    } else if ("code" in script) {
      content = script["code"];
    }
    if (!content.includes(query)) return accumulator;
    const editedContent:string = content
      .split("\n")
      .filter((line) => line.includes(query))
      .map((line, i) => editLine(line.split(query), query, i))
      .join("\n");
    return `${accumulator}\n${script.filename}\n${editedContent}\n`;
  }, "");

  Terminal.print(result);
}

  function editLine(line: string[], query: string, i: number): string {
    const red: string = "\x1b[31m"; // red
    const def: string = "\x1b[0m"; // default
    return `${i}:${line.join(`${red}${query}${def}`)}`;
  }
