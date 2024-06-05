import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { TextFilePath, hasTextExtension } from "../../Paths/TextFilePath";
import { Script } from "src/Script/Script";
import { TextFile } from "src/TextFile";
import { ScriptFilePath } from "src/Paths/ScriptFilePath";

type LineParser = (line: string, i: number) => string;
type GetLineParser = (filename: string) => LineParser;
type FileParser = (file: Script | TextFile | null) => string[] | string;
type File = Script | TextFile | null;
type FileTuple = [TextFilePath | ScriptFilePath, TextFile | Script];

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
  multiFile: boolean;
}

const OK_ARGS: OkArgs = {
  lineNum: ["-n", "--line-number"],
  regExpr: ["-G", "--basic-regexp"],
  yesName: ["-H", "--with-filename"],
  notName: ["-h", "--no-filename"],
};

function getParseFunc(pattern: string | RegExp, options: Options): GetLineParser {
  return function (filename: string): LineParser {
    return function (line: string, i: number): string {
      const RED: string = "\x1b[31m";
      const DEF: string = "\x1b[0m"; // default
      const GREEN: string = "\x1b[32m";
      const CYAN: string = "\x1b[36m";
      const MAGENTA: string = "\x1b[35m";

      const editedLine: string = line.replaceAll(pattern, `${RED}$&${DEF}`);
      if (line === editedLine) return ""; // don't print unmatched lines
      const name: string =
        (options.multiFile || options.yesName) && !options.notName ? `${MAGENTA}${filename}${CYAN}:${DEF}` : "";
      const lineNo: string = options.lineNum ? `${GREEN}${i + 1}${CYAN}:${DEF}` : "";
      const prefix: string = name + lineNo;

      return prefix + editedLine;
    };
  };
}

function parseFile(parseLine: GetLineParser): FileParser {
  return function (file: File) {
    if (!file) return "";
    const content: string = "content" in file ? file["content"] : file["code"];

    const editedContent: string[] = content.split("\n").map(parseLine(file.filename));

    return editedContent;
  };
}

function getServerFiles(server: BaseServer): [File[], string[]] {
  return [
    [...(server?.scripts ?? []), ...(server?.textFiles ?? [])].map((tuple: FileTuple): Script | TextFile => tuple[1]),
    [], // empty array for badFiles
  ];
}

function getArgFiles(args: string[]): [File[], string[]] {
  const badFiles: string[] = [];
  const okFiles: File[] = args.map((arg: string): File => {
    const script: File = hasTextExtension(arg) ? Terminal.getTextFile(arg) : Terminal.getScript(arg);
    if (!script) {
      badFiles.push(arg);
    }
    return script;
  });
  return [okFiles, badFiles];
}

function filterArgs([options, otherArgs]: [Options, string[]], arg: string): [Options, string[]] {
  const isOption: boolean = Object.keys(OK_ARGS).some((key: string): boolean =>
    OK_ARGS[key as keyof OkArgs].includes(arg) ? (options[key as keyof Options] = true) : false,
  );
  return isOption ? [options, otherArgs] : [options, [...otherArgs, arg]];
}

export function grep(args: (string | number | boolean)[], server: BaseServer): void {
  if (!args.length) {
    return Terminal.error("Incorrect usage of grep command. Usage: grep [OPTION]... PATTERN [FILE]...");
  }

  const initOpts: Options = { lineNum: false, regExpr: false, yesName: false, notName: false, multiFile: false };
  const [options, otherArgs]: [Options, string[]] = args.map(String).reduce(filterArgs, [initOpts, []]);

  const fileArgs = otherArgs.slice(1);

  const [okFiles, badFiles]: [File[], string[]] = fileArgs.length ? getArgFiles(fileArgs) : getServerFiles(server);

  options.multiFile = okFiles.length > 1;

  if (badFiles.length) {
    return Terminal.error(`Invalid filename(s): ${badFiles.join(", ")}`);
  }

  try {
    const pattern: string | RegExp = options.regExpr ? new RegExp(otherArgs[0], "g") : otherArgs[0];
    const result: string = okFiles
      .flatMap(parseFile(getParseFunc(pattern, options)))
      .filter((line: string) => line.length)
      .join("\n");
    Terminal.print(result);
  } catch (e) {
    Terminal.error("RegExp Err: " + e);
  }
}
