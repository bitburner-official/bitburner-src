import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { ContentFile, allContentFiles } from "../../Paths/ContentFile";
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

// Options and ValidArgs key names must correlate
interface Options {
  isRegExpr: boolean;

  isLineNum: boolean;
  isNamed: boolean;
  isNotNamed: boolean;
  isInvertMatch: boolean;
  isMaxMatches: boolean;

  isQuiet: boolean;
  isVerbose: boolean;

  isToFile: boolean;
  isOverWrite: boolean;

  isSearchAll: boolean;

  isPreContext: boolean;
  isContext: boolean;
  isPostContext: boolean;

  isHelp: boolean;

  isMultiFile: boolean; // exception: this option is not checked against passed arguments
}
interface ValidArgs {
  isRegExpr: string[];

  isLineNum: string[];
  isNamed: string[];
  isNotNamed: string[];
  isInvertMatch: string[];
  isMaxMatches: string[];

  isQuiet: string[];
  isVerbose: string[];

  isToFile: string[];
  isOverWrite: string[];

  isPreContext: string[];
  isContext: string[];
  isPostContext: string[];

  isHelp: string[];

  isSearchAll: string[];
}
const VALID_ARGS: ValidArgs = {
  isRegExpr: ["-G", "--basic-regexp"],

  isLineNum: ["-n", "--line-number"],
  isNamed: ["-H", "--with-filename"],
  isNotNamed: ["-h", "--no-filename"],
  isInvertMatch: ["-v", "--invert-match"],
  isMaxMatches: ["-m", "--max-count"],

  isQuiet: ["-q", "--quiet", "--silent"],
  isVerbose: ["-V", "--verbose"],

  isToFile: ["-O", "--output"],
  isOverWrite: ["-f", "--allow-overwrite"],

  isPreContext: ["-B", "--before-context"],
  isContext: ["-C", "--context"],
  isPostContext: ["-A", "--after-context"],

  isSearchAll: ["-*", "--search-all"],

  isHelp: ["--help"],
};
//

interface Errors {
  noArgs: string;
  noSearchArg: string;
  badSearchFile: (str: string[]) => string;
  badOutFile: (str: string) => string;
  outFileExists: (str: string) => string;
  truncated: (len: number) => string;
}

const ERR: Errors = {
  noArgs: "grep argument error. Usage: grep [OPTION]... PATTERN [FILE]... [-O] [OUTPUT FILE] [-B/A/C] [NUM]",
  noSearchArg:
    "grep argument error: At least one FILE argument must be passed, or pass -*/--search-all to search all files on server",
  badSearchFile: (files: string[]) => "Invalid filename(s): " + files.join(", "),
  outFileExists: (path: string) =>
    `grep file output failed: Invalid output file "${path}". Output file must not already exist. Pass -f/--allow-overwrite to overwrite.`,
  badOutFile: (path: string) =>
    `grep file output failed: Invalid output file "${path}". Output file must be a text file.`,
  truncated: (length: number) =>
    `\n${RED}Terminal output truncated from ${length} lines to ${Settings.MaxTerminalCapacity} (Max terminal capacity)`,
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

  initOptions: Options = {
    isRegExpr: false,

    isLineNum: false,
    isNamed: false,
    isNotNamed: false,
    isInvertMatch: false,
    isMaxMatches: false,

    isQuiet: false,
    isVerbose: false,

    isToFile: false,
    isOverWrite: false,

    isPreContext: false,
    isContext: false,
    isPostContext: false,

    isSearchAll: false,

    isHelp: false,

    isMultiFile: false,
  };

  splitOptsAndArgs(): [Options, string[], string, number, number] {
    let outFile, limit, context;

    [outFile, this.args] = this.spliceOptParam(VALID_ARGS.isToFile);
    [limit, this.args] = this.spliceOptParam(VALID_ARGS.isMaxMatches);
    [context, this.args] = this.spliceOptParam(VALID_ARGS.isPreContext);
    if (!context) [context, this.args] = this.spliceOptParam(VALID_ARGS.isContext);
    if (!context) [context, this.args] = this.spliceOptParam(VALID_ARGS.isPostContext);

    const outFileStr: string = outFile ?? "";
    const limitNum: number = limit ? Number(limit) : -1;
    const contextNum: number = context ? Number(context) : 1;

    const [options, otherArgs] = this.args.reduce(
      ([options, otherArgs]: [Options, string[]], arg: string): [Options, string[]] => {
        const isOption = Object.keys(VALID_ARGS).some((key: string): boolean => {
          if (VALID_ARGS[key as keyof ValidArgs].includes(arg)) {
            return (options[key as keyof Options] = true);
          }
          return false;
        });

        return isOption ? [options, otherArgs] : [options, [...otherArgs, arg]];
      },
      [this.initOptions, []],
    );

    return [options, otherArgs, outFileStr, contextNum, limitNum];
  }

  spliceOptParam(validArgs: string[]): [string, string[]] | [undefined, string[]] {
    const argIndex = validArgs.reduce((ret: number, arg: string) => {
      const argIndex = this.args.indexOf(arg);
      return argIndex > -1 ? argIndex : ret;
    }, NaN);

    if (isNaN(argIndex)) return [undefined, this.args];

    const nextArg = this.args.splice(argIndex + 1, 1)[0];

    return [nextArg, this.args];
  }
}

class Results {
  lines: Line[];
  areEdited: boolean;
  options: Options;

  constructor(results: Line[], options: Options) {
    this.lines = results;
    this.areEdited = results.reduce((ret, line) => (line.isMatched ? true : ret), false);
    this.options = options;
  }

  addContext(contextNum: number): Results {
    for (const [editLineIndex, line] of this.lines.entries()) {
      if (!line.isMatched) continue;
      for (let contextLineIndex = 0; contextLineIndex <= contextNum; contextLineIndex++) {
        let contextLine: Line | undefined;
        if (this.options.isPreContext) contextLine = this.lines[editLineIndex - contextLineIndex];
        else if (this.options.isPostContext) contextLine = this.lines[editLineIndex + contextLineIndex];
        else if (this.options.isContext)
          contextLine = this.lines[editLineIndex - Math.floor(contextNum / 2) + contextLineIndex];
        else contextLine = line;

        if (contextLine && line.filename === contextLine.filename) contextLine.isPrint = true;
      }
    }
    return this;
  }

  splitAndFilter(): [string[], string[]] {
    return this.lines.reduce(
      ([rawResult, prettyResult]: [string[], string[]], lineInfo: Line): [string[], string[]] => {
        return lineInfo.isPrint === this.options.isInvertMatch
          ? [rawResult, prettyResult]
          : [
              [...rawResult, lineInfo.lines.rawLine],
              [...prettyResult, lineInfo.lines.prettyLine],
            ];
      },
      [[], []],
    );
  }

  capMatches(limitNum: number): Results {
    if (!this.options.isMaxMatches) return this;
    let counter = 0;
    for (const line of this.lines) {
      if (line.isMatched) counter++;
      if (counter > limitNum) line.isMatched = false;
    }
    return this;
  }

  getVerboseInfo(files: ContentFile[], pattern: string | RegExp, options: Options): string {
    if (!options.isVerbose) return "";
    const getSuffix = (pre: string, num: number) => (num === 1 ? "" : pre + "s");
    const totalLines = this.lines.length;
    const matchCount = Math.abs(
      (options.isInvertMatch ? totalLines : 0) - this.lines.reduce((acc, result) => acc + Number(result.isMatched), 0),
    );

    return [
      `\n${matchCount + (options.isInvertMatch ? " INVERTED" : "")} line${getSuffix("", matchCount)} match${getSuffix(
        "e",
        matchCount,
      )} against`,
      `PATTERN "${pattern.toString()}" in`,
      `${totalLines} line${getSuffix("", totalLines)}`,
      `${files.length} file${getSuffix("", files.length)}`,
      `\n${files
        .map((file, i) => `${i % 2 ? WHITE : ""}${file.filename}(${file.content.split("\n").length}loc)${DEFAULT}`)
        .join(", ")}`,
    ].join(" ");
  }
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

function parseLine(pattern: string | RegExp, options: Options, filename: string, line: string, i: number): Line {
  const editedLine: string = line.replaceAll(pattern, `${RED}$&${DEFAULT}`);

  const name: string = (options.isMultiFile || options.isNamed) && !options.isNotNamed ? `${filename}` : "";
  const lineNo: string = options.isLineNum ? `${i + 1}` : "";

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
  const isContext: boolean = options.isContext || options.isPreContext || options.isPostContext;

  if (isContext && i !== 0) return [fileSeparator, ...editedContent];
  return editedContent;
}

function writeToTerminal(
  results: Results,
  prettyResult: string[],
  options: Options,
  files: ContentFile[],
  pattern: string | RegExp,
): void {
  const printResult = prettyResult.slice(prettyResult.length - Settings.MaxTerminalCapacity); // limit printing to terminal
  const isTruncated = prettyResult.length !== printResult.length;
  const verboseInfo = results.getVerboseInfo(files, pattern, options);
  const truncateInfo = isTruncated ? ERR.truncated(prettyResult.length) : "";

  if (results.areEdited) Terminal.print(printResult.join("\n") + truncateInfo);
  if (options.isVerbose) Terminal.print(verboseInfo);
}

function writeToFile(result: string[], outFileStr: string, options: Options, server: BaseServer): void {
  const outFilePath = Terminal.getFilepath(outFileStr);
  if (!outFilePath || !hasTextExtension(outFilePath)) {
    return Terminal.error(ERR.badOutFile(outFileStr));
  }

  if (options.isToFile && !options.isOverWrite) {
    for (const tuple of allContentFiles(server)) {
      if (tuple[1].filename === outFilePath) {
        return Terminal.error(ERR.outFileExists(outFileStr));
      }
    }
  }
  server.writeToContentFile(outFilePath, result.join("\n"));
}

export function grep(args: (string | number | boolean)[], server: BaseServer): void {
  if (!args.length) return Terminal.error(ERR.noArgs);

  const [options, otherArgs, outFileStr, contextNum, limitNum] = new Args(args).splitOptsAndArgs();
  const [files, notFiles] = options.isSearchAll ? getServerFiles(server) : getArgFiles(otherArgs.slice(1));

  if (options.isHelp) return help(["grep"]);
  if (notFiles.length) return Terminal.error(ERR.badSearchFile(notFiles));
  if (!options.isSearchAll && !files.length) return Terminal.error(ERR.noSearchArg);

  options.isMultiFile = files.length > 1;

  try {
    const pattern: string | RegExp = options.isRegExpr ? new RegExp(otherArgs[0], "g") : otherArgs[0];
    const lineParser: PtLineParser = parseLine.bind(null, pattern);
    const fileParser: FileParser = parseFile.bind(null, lineParser, options);
    const results: Results = new Results(files.flatMap(fileParser), options);
    const [rawResult, prettyResult]: [string[], string[]] = results
      .capMatches(limitNum)
      .addContext(contextNum)
      .splitAndFilter();

    if (!options.isQuiet) writeToTerminal(results, prettyResult, options, files, pattern);
    if (options.isToFile) writeToFile(rawResult, outFileStr, options, server);
  } catch (e) {
    Terminal.error("grep processing error: " + e);
  }
}
