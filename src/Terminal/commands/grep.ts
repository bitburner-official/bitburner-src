import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { ContentFile, ContentFilePath, allContentFiles } from "../../Paths/ContentFile";

type LineParser = (line: string, i: number) => string;
type PtLineParser = (filename: string, line: string, i: number) => string;
type FileParser = (file: ContentFile | null) => string[] | string;
type FileTuple = [ContentFilePath, ContentFile];

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

function getParseFunc(pattern: string | RegExp, options: Options, filename: string, line: string, i: number): string {
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
}

function parseLine(parseFunc: PtLineParser): FileParser {
  return function (file: ContentFile | null): string | string[] {
    if (!file) return "";
    const content: string = "content" in file ? file["content"] : file["code"];

    const parseLine: LineParser = parseFunc.bind(null, file.filename);

    const editedContent: string | string[] = content.split("\n").map(parseLine);

    return editedContent;
  };
}

function getServerFiles(server: BaseServer): [ContentFile[], string[]] {
  return [
    [...allContentFiles(server)].map((tuple: FileTuple): ContentFile => tuple[1]),
    [], // empty array for badFiles
  ];
}

function getArgFiles(args: string[]): [(ContentFile | null)[], string[]] {
  const notFiles: string[] = [];
  const files: (ContentFile | null)[] = args.map((arg: string): ContentFile | null => {
    const script: ContentFile | null = hasTextExtension(arg) ? Terminal.getTextFile(arg) : Terminal.getScript(arg);
    if (!script) {
      notFiles.push(arg);
    }
    return script;
  });
  return [files, notFiles];
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

  const [files, notFiles]: [(ContentFile | null)[], string[]] = fileArgs.length
    ? getArgFiles(fileArgs)
    : getServerFiles(server);

  options.multiFile = files.length > 1;

  if (notFiles.length) {
    return Terminal.error(`Invalid filename(s): ${notFiles.join(", ")}`);
  }

  try {
    const pattern: string | RegExp = options.regExpr ? new RegExp(otherArgs[0], "g") : otherArgs[0];
    const parseFunc: PtLineParser = getParseFunc.bind(null, pattern, options);
    const result: string = files
      .flatMap(parseLine(parseFunc))
      .filter((line: string) => line.length)
      .join("\n");
    Terminal.print(result);
  } catch (e) {
    Terminal.error("RegExp Err: " + e);
  }
}
