import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { hasTextExtension } from "../../Paths/TextFilePath";
import { ContentFilePath, allContentFiles } from "../../Paths/ContentFile";
import { Settings } from "../../Settings/Settings";
import { help } from "../commands/help";
import { Output } from "../OutputTypes";
import { pluralize } from "../../utils/I18nUtils";
import { StdIO } from "../StdIO/StdIO";
import { callOnRead } from "../StdIO/RedirectIO";
import { stringify } from "../StdIO/utils";
import { getFileContents, validateFilenames } from "./cat";

const RED: string = "\x1b[31m";
const DEFAULT: string = "\x1b[0m";
const GREEN: string = "\x1b[32m";
const MAGENTA: string = "\x1b[35m";
const CYAN: string = "\x1b[36m";
const YELLOW: string = "\x1b[33m";
const WHITE: string = "\x1b[37m";

const ERR = {
  noArgs: "grep argument error. Usage: grep [OPTION]... PATTERN [FILE]... [-O] [OUTPUT FILE] [-m -B/A/C] [NUM]",
  noSearchArg: `grep argument error: At least one FILE argument must be passed, or pass -*/--search-all to search all files on server, or pipe input into grep e.g. "echo test | grep t"`,
  badArgs: (args: string[]) => "grep argument error: Invalid argument(s): " + args.join(", "),
  badParameter: (option: string, arg: string) =>
    `grep argument error: Incorrect ${option} argument "${arg}". Must be a number. OPTIONS with additional parameters (-O, -m, -B/A/C) must be separated from other options`,
  outFileExists: (path: string) =>
    `grep file output failed: Invalid output file "${path}". Output file must not already exist. Pass -f/--allow-overwrite to overwrite.`,
  badOutFile: (path: string) =>
    `grep file output failed: Invalid output file "${path}". Output file path must be a valid text file. (.txt, .json, .css)`,
  truncated: () =>
    `\n${YELLOW}Terminal output truncated to ${Settings.MaxTerminalCapacity} lines (Max terminal capacity)`,
  tooManyInputs: () => `grep argument error. Cannot use both redirected input and terminal search simultaneously.`,
} as const;

type ArgStrings = {
  short: readonly string[];
  long: readonly string[];
};

type Options = {
  isRegExpr: boolean;

  isLineNum: boolean;
  isNamed: boolean;
  isNotNamed: boolean;
  isInvertMatch: boolean;

  isQuiet: boolean;
  isVerbose: boolean;

  isOverWrite: boolean;

  isHelp: boolean;

  isSearchAll: boolean;
  isPipeIn: boolean;

  isMultiFile: boolean;
  hasContextFlag: boolean;
};

type Parameters = {
  preContext: string;
  context: string;
  postContext: string;

  outfile: string;
  maxMatches: string;
};

type ValidParams<T extends keyof Parameters> = {
  [key in T]: ArgStrings;
};

const VALID_PARAMS: ValidParams<keyof Parameters> = {
  preContext: { short: ["-B"], long: ["--before-context"] },
  context: { short: ["-C"], long: ["--context"] },
  postContext: { short: ["-A"], long: ["--after-context"] },

  maxMatches: { short: ["-m"], long: ["--max-count"] },
  outfile: { short: ["-O"], long: ["--output"] },
};

type ValidArgs<T extends keyof Options> = {
  [key in T]: ArgStrings;
};

const VALID_ARGS: ValidArgs<keyof Options> = {
  isRegExpr: { short: ["-R"], long: ["--regexp"] },

  isLineNum: { short: ["-n"], long: ["--line-number"] },
  isNamed: { short: ["-H"], long: ["--with-filename"] },
  isNotNamed: { short: ["-h"], long: ["--no-filename"] },
  isInvertMatch: { short: ["-v"], long: ["--invert-match"] },

  isQuiet: { short: ["-q"], long: ["--silent", "--quiet"] },
  isVerbose: { short: ["-V"], long: ["--verbose"] },

  isOverWrite: { short: ["-f"], long: ["--allow-overwrite"] },

  isSearchAll: { short: ["-*"], long: ["--search-all"] },
  isPipeIn: { short: ["-p"], long: ["--pipe-terminal"] },

  isHelp: { short: [], long: ["--help"] },

  isMultiFile: { short: [], long: [] },
  hasContextFlag: { short: [], long: [] },
} as const;

class Args {
  args: string[];
  options: Options;
  params: Parameters;

  constructor(args: (string | number | boolean)[]) {
    this.args = args.map(String);
    this.options = this.INIT_OPTIONS;
    this.params = this.INIT_PARAMS;
  }

  INIT_OPTIONS: Options = {
    isRegExpr: false,

    isLineNum: false,
    isNamed: false,
    isNotNamed: false,
    isInvertMatch: false,

    isQuiet: false,
    isVerbose: false,

    isOverWrite: false,

    isSearchAll: false,
    isPipeIn: false,

    isHelp: false,

    isMultiFile: false,
    hasContextFlag: false,
  };

  INIT_PARAMS: Parameters = {
    preContext: "",
    context: "",
    postContext: "",
    maxMatches: "",
    outfile: "",
  };

  private spliceParam(validArgs: ArgStrings): string {
    const argIndex = [...validArgs.long, ...validArgs.short].reduce((ret: number, arg: string) => {
      const argIndex = this.args.indexOf(arg);
      return argIndex > -1 ? argIndex : ret;
    }, NaN);

    if (isNaN(argIndex)) return "";

    return this.args.splice(argIndex + 1, 1)[0];
  }

  private spliceOptionalParams(): Args {
    for (const [key, validArgs] of Object.entries(VALID_PARAMS)) {
      this.params[key as keyof Parameters] = this.spliceParam(validArgs);
    }
    return this;
  }

  private reduceToOptionsAndFiles(): string[] {
    const stripDash = (arg: string) => arg.slice(1);
    const argKeys = Object.keys(VALID_ARGS).map((k) => k as keyof Options);
    const paramKeys = Object.keys(VALID_PARAMS).map((k) => k as keyof Parameters);
    const allValidArgs: string[] = [];

    let validFlagChars = "";
    for (const key of paramKeys) {
      const argString = VALID_PARAMS[key];
      allValidArgs.push(...argString.long, ...argString.short);
    }
    for (const key of argKeys) {
      const argString = VALID_ARGS[key];
      allValidArgs.push(...argString.long, ...argString.short);
      validFlagChars += argString.short.map(stripDash).join("");
    }

    const fileArgs = this.args.reduce((fileArgs: string[], fullArg: string): string[] => {
      if (!fullArg.startsWith("-")) return [...fileArgs, fullArg];
      const isLongArg = fullArg.startsWith("--");
      const isShortArg = fullArg.length === 2;
      let isBadArg = false;
      for (const key of argKeys) {
        const argStrings = VALID_ARGS[key];
        // check for exact matches
        if (isLongArg || isShortArg) {
          isBadArg = !allValidArgs.includes(fullArg);
          if (!isBadArg && [...argStrings.long, ...argStrings.short].includes(fullArg)) {
            this.options[key] = true;
          }
        } else {
          // or check multiflag
          const flagStr = stripDash(fullArg);
          const shortArgs = argStrings.short.map(stripDash);
          isBadArg = [...flagStr].some((char) => !validFlagChars.includes(char));
          if (!isBadArg && shortArgs.some((arg) => [...flagStr].includes(arg))) {
            this.options[key] = true;
          }
        }
      }
      return !isBadArg ? fileArgs : [...fileArgs, fullArg];
    }, []);

    return fileArgs;
  }

  splitOptsAndArgs(): [string[], Options, Parameters] {
    return [this.spliceOptionalParams().reduceToOptionsAndFiles(), this.options, this.params];
  }
}

type LineStrings = {
  rawLine: string;
  prettyLine: string;
};

type ParsedLine = {
  isPrint: boolean;
  isMatched: boolean;
  lines: LineStrings;
  filename: string;
  isFileSep: boolean;
};

class Results {
  results: ParsedLine[];
  areEdited: boolean;
  numMatches: number;
  options: Options;
  params: Parameters;

  constructor(results: ParsedLine[], options: Options, params: Parameters) {
    this.results = results;
    this.options = options;
    this.params = params;
    this.areEdited = results.some((line) => line.isMatched);
    this.numMatches = results.reduce((acc, result) => acc + Number(result.isMatched), 0);
  }

  addContext(context: number): Results {
    const nContext = isNaN(Number(context)) ? 0 : Number(context);
    for (const [editLineIndex, line] of this.results.entries()) {
      if (!line.isMatched) continue;
      for (let contextLineIndex = 0; contextLineIndex <= nContext; contextLineIndex++) {
        let contextLine;
        if (this.params.preContext) {
          contextLine = this.results[editLineIndex - contextLineIndex];
        } else if (this.params.postContext) {
          contextLine = this.results[editLineIndex + contextLineIndex];
        } else if (this.params.context) {
          contextLine = this.results[editLineIndex - Math.floor(nContext / 2) + contextLineIndex];
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
    for (const lineInfo of this.results) {
      if (lineInfo.isPrint === this.options.isInvertMatch) continue;
      rawResult.push(lineInfo.lines.rawLine);
      prettyResult.push(lineInfo.lines.prettyLine);
    }
    return [rawResult, prettyResult];
  }

  capMatches(limit: number): Results {
    if (!this.params.maxMatches) return this;

    let matchCounter = 0;
    for (const line of this.results) {
      if (line.isMatched) matchCounter += 1;
      if (matchCounter > limit) line.isMatched = false;
    }
    return this;
  }

  getVerboseInfo(files: DataToSearch[], pattern: string | RegExp, options: Options): string {
    if (!options.isVerbose) return "";
    const totalLines = this.results.length;
    const matchCount = Math.abs((options.isInvertMatch ? totalLines : 0) - this.numMatches);
    const inputStr = options.isPipeIn ? "piped from terminal " : `in ${pluralize(files.length, "file")}:\n`;
    const filesStr = files
      .map((file, i) => `${i % 2 ? WHITE : ""}${file.filename}(${file.content.split("\n").length}loc)${DEFAULT}`)
      .join(", ");

    return [
      `\n${
        (this.params.maxMatches ? this.params.maxMatches : matchCount) + (options.isInvertMatch ? " INVERTED" : "")
      } `,
      pluralize(matchCount, "line", undefined, true) + " matched ",
      `against PATTERN "${pattern.toString()}" `,
      `in ${pluralize(totalLines, "line")}, `,
      inputStr,
      `${filesStr}`,
    ].join("");
  }
}

function getServerFiles(server: BaseServer) {
  const files = [];
  for (const tuple of allContentFiles(server)) {
    files.push(tuple[1]);
  }
  return files.map((file) => ({ filename: file.filename, content: file.content }));
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

function writeToTerminal(
  prettyResult: string[],
  options: Options,
  results: Results,
  files: DataToSearch[],
  pattern: string | RegExp,
  stdIO: StdIO,
): void {
  const printResult = prettyResult.slice(0, Math.min(prettyResult.length, Settings.MaxTerminalCapacity)); // limit printing to terminal
  const verboseInfo = results.getVerboseInfo(files, pattern, options);
  const truncateInfo = prettyResult.length !== printResult.length ? ERR.truncated() : "";
  if (results.areEdited) stdIO.write(printResult.join("\n") + truncateInfo);
  if (options.isVerbose) stdIO.write(verboseInfo);
}

function checkOutFile(outFileStr: string, options: Options, server: BaseServer, stdIO: StdIO): ContentFilePath | null {
  if (!outFileStr) {
    return null;
  }
  const outFilePath = Terminal.getFilepath(outFileStr);
  if (!outFilePath || !hasTextExtension(outFilePath)) {
    Terminal.fatal(ERR.badOutFile(outFileStr), stdIO);
    return null;
  }
  if (!options.isOverWrite && server.textFiles.has(outFilePath)) {
    Terminal.fatal(ERR.outFileExists(outFileStr), stdIO);
    return null;
  }
  return outFilePath;
}

function grabTerminal(): string[] {
  return Terminal.outputHistory.map((line) => (line as Output).text ?? "");
}

export function grep(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  const stdin = stdIO.stdin?.deref();
  const noStdinProvided = !stdin || (stdin.isClosed && stdin.empty());
  if (!args.length && noStdinProvided) return Terminal.fatal(ERR.noArgs, stdIO);

  const [otherArgs, options, params] = new Args(args).splitOptsAndArgs();
  if (options.isHelp) return help(["grep"], server, stdIO);
  options.hasContextFlag = !!params.context || !!params.preContext || !!params.postContext;

  const nContext = Math.max(Number(params.preContext), Number(params.context), Number(params.postContext));
  const nLimit = Number(params.maxMatches);

  if (options.hasContextFlag && (!nContext || isNaN(Number(params.context))))
    return Terminal.fatal(ERR.badParameter("context", params.context), stdIO);
  if (params.maxMatches && (!nLimit || isNaN(Number(params.maxMatches))))
    return Terminal.fatal(ERR.badParameter("limit", params.maxMatches), stdIO);

  const stdinContent = stdIO.getAllCurrentStdin();

  if (!options.isPipeIn && !options.isSearchAll && !otherArgs.length && noStdinProvided)
    return Terminal.fatal(ERR.noSearchArg, stdIO);
  if (options.isPipeIn && stdinContent.length) return Terminal.fatal(ERR.tooManyInputs(), stdIO);

  options.isMultiFile = otherArgs.length > 1;
  const outFilePath = checkOutFile(params.outfile, options, server, stdIO);
  if (params.outfile && !outFilePath) return; // associated errors are printed in checkOutFile

  if (!validateFilenames(otherArgs.slice(1), server, stdIO)) return;
  const fileContent: DataToSearch[] = options.isSearchAll
    ? getServerFiles(server)
    : getDataToGrep(otherArgs.slice(1), server, stdinContent);

  try {
    applyFilters(options, params, otherArgs, fileContent, server, stdIO);
  } catch (error) {
    console.error(error);
    Terminal.fatal(`grep processing error: ${error}`, stdIO);
  }

  void callOnRead(stdIO, (data: unknown, stdInOut: StdIO) => {
    const content = { filename: "stdin", content: stringify(data) };
    applyFilters(options, params, otherArgs, [content], server, stdInOut);
  });
}

function applyFilters(
  options: Options,
  params: Parameters,
  otherArgs: string[],
  fileContent: DataToSearch[],
  server: BaseServer,
  stdIO: StdIO,
) {
  const nContext = Math.max(Number(params.preContext), Number(params.context), Number(params.postContext));
  const nLimit = Number(params.maxMatches);
  const outFilePath = checkOutFile(params.outfile, options, server, stdIO);
  const pattern = options.isRegExpr ? new RegExp(otherArgs[0], "g") : otherArgs[0];
  const contentToMatch = getContentToMatch(pattern, options, fileContent);
  const results = new Results(contentToMatch, options, params);
  const [rawResult, prettyResult] = results.capMatches(nLimit).addContext(nContext).splitAndFilter();

  if (!options.isQuiet) writeToTerminal(prettyResult, options, results, fileContent, pattern, stdIO);
  if (params.outfile && outFilePath) server.writeToContentFile(outFilePath, rawResult.join("\n"));
}

function getContentToMatch(pattern: RegExp | string, options: Options, fileContent: DataToSearch[]): ParsedLine[] {
  if (options.isPipeIn) {
    return grabTerminal().map((terminalOutput, i) => parseLine(pattern, options, "Terminal", terminalOutput, i));
  }

  return fileContent.flatMap((fileContent) =>
    fileContent.content.split("\n").map((line, i) => parseLine(pattern, options, fileContent.filename, line, i)),
  );
}

function getDataToGrep(filenames: string[], server: BaseServer, stdinContent: string): DataToSearch[] {
  const dataToGrep: DataToSearch[] = [];
  const stdinToGrep = {
    filename: "stdin",
    content: stdinContent,
  };
  for (const filename of filenames) {
    if (filename === "-") {
      dataToGrep.push(stdinToGrep);
    } else {
      dataToGrep.push({
        filename,
        content: getFileContents(filename, server),
      });
    }
  }
  // If stdin location is not explicitly specified, append it to the end
  if (!filenames.includes("-") && stdinContent.length) {
    dataToGrep.push(stdinToGrep);
  }
  return dataToGrep;
}

type DataToSearch = {
  filename: string;
  content: string;
};
