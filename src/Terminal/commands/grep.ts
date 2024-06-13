import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { ContentFile, ContentFilePath, allContentFiles } from "../../Paths/ContentFile";
import { Settings } from "../../Settings/Settings";
import { help } from "../commands/help";
import { Output } from "../OutputTypes";

type LineParser = (options: Options, filename: string, line: string, i: number) => ParsedLine;

const RED: string = "\x1b[31m";
const DEFAULT: string = "\x1b[0m";
const GREEN: string = "\x1b[32m";
const MAGENTA: string = "\x1b[35m";
const CYAN: string = "\x1b[36m";
const WHITE: string = "\x1b[37m";

// Options and ValidArgs key names must correlate
class ArgStrings {
  short: readonly string[];
  long: readonly string[];

  constructor(validArgs: ArgStrings) {
    this.long = validArgs.long;
    this.short = validArgs.long;
  }
}

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

  isPreContext: boolean;
  isContext: boolean;
  isPostContext: boolean;

  isHelp: boolean;

  isSearchAll: boolean;
  isPipeIn: boolean;

  // exceptions: these options are not explicitly checked against passed arguments
  isMultiFile: boolean;
  hasContextFlag: boolean;
}
interface ValidArgs {
  isRegExpr: ArgStrings;

  isLineNum: ArgStrings;
  isNamed: ArgStrings;
  isNotNamed: ArgStrings;
  isInvertMatch: ArgStrings;
  isMaxMatches: ArgStrings;

  isQuiet: ArgStrings;
  isVerbose: ArgStrings;

  isToFile: ArgStrings;
  isOverWrite: ArgStrings;

  isPreContext: ArgStrings;
  isContext: ArgStrings;
  isPostContext: ArgStrings;

  isHelp: ArgStrings;

  isSearchAll: ArgStrings;
  isPipeIn: ArgStrings;
}
const VALID_ARGS: ValidArgs = {
  isRegExpr: { short: ["-R"], long: ["--regexp"] },

  isLineNum: { short: ["-n"], long: ["--line-number"] },
  isNamed: { short: ["-H"], long: ["--with-filename"] },
  isNotNamed: { short: ["-h"], long: ["--no-filename"] },
  isInvertMatch: { short: ["-v"], long: ["--invert-match"] },
  isMaxMatches: { short: ["-m"], long: ["--max-count"] },

  isQuiet: { short: ["-q"], long: ["--silent", "--quiet"] },
  isVerbose: { short: ["-V"], long: ["--verbose"] },

  isToFile: { short: ["-O"], long: ["--output"] },
  isOverWrite: { short: ["-f"], long: ["--allow-overwrite"] },

  isPreContext: { short: ["-B"], long: ["--before-context"] },
  isContext: { short: ["-C"], long: ["--context"] },
  isPostContext: { short: ["-A"], long: ["--after-context"] },

  isSearchAll: { short: ["-*"], long: ["--search-all"] },
  isPipeIn: { short: ["-p"], long: ["--pipe-terminal"] },

  isHelp: { short: [], long: ["--help"] },
} as const;
//

interface Errors {
  noArgs: string;
  noSearchArg: string;
  badSearchFile: (str: string[]) => string;
  badParameter: (opt: string, arg: string) => string;
  badOutFile: (str: string) => string;
  outFileExists: (str: string) => string;
  truncated: () => string;
}

const ERR: Errors = {
  noArgs: "grep argument error. Usage: grep [OPTION]... PATTERN [FILE]... [-O] [OUTPUT FILE] [-B/A/C] [NUM]",
  noSearchArg:
    "grep argument error: At least one FILE argument must be passed, or pass -*/--search-all to search all files on server",
  badSearchFile: (files: string[]) =>
    `grep argument error: Invalid filename(s): ${files.join(
      ", ",
    )}. OPTIONS with additional parameters (-O, -m, -B/A/C) must be separated from other options`,
  badParameter: (option: string, arg: string) =>
    `grep argument error: Incorrect ${option} argument "${arg}". Must be a number.`,
  outFileExists: (path: string) =>
    `grep file output failed: Invalid output file "${path}". Output file must not already exist. Pass -f/--allow-overwrite to overwrite.`,
  badOutFile: (path: string) =>
    `grep file output failed: Invalid output file "${path}". Output file must be a text file.`,
  truncated: () => `\n${RED}Terminal output truncated to ${Settings.MaxTerminalCapacity} lines (Max terminal capacity)`,
} as const;

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
    isPipeIn: false,

    isHelp: false,

    isMultiFile: false,
    hasContextFlag: false,
  };

  mapArgToOpts(fullArg: string, options: Options): [Options, boolean] {
    let isOption = false;
    for (const key of Object.keys(VALID_ARGS)) {
      const stripDash = (arg: string) => arg.replace("-", "");
      if (!fullArg.startsWith("-")) break;
      // check long args
      const theseArgs = VALID_ARGS[key as keyof ValidArgs];
      const allArgs = [...theseArgs.long, ...theseArgs.short];
      if (allArgs.includes(fullArg)) {
        options[key as keyof Options] = true;
        isOption = true;
      }
      // check multiflag args
      const multiFlag = stripDash(fullArg);
      const shortArgs = theseArgs.short.map(stripDash);
      if (multiFlag.length > 1 && shortArgs.some((arg) => [...multiFlag].includes(arg))) {
        options[key as keyof Options] = true;
        isOption = true;
      }
    }
    return [options, isOption];
  }

  splitOptsAndArgs(): [Options, string[], string, string, string] {
    let outFile, limit, context;

    [outFile, this.args] = this.spliceOptParam(VALID_ARGS.isToFile);
    [limit, this.args] = this.spliceOptParam(VALID_ARGS.isMaxMatches);
    [context, this.args] = this.spliceOptParam(VALID_ARGS.isPreContext);
    if (!context) [context, this.args] = this.spliceOptParam(VALID_ARGS.isContext);
    if (!context) [context, this.args] = this.spliceOptParam(VALID_ARGS.isPostContext);

    const [options, otherArgs] = this.args.reduce(
      ([options, otherArgs]: [Options, string[]], fullArg: string): [Options, string[]] => {
        let isOption = false;
        [options, isOption] = this.mapArgToOpts(fullArg, options);
        return isOption ? [options, otherArgs] : [options, [...otherArgs, fullArg]];
      },
      [this.initOptions, []],
    );
    const outFileStr = outFile ?? "";
    const limitNum = limit ?? "";
    const contextNum = context ?? "";

    return [options, otherArgs, outFileStr, contextNum, limitNum];
  }

  spliceOptParam(validArgs: ArgStrings): [string, string[]] | [undefined, string[]] {
    const argIndex = [...validArgs.long, ...validArgs.short].reduce((ret: number, arg: string) => {
      const argIndex = this.args.indexOf(arg);
      return argIndex > -1 ? argIndex : ret;
    }, NaN);

    if (isNaN(argIndex)) return [undefined, this.args];

    const nextArg = this.args.splice(argIndex + 1, 1)[0];

    return [nextArg, this.args];
  }
}

interface LineStrings {
  rawLine: string;
  prettyLine: string;
}

interface ParsedLine {
  isPrint: boolean;
  isMatched: boolean;
  lines: LineStrings;
  filename: string;
  isFileSep: boolean;
}

class Results {
  lines: ParsedLine[];
  areEdited: boolean;
  numMatches: number;
  options: Options;
  matchCounter: number;
  matchLimit: number;

  constructor(results: ParsedLine[], options: Options, matchLimit: number) {
    this.lines = results;
    this.options = options;
    this.areEdited = results.some((line) => line.isMatched);
    this.numMatches = results.reduce((acc, result) => acc + Number(result.isMatched), 0);
    this.matchLimit = matchLimit;
    this.matchCounter = 0;
  }

  addContext(context: number): Results {
    const nContext = isNaN(Number(context)) ? 0 : Number(context);
    for (const [editLineIndex, line] of this.lines.entries()) {
      if (!line.isMatched) continue;
      for (let contextLineIndex = 0; contextLineIndex <= nContext; contextLineIndex++) {
        let contextLine;
        if (this.options.isPreContext) {
          contextLine = this.lines[editLineIndex - contextLineIndex];
        } else if (this.options.isPostContext) {
          contextLine = this.lines[editLineIndex + contextLineIndex];
        } else if (this.options.isContext) {
          contextLine = this.lines[editLineIndex - Math.floor(nContext / 2) + contextLineIndex];
        } else {
          contextLine = line;
        }

        if (contextLine && !line.isFileSep && line.filename === contextLine.filename) contextLine.isPrint = true;
      }
    }
    return this;
  }

  splitAndFilter(): [string[], string[]] {
    const rawResult = [];
    const prettyResult = [];
    for (const lineInfo of this.lines) {
      if (lineInfo.isPrint === this.options.isInvertMatch) continue;
      rawResult.push(lineInfo.lines.rawLine);
      prettyResult.push(lineInfo.lines.prettyLine);
    }
    return [rawResult, prettyResult];
  }

  capMatches(limit: number): Results {
    if (!this.options.isMaxMatches) return this;
    for (const line of this.lines) {
      if (line.isMatched) this.matchCounter += 1;
      if (this.matchCounter > limit) line.isMatched = false;
    }
    return this;
  }

  getVerboseInfo(files: ContentFile[], pattern: string | RegExp, options: Options): string {
    if (!options.isVerbose) return "";
    const suffix = (pre: string, num: number) => pre + (num === 1 ? "" : "s");
    const totalLines = this.lines.length;
    const matchCount = Math.abs((options.isInvertMatch ? totalLines : 0) - this.numMatches);
    const inputStr = options.isPipeIn
      ? "piped from terminal "
      : `in ${files.length} ${suffix("file", files.length)}:\n`;
    const filesStr = files
      .map((file, i) => `${i % 2 ? WHITE : ""}${file.filename}(${file.content.split("\n").length}loc)${DEFAULT}`)
      .join(", ");

    return [
      `\n${(options.isMaxMatches ? this.matchLimit : matchCount) + (options.isInvertMatch ? " INVERTED" : "")} `,
      suffix("line", matchCount) + " matched ",
      `against PATTERN "${pattern.toString()}" `,
      `in ${totalLines} ${suffix("line", totalLines)}, `,
      inputStr,
      `${filesStr}`,
    ].join("");
  }
}

function getServerFiles(server: BaseServer): [ContentFile[], string[]] {
  const files = [];
  for (const tuple of allContentFiles(server)) {
    files.push(tuple[1]);
  }
  return [files, []];
}

function getArgFiles(args: string[]): [ContentFile[], string[]] {
  const notFiles = [];
  const files = [];

  for (const arg of args) {
    const file = hasTextExtension(arg) ? Terminal.getTextFile(arg) : Terminal.getScript(arg);
    if (!file) {
      notFiles.push(arg);
    } else {
      files.push(file);
    }
  }

  return [files, notFiles];
}

function parseLine(pattern: string | RegExp, options: Options, filename: string, line: string, i: number): ParsedLine {
  const editedLine = line.replaceAll(pattern, `${RED}$&${DEFAULT}`);

  const name = options.isMultiFile || (options.isNamed && !options.isNotNamed) ? `${filename}` : "";
  const lineNo = options.isLineNum ? `${i + 1}` : "";

  const [colName, rawName] = name ? [`${MAGENTA}${name}${CYAN}:${DEFAULT}`, `${name}:`] : ["", ""];
  const [colLineNo, rawLineNo] = lineNo ? [`${GREEN}${lineNo}${CYAN}:${DEFAULT}`, `${lineNo}:`] : ["", ""];
  const lines: LineStrings = { rawLine: rawName + rawLineNo + line, prettyLine: colName + colLineNo + editedLine };

  const isMatched = line !== editedLine;
  return { lines, filename, isMatched, isPrint: false, isFileSep: false };
}

function parseFile(lineParser: LineParser, options: Options, file: ContentFile, i: number): ParsedLine[] {
  const parseLineFn = lineParser.bind(null, options, file.filename);
  const editedContent: ParsedLine[] = file.content.split("\n").map(parseLineFn);

  const hasMatch = editedContent.some((line) => line.isMatched);

  const isPrintFileSep = options.hasContextFlag && hasMatch && i !== 0;

  const fileSeparator: ParsedLine = {
    lines: { prettyLine: `${CYAN}--${DEFAULT}`, rawLine: "--" },
    isPrint: true,
    isMatched: false,
    isFileSep: true,
    filename: "",
  };
  return isPrintFileSep ? [fileSeparator, ...editedContent] : editedContent;
}

function writeToTerminal(
  prettyResult: string[],
  options: Options,
  results: Results,
  files: ContentFile[],
  pattern: string | RegExp,
): void {
  const printResult = prettyResult.slice(prettyResult.length - Settings.MaxTerminalCapacity); // limit printing to terminal
  const isTruncated = prettyResult.length !== printResult.length;
  const verboseInfo = results.getVerboseInfo(files, pattern, options);
  const truncateInfo = isTruncated ? ERR.truncated() : "";

  if (results.areEdited) Terminal.print(printResult.join("\n") + truncateInfo);
  if (options.isVerbose) Terminal.print(verboseInfo);
}

function checkOutFile(outFileStr: string, options: Options, server: BaseServer): ContentFilePath | void {
  if (!options.isToFile) return;
  const outFilePath = Terminal.getFilepath(outFileStr);
  if (!outFilePath || !hasTextExtension(outFilePath)) {
    return Terminal.error(ERR.badOutFile(outFileStr));
  }
  if (!options.isOverWrite && server.textFiles.has(outFilePath)) return Terminal.error(ERR.outFileExists(outFileStr));
  return outFilePath;
}

function grabTerminal(): string[] {
  return Terminal.outputHistory.map((line) => (line as Output).text ?? "");
}

export function grep(args: (string | number | boolean)[], server: BaseServer): void {
  if (!args.length) return Terminal.error(ERR.noArgs);

  const [options, otherArgs, outFile, context, limit] = new Args(args).splitOptsAndArgs();
  const [files, notFiles] = options.isSearchAll ? getServerFiles(server) : getArgFiles(otherArgs.slice(1));
  const outFilePath = checkOutFile(outFile, options, server);

  options.isMultiFile = files.length > 1;
  options.hasContextFlag = options.isContext || options.isPreContext || options.isPostContext;

  // error checking
  if (options.isToFile && !outFilePath) return; // associated errors are printed in checkOutFile
  if (options.isHelp) return help(["grep"]);
  if (notFiles.length) return Terminal.error(ERR.badSearchFile(notFiles));
  if (!options.isPipeIn && !options.isSearchAll && !files.length) return Terminal.error(ERR.noSearchArg);
  if (options.hasContextFlag && (context === "" || isNaN(Number(context))))
    return Terminal.error(ERR.badParameter("context", context));
  if (options.isMaxMatches && (limit === "" || isNaN(Number(limit))))
    return Terminal.error(ERR.badParameter("limit", limit));

  const nContext = Number(context);
  const nLimit = Number(limit);

  try {
    const pattern = options.isRegExpr ? new RegExp(otherArgs[0], "g") : otherArgs[0];
    const lineParser = parseLine.bind(null, pattern);
    const termParser = lineParser.bind(null, options, "Terminal");
    const fileParser = parseFile.bind(null, lineParser, options);
    const contentToMatch = options.isPipeIn ? grabTerminal().map(termParser) : files.flatMap(fileParser);
    const results = new Results(contentToMatch, options, nLimit);
    const [rawResult, prettyResult] = results.capMatches(nLimit).addContext(nContext).splitAndFilter();

    if (options.isPipeIn) files.length = 0;
    if (!options.isQuiet) writeToTerminal(prettyResult, options, results, files, pattern);
    if (options.isToFile && outFilePath) server.writeToContentFile(outFilePath, rawResult.join("\n"));
  } catch (e) {
    Terminal.error("grep processing error: " + e);
  }
}
