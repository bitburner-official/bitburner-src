import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { ContentFile, ContentFilePath, allContentFiles } from "../../Paths/ContentFile";
import { FilePath } from "src/Paths/FilePath";

type LineParser = (line: string, i: number) => [string, string];
type PtLineParser = (filename: string, line: string, i: number) => [string, string];
type FileParser = (file: ContentFile | null) => [string, string][];
type FileTuple = [ContentFilePath, ContentFile];

interface OkArgs {
  lineNum: string[];
  regExpr: string[];
  yesName: string[];
  notName: string[];
  toFile: string[];
  overWrt: string[];
  quiet: string[];
}

interface Options {
  lineNum: boolean;
  regExpr: boolean;
  yesName: boolean;
  notName: boolean;
  toFile: boolean;
  overWrt: boolean;
  quiet: boolean;

  multiFile: boolean;
}

const OK_ARGS: OkArgs = {
  lineNum: ["-n", "--line-number"],
  regExpr: ["-G", "--basic-regexp"],
  yesName: ["-H", "--with-filename"],
  notName: ["-h", "--no-filename"],
  toFile: ["-O", "--output-number"],
  overWrt: ["-f", "--allow-overwite"],
  quiet: ["-q", "--quiet", "--silent"],
};

function parseLine(
  pattern: string | RegExp,
  options: Options,
  filename: string,
  line: string,
  i: number,
): [string, string] {
  const RED: string = "\x1b[31m";
  const DEF: string = "\x1b[0m"; // default
  const GREEN: string = "\x1b[32m";
  const CYAN: string = "\x1b[36m";
  const MAGENTA: string = "\x1b[35m";

  const editedLine: string = line.replaceAll(pattern, `${RED}$&${DEF}`);
  if (line === editedLine) {
    return ["", ""]; // don't print unmatched lines
  }
  const name: string =
    (options.multiFile || options.yesName) && !options.notName ? `${MAGENTA}${filename}${CYAN}:${DEF}` : "";
  const lineNo: string = options.lineNum ? `${GREEN}${i + 1}${CYAN}:${DEF}` : "";
  const prefix: string = name + lineNo;

  return [line, prefix + editedLine];
}

function parseFile(parseFunc: PtLineParser, file: ContentFile | null): [string, string][] {
  if (!file) {
    return [["", ""]];
  }
  const content: string = "content" in file ? file["content"] : file["code"];

  const parseLine: LineParser = parseFunc.bind(null, file.filename);

  const editedContent: [string, string][] = content.split("\n").map(parseLine);

  return editedContent;
}

function getServerFiles(server: BaseServer): [ContentFile[], string[]] {
  return [
    [...allContentFiles(server)].map((tuple: FileTuple): ContentFile => tuple[1]),
    [], // empty array for notFiles
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

function filterOpts([options, otherArgs]: [Options, string[]], arg: string): [Options, string[]] {
  const isOption: boolean = Object.keys(OK_ARGS).some((key: string): boolean =>
    OK_ARGS[key as keyof OkArgs].includes(arg) ? (options[key as keyof Options] = true) : false,
  );
  return isOption ? [options, otherArgs] : [options, [...otherArgs, arg]];
}

function filterArgs(args: string[]): [Options, string[], string] {
  const initOpts: Options = {
    lineNum: false,
    regExpr: false,
    yesName: false,
    notName: false,
    multiFile: false,
    toFile: false,
    overWrt: false,
    quiet: false,
  };

  const outputArgIndex = OK_ARGS.toFile.reduce((ret: number, arg: string) => {
    const argIndex = args.indexOf(arg);
    return argIndex > -1 ? argIndex : ret;
  }, NaN);
  // if outputArgIndex !NaN grab next arg as output file
  const outFileStr: string | undefined = !isNaN(outputArgIndex) ? args.splice(outputArgIndex + 1, 1)?.[0] : undefined;

  const [options, otherArgs]: [Options, string[]] = args.map(String).reduce(filterOpts, [initOpts, []]);

  options.toFile = !!outFileStr;

  return [options, otherArgs, outFileStr ?? ""];
}

function splitResults(
  [rawResult, prettyResult]: [string, string],
  [rawStr, prettyStr]: [string, string],
): [string, string] {
  return !rawStr || !prettyStr
    ? [rawResult, prettyResult]
    : [`${rawResult}\n${rawStr}`, `${prettyResult}\n${prettyStr}`];
}

function writeToFile(
  outFilePath: FilePath | null,
  outFileStr: string,
  options: Options,
  rawResult: string,
  server: BaseServer,
): void {
  if (!outFilePath || !hasTextExtension(outFilePath)) {
    return Terminal.error(`grep failed: Invalid output file "${outFileStr}". Output file must be a text file.`);
  }

  if (options.toFile && !options.overWrt) {
    const overWrtFileExists: boolean = [...allContentFiles(server)]
      .flatMap((tuple: FileTuple): string => tuple[1].filename)
      .includes(outFilePath);
    if (overWrtFileExists) {
      return Terminal.error(
        `grep failed: Invalid output file "${outFileStr}". Output file must not already exist. Pass -f to force.`,
      );
    }
  }
}

export function grep(args: (string | number | boolean)[], server: BaseServer): void {
  if (!args.length) {
    return Terminal.error("Incorrect usage of grep command. Usage: grep [OPTION]... PATTERN [FILE]...");
  }

  const [options, otherArgs, outFileStr]: [Options, string[], string] = filterArgs(args.map(String));

  const outFilePath = Terminal.getFilepath(outFileStr);

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
    const fileParser: FileParser = parseFile.bind(null, parseLine.bind(null, pattern, options));
    const [rawResult, prettyResult]: [string, string] = files.flatMap(fileParser).reduce(splitResults, ["", ""]);

    if (!options.quiet) Terminal.print(prettyResult);
    if (options.toFile) writeToFile(outFilePath, outFileStr, options, rawResult, server);
  } catch (e) {
    Terminal.error("RegExp Err: " + e);
  }
}
