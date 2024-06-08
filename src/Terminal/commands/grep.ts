import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { ContentFile, allContentFiles } from "../../Paths/ContentFile";
import { FilePath } from "src/Paths/FilePath";
import { Settings } from "../../Settings/Settings";
import { help } from "../commands/help";

type LineParser = (line: string, i: number) => Line;
type PtLineParser = (options: Options, filename: string, line: string, i: number) => Line;
type FileParser = (file: ContentFile, i: number) => Line[];

interface LineStrings {
  rawLine: string;
  prettyLine: string;
}

interface Line {
  isPrint: boolean;
  isMatched: boolean;
  lines: LineStrings;
  filename: string;
}

interface Options {
  regExpr: boolean;

  lineNum: boolean;
  yesName: boolean;
  notName: boolean;
  invert: boolean;
  limit: boolean;

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

interface ValidArgs {
  regExpr: string[];

  lineNum: string[];
  yesName: string[];
  notName: string[];
  invert: string[];
  limit: string[];

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

const VALID_ARGS: ValidArgs = {
  regExpr: ["-G", "--basic-regexp"],

  lineNum: ["-n", "--line-number"],
  yesName: ["-H", "--with-filename"],
  notName: ["-h", "--no-filename"],
  invert: ["-v", "--invert-match"],
  limit: ["-m", "--max-count"],

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
const CYAN: string = "\x1b[36m";
const WHITE: string = "\x1b[37m";

class Args {
  args: string[];

  constructor(args: (string | number | boolean)[]) {
    this.args = args.map(String);
  }

  initOpts: Options = {
    regExpr: false,

    lineNum: false,
    yesName: false,
    notName: false,
    invert: false,
    limit: false,

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

  splitOptsAndArgs(): [Options, string[], string, number, number] {
    let outFile, limit, context;

    [outFile, this.args] = this.spliceOptParam(VALID_ARGS.toFile);
    [limit, this.args] = this.spliceOptParam(VALID_ARGS.limit);
    [context, this.args] = this.spliceOptParam(VALID_ARGS.preContext);
    if (!context) [context, this.args] = this.spliceOptParam(VALID_ARGS.context);
    if (!context) [context, this.args] = this.spliceOptParam(VALID_ARGS.postContext);

    const outFileStr: string = outFile ?? "";
    const limitNum: number = limit ? Number(limit) : -1;
    const contextNum: number = context ? Number(context) : 1;

    const [options, otherArgs] = this.args.map(String).reduce(
      ([options, otherArgs]: [Options, string[]], arg: string): [Options, string[]] => {
        const isOption: boolean = Object.keys(VALID_ARGS).some((key: string): boolean => {
          if (VALID_ARGS[key as keyof ValidArgs].includes(arg)) {
            return (options[key as keyof Options] = true);
          }
          return false;
        });
        return isOption ? [options, otherArgs] : [options, [...otherArgs, arg]];
      },
      [this.initOpts, []],
    );

    return [options, otherArgs, outFileStr, contextNum, limitNum];
  }

  spliceOptParam(validArgs: string[]): [string, string[]] | [undefined, string[]] {
    const argIndex = validArgs.reduce((ret: number, arg: string) => {
      const argIndex = this.args.indexOf(arg);
      return argIndex > -1 ? argIndex : ret;
    }, NaN);

    if (isNaN(argIndex)) return [undefined, this.args];

    const nextArg: string | number = this.args.splice(argIndex + 1, 1)?.[0];

    return [nextArg, this.args];
  }
}

class Results {
  lines: Line[];
  areEdited: boolean;

  constructor(results: Line[]) {
    this.lines = results;
    this.areEdited = results.reduce((ret, line) => (line.isMatched ? true : ret), false);
  }

  addContext(options: Options, contextNum: number): Results {
    for (const [editLineIndex, line] of this.lines.entries()) {
      if (!line.isMatched) continue;
      for (let contextLineIndex = 0; contextLineIndex <= contextNum; contextLineIndex++) {
        let contextLine: Line | undefined;
        if (options.preContext) contextLine = this.lines[editLineIndex - contextLineIndex];
        else if (options.postContext) contextLine = this.lines[editLineIndex + contextLineIndex];
        else if (options.context)
          contextLine = this.lines[editLineIndex - Math.floor(contextNum / 2) + contextLineIndex];
        else contextLine = line;

        if (contextLine && line.filename === contextLine.filename) contextLine.isPrint = true;
      }
    }
    return this;
  }

  splitAndFilter(options: Options): [string[], string[]] {
    return this.lines.reduce(
      ([rawResult, prettyResult]: [string[], string[]], lineInfo: Line): [string[], string[]] => {
        return lineInfo.isPrint === options.invert
          ? [rawResult, prettyResult]
          : [
              [...rawResult, lineInfo.lines.rawLine],
              [...prettyResult, lineInfo.lines.prettyLine],
            ];
      },
      [[], []],
    );
  }

  limitMatches(options: Options, limitNum: number): Results {
    let counter = 0;
    if (!options.limit) return this;
    for (const line of this.lines) {
      if (line.isMatched) counter++;
      if (counter > limitNum) line.isMatched = false;
    }
    return this;
  }
}

function parseLine(pattern: string | RegExp, options: Options, filename: string, line: string, i: number): Line {
  const editedLine: string = line.replaceAll(pattern, `${RED}$&${DEFAULT}`);

  const name: string = (options.multiFile || options.yesName) && !options.notName ? `${filename}` : "";
  const lineNo: string = options.lineNum ? `${i + 1}` : "";

  const [colName, rawName] = name ? [`${MAGENTA}${name}${CYAN}:${DEFAULT}`, `${name}:`] : ["", ""];
  const [colLineNo, rawLineNo] = lineNo ? [`${GREEN}${lineNo}${CYAN}:${DEFAULT}`, `${lineNo}:`] : ["", ""];
  const lines: LineStrings = { rawLine: rawName + rawLineNo + line, prettyLine: colName + colLineNo + editedLine };

  const isEdited = line !== editedLine;
  return { isMatched: isEdited, isPrint: false, lines, filename };
}

function parseFile(parseFunc: PtLineParser, options: Options, file: ContentFile, i: number): Line[] {
  const parseLineFn: LineParser = parseFunc.bind(null, options, file.filename);
  const editedContent: Line[] = file.content.split("\n").map(parseLineFn);

  const fileSeparator: Line = {
    lines: { prettyLine: `${CYAN}--${DEFAULT}`, rawLine: "--" },
    isPrint: true,
    isMatched: false,
    filename: "",
  };
  const isContext: boolean = options.context || options.preContext || options.postContext;

  if (isContext && i !== 0) return [fileSeparator, ...editedContent];
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

function getVerboseInfo(results: Line[], files: ContentFile[], pattern: string | RegExp, options: Options): string {
  const totalLines = results.length;
  const matchCount = results.reduce((acc, result) => acc + Number(result.isMatched), 0);
  const info = [
    `\n${options.invert ? totalLines - matchCount + " INVERTED" : matchCount} matches against`,
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

  const [options, otherArgs, outFileStr, contextNum, limitNum]: [Options, string[], string, number, number] = new Args(
    args,
  ).splitOptsAndArgs();

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
    const lineParser: PtLineParser = parseLine.bind(null, pattern);
    const fileParser: FileParser = parseFile.bind(null, lineParser, options);
    const results: Results = new Results(files.flatMap(fileParser));
    const [rawResult, prettyResult]: [string[], string[]] = results
      .limitMatches(options, limitNum)
      .addContext(options, contextNum)
      .splitAndFilter(options);
    const printResult: string[] = prettyResult.slice(prettyResult.length - Settings.MaxTerminalCapacity); // limit printing to terminal
    const isTruncated: boolean = prettyResult.length !== printResult.length;
    const truncateInfo: string = isTruncated
      ? `\n${RED}grep output TRUNCATED from ${prettyResult.length} lines to ${Settings.MaxTerminalCapacity} (Max terminal capacity)`
      : "";

    if (!options.quiet) {
      const verboseInfo = getVerboseInfo(results.lines, files, pattern, options);
      if (results.areEdited) Terminal.print(printResult.join("\n") + truncateInfo);
      if (options.verbose) Terminal.print(verboseInfo);
    }
    if (options.toFile) writeToFile(outFilePath, outFileStr, options, rawResult.join("\n"), server);
  } catch (e) {
    Terminal.error("grep processing error: " + e);
  }
}
