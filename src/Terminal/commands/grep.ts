import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { TextFilePath, hasTextExtension } from "../../Paths/TextFilePath";
import { Script } from "src/Script/Script";
import { TextFile } from "src/TextFile";
import { ScriptFilePath } from "src/Paths/ScriptFilePath";

const RED: string = "\x1b[31m"; // red
const DEF: string = "\x1b[0m"; // default
const GREEN: string = "\x1b[32m"; // green
const CYAN: string = "\x1b[36m"; // cyan
const MAGENTA: string = "\x1b[35m"; // Magenta

interface OkArgs {
  lineNum: string[];
  regExpr: string[];
  yesName: string[];
  notName: string[];
}

interface Options {
  lineNum: boolean;
  regExpr: boolean;
  yesName: boolean;
  notName: boolean;
  multiScript: boolean;
}

const OK_ARGS: OkArgs = {
  lineNum: ["-n", "--line-number"],
  regExpr: ["-G", "--basic-regexp"],
  yesName: ["-H", "--with-filename"],
  notName: ["-h", "--no-filename"],
};

function filterArgs([options, otherArgs]: [Options, string[]], arg: string): [Options, string[]] {
  const isOption: boolean = Object.keys(OK_ARGS).some((key: string): boolean =>
    OK_ARGS[key as keyof OkArgs].includes(arg) ? (options[key as keyof Options] = true) : false,
  );
  return isOption ? [options, otherArgs] : [options, [...otherArgs, arg]];
}

function parseScript(
  options: Options,
  pattern: string | RegExp,
): (script: Script | TextFile | null) => (string | null)[] | null {
  return function (script: Script | TextFile | null) {
    if (!script) return null;

    const content: string = "content" in script ? script["content"] : script["code"];

    const editedContent: (string | null)[] = content.split("\n").map((line: string, i: number): string | null => {
      const editedLine: string = line.replaceAll(pattern, `${RED}$&${DEF}`);
      if (line === editedLine) return null; // don't print unmatched lines
      const fileName: string =
        (options.multiScript || options.yesName) && !options.notName
          ? `${MAGENTA}${script.filename}${CYAN}:${DEF}`
          : "";
      const lineNo: string = options.lineNum ? `${GREEN}${i + 1}${CYAN}:${DEF}` : "";
      const prefix: string = fileName + lineNo;

      return prefix + editedLine;
    });

    return editedContent;
  };
}

function validateFiles(filesStrings: string[], server: BaseServer): [(Script | TextFile | null)[], string[]] {
  const badFiles: string[] = [];
  const okFiles: (Script | TextFile | null)[] = filesStrings.slice(1).map((arg: string): Script | TextFile | null => {
    const script: Script | TextFile | null = hasTextExtension(arg)
      ? Terminal.getTextFile(arg)
      : Terminal.getScript(arg);
    if (!script) {
      badFiles.push(arg);
    }
    return script;
  });

  // search all files on server if no file arguments passed
  const goodFiles = okFiles.length
    ? okFiles
    : [...(server?.scripts ?? []), ...(server?.textFiles ?? [])].map(
      (tuple: [TextFilePath | ScriptFilePath, TextFile | Script]): Script | TextFile => tuple[1],
    );

  return [goodFiles, badFiles];
}

export function grep(args: (string | number | boolean)[], server: BaseServer): void {
  if (!args.length) {
    return Terminal.error("Incorrect usage of grep command. Usage: grep [OPTION]... PATTERN [FILE]...");
  }

  const initArgs: [Options, []] = [
    { lineNum: false, regExpr: false, yesName: false, notName: false, multiScript: false },
    [],
  ];

  const [options, otherArgs]: [Options, string[]] = args.map(String).reduce(filterArgs, initArgs);

  const [okFiles, badFiles]: [(Script | TextFile | null)[], string[]] = validateFiles(otherArgs, server);

  options.multiScript = okFiles.length > 1;

  if (badFiles.length) {
    return Terminal.error(`Invalid filename(s): ${badFiles.join(", ")}`);
  }

  try {
    const pattern: string | RegExp = options.regExpr ? new RegExp(otherArgs[0],"g") : otherArgs[0];
    const result: string = okFiles
      .flatMap(parseScript(options, pattern))
      .filter((line: string | null) => !!line)
      .join("\n");
    Terminal.print(result);
  } catch (e) {
    Terminal.error("RegExp Err - " + e);
  }

}
