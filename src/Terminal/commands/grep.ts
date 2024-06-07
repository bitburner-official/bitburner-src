import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { ContentFile, allContentFiles } from "../../Paths/ContentFile";
import { FilePath } from "src/Paths/FilePath";
import { Settings } from "../../Settings/Settings";
import { help } from "../commands/help";

type LineParser = (line: string, i: number) => LineInfo;
type PtLineParser = (filename: string, line: string, i: number) => LineInfo;
type FileParser = (file: ContentFile) => LineInfo[];

interface Lines {
  rawLine: string;
  prettyLine: string;
}

interface LineInfo {
  isPrint: boolean;
  isEdited: boolean;
  lines: Lines;
  filename: string;
}

interface ValidArgs {
  regExpr: string[];

  lineNum: string[];
  yesName: string[];
  notName: string[];
  invert: string[];

  quiet: string[];
  verbose: string[];

  toFile: string[];
  overWrite: string[];

  preContext: string[];
  context: string[];
  postContext: string[];

  help: string[];

  searchAll: string[];
}

interface Options {
  regExpr: boolean;

  lineNum: boolean;
  yesName: boolean;
  notName: boolean;
  invert: boolean;

  quiet: boolean;
  verbose: boolean;

  toFile: boolean;
  overWrite: boolean;

  searchAll: boolean;

  preContext: boolean;
  context: boolean;
  postContext: boolean;

  help: boolean;

  multiFile: boolean;
}

const VALID_ARGS: ValidArgs = {
  regExpr: ["-G", "--basic-regexp"],

  lineNum: ["-n", "--line-number"],
  yesName: ["-H", "--with-filename"],
  notName: ["-h", "--no-filename"],
  invert: ["-v", "--invert-match"],

  quiet: ["-q", "--quiet", "--silent"],
  verbose: ["-V", "--verbose"],

  toFile: ["-O", "--output"],
  overWrite: ["-f", "--allow-overwrite"],

  preContext: ["-B", "--before-context"],
  context: ["-C", "--context"],
  postContext: ["-A", "--after-context"],

  searchAll: ["-*", "--search-all"],

  help: ["--help"],
};

const RED: string = "\x1b[31m";
const DEFAULT: string = "\x1b[0m"; // default
const GREEN: string = "\x1b[32m";
const MAGENTA: string = "\x1b[35m";
const cyanColon: string = "\x1b[36m:" + DEFAULT;
const WHITE: string = "\x1b[37m";

function parseLine(pattern: string | RegExp, options: Options, filename: string, line: string, i: number): LineInfo {
  const editedLine: string = line.replaceAll(pattern, `${RED}$&${DEFAULT}`);

  const name: string = (options.multiFile || options.yesName) && !options.notName ? `${filename}` : "";
  const lineNo: string = options.lineNum ? `${i + 1}` : "";

  const [colName, rawName] = name ? [`${MAGENTA}${name}${cyanColon}`, `${name}:`] : ["", ""];
  const [colLineNo, rawLineNo] = lineNo ? [`${GREEN}${lineNo}${cyanColon}`, `${lineNo}:`] : ["", ""];
  const lines: Lines = { rawLine: rawName + rawLineNo + line, prettyLine: colName + colLineNo + editedLine };

  const isEdited = line !== editedLine;
  const isPrint = isEdited;

  return { isEdited, isPrint, lines, filename };
}

function parseFile(parseFunc: PtLineParser, file: ContentFile): LineInfo[] {
  const parseLine: LineParser = parseFunc.bind(null, file.filename);
  const editedContent: LineInfo[] = file.content.split("\n").map(parseLine);

  return editedContent;
}

function getServerFiles(server: BaseServer): [ContentFile[], string[]] {
  const files: ContentFile[] = [];
  for (const tuple of allContentFiles(server)) {
    files.push(tuple[1]);
  }
  return [files, []];
}

function getArgFiles(args: string[]): [ContentFile[], string[]] {
  const notFiles: string[] = [];
  const files: ContentFile[] = [];

  for (const arg of args) {
    const file: ContentFile | null = hasTextExtension(arg) ? Terminal.getTextFile(arg) : Terminal.getScript(arg);
    if (!file) notFiles.push(arg);
    else files.push(file);
  }

  return [files, notFiles];
}

function filterOpts([options, otherArgs]: [Options, string[]], arg: string): [Options, string[]] {
  const isOption: boolean = Object.keys(VALID_ARGS).some((key: string): boolean => {
    if (VALID_ARGS[key as keyof ValidArgs].includes(arg)) {
      return (options[key as keyof Options] = true);
    }
    return false;
  });

  return isOption ? [options, otherArgs] : [options, [...otherArgs, arg]];
}

function filterArgs(args: string[]): [Options, string[], string, number] {
  const initOpts: Options = {
    regExpr: false,

    lineNum: false,
    yesName: false,
    notName: false,
    invert: false,

    quiet: false,
    verbose: false,

    toFile: false,
    overWrite: false,

    preContext: false,
    context: false,
    postContext: false,

    searchAll: false,

    help: false,

    multiFile: false,
  };

  let outFileStr: string | undefined;
  let contextNum: string | undefined;

  [outFileStr, args] = getNextArg(args, VALID_ARGS.toFile);
  [contextNum, args] = getContext(args);

  const [options, otherArgs]: [Options, string[]] = args.map(String).reduce(filterOpts, [initOpts, []]);

  return [options, otherArgs, outFileStr ?? "", Number(contextNum) + 1 ?? 0];
}

function getContext(args: string[]): [string, string[]] | [undefined, string[]] {
  let context;
  [context, args] = getNextArg(args, VALID_ARGS.preContext);
  if (!context) [context, args] = getNextArg(args, VALID_ARGS.context);
  if (!context) [context, args] = getNextArg(args, VALID_ARGS.postContext);
  return [context, args];
}

function getNextArg(args: string[], validArgs: string[]): [string, string[]] | [undefined, string[]] {
  const argIndex = validArgs.reduce((ret: number, arg: string) => {
    const argIndex = args.indexOf(arg);
    return argIndex > -1 ? argIndex : ret;
  }, NaN);

  if (isNaN(argIndex)) return [undefined, args];

  const nextArg: string | number = args.splice(argIndex + 1, 1)?.[0];

  return [nextArg, args];
}

function filterResults(
  options: Options,
  [rawResult, prettyResult]: [string[], string[]],
  lineInfo: LineInfo,
): [string[], string[]] {
  return lineInfo.isPrint !== options.invert
    ? [
        [...rawResult, lineInfo.lines.rawLine],
        [...prettyResult, lineInfo.lines.prettyLine],
      ]
    : [rawResult, prettyResult];
}

function writeToFile(
  outFilePath: FilePath | null,
  outFileStr: string,
  options: Options,
  rawResult: string,
  server: BaseServer,
): void {
  if (!outFilePath || !hasTextExtension(outFilePath)) {
    return Terminal.error(
      `grep file output failed: Invalid output file "${outFileStr}". Output file must be a text file.`,
    );
  }

  if (options.toFile && !options.overWrite) {
    for (const tuple of allContentFiles(server)) {
      if (tuple[1].filename === outFilePath) {
        return Terminal.error(
          `grep file output failed: Invalid output file "${outFilePath}". Output file must not already exist. Pass -f/--allow-overwrite to overwrite.`,
        );
      }
    }
  }
  server.writeToContentFile(outFilePath, rawResult);
}

function addContext(results: LineInfo[], options: Options, contextNum: number): LineInfo[] {
  if (!(options.preContext || options.context || options.postContext)) return results;

  for (const [editLineIndex, line] of results.entries()) {
    if (!line.isEdited) continue;
    for (let contextLineIndex = 0; contextLineIndex < contextNum; contextLineIndex++) {
      let contextLine;
      if (options.preContext) contextLine = results[editLineIndex - contextLineIndex];
      else if (options.postContext) contextLine = results[editLineIndex + contextLineIndex];
      else if (options.context) contextLine = results[editLineIndex - Math.floor(contextNum / 2) + contextLineIndex];

      if (contextLine && line.filename === contextLine.filename) contextLine.isPrint = true;
    }
  }
  return results;
}

function getVerboseInfo(results: LineInfo[], files: ContentFile[], pattern: string | RegExp, options: Options): string {
  const totalLines = results.length;
  const matchCount = results.reduce((acc, result) => acc + Number(result.isEdited), 0);
  const info = [
    `${matchCount} ${options.invert ? "INVERTED" : ""} matches against`,
    `PATTERN "${pattern.toString()}" in`,
    `${totalLines} lines, in`,
    `${files.length} files:`,
    `\n${files
      .map((file, i) => `${i % 2 ? WHITE : ""}${file.filename}(${file.content.split("\n").length}loc)${DEFAULT}`)
      .join(", ")}`,
  ].join(" ");

  return options.verbose ? info : "";
}

export function grep(args: (string | number | boolean)[], server: BaseServer): void {
  if (!args.length) {
    return Terminal.error(
      "grep argument error. Usage: grep [OPTION]... PATTERN [FILE]... [-O] [OUTPUT FILE] [-B/A/C] [NUM]",
    );
  }

  const [options, otherArgs, outFileStr, contextNum]: [Options, string[], string, number] = filterArgs(
    args.map(String),
  );

  const outFilePath = Terminal.getFilepath(outFileStr);
  const fileArgs = otherArgs.slice(1);

  const [files, notFiles]: [ContentFile[], string[]] = options.searchAll
    ? getServerFiles(server)
    : getArgFiles(fileArgs);

  if (options.help) return help(["grep"]);

  options.multiFile = files.length > 1;

  if (notFiles.length) {
    return Terminal.error(`Invalid filename(s): ${notFiles.join(", ")}`);
  }
  if (!options.searchAll && !files.length) {
    return Terminal.error(
      "grep argument error: At least one FILE argument must be passed, or pass -*/--search-all to search all files on server",
    );
  }

  try {
    const pattern: string | RegExp = options.regExpr ? new RegExp(otherArgs[0], "g") : otherArgs[0];
    const fileParser: FileParser = parseFile.bind(null, parseLine.bind(null, pattern, options));
    const results: LineInfo[] = files.flatMap(fileParser);
    const [rawResult, prettyResult]: [string[], string[]] = addContext(results, options, contextNum).reduce(
      filterResults.bind(null, options),
      [[""], [""]],
    );
    // limit printing to terminal
    const printResult: string[] = prettyResult.slice(prettyResult.length - Settings.MaxTerminalCapacity);
    const isTruncated: boolean = prettyResult.length !== printResult.length;
    const truncateInfo: string = isTruncated
      ? `${RED}grep output TRUNCATED from ${prettyResult.length} lines to ${Settings.MaxTerminalCapacity} (Max terminal capacity)`
      : "";

    if (!options.quiet)
      Terminal.print(printResult.join("\n") + getVerboseInfo(results, files, pattern, options) + truncateInfo);
    if (options.toFile) writeToFile(outFilePath, outFileStr, options, rawResult.join("\n"), server);
  } catch (e) {
    Terminal.error("grep processing error: " + e);
  }
}
