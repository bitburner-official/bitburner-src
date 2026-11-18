import { trimQuotes } from "../utils/helpers/string";
import { substituteAliases } from "../Alias";

export const PipeSymbols = {
  Pipe: "|",
  OutputRedirection: ">",
  AppendOutputRedirection: ">>",
  InputRedirection: "<",
} as const;

/**
 * Matches a quoted string (closed or not), or one of PipeSymbols outside quotes in the capture group.
 * See https://regex101.com/r/4ltHDJ/1 for a breakdown of this regex
 */
const quoteOrPipeSymbolRegex = /"[^"]*"?|'[^']*'?|(>>|\||>|<)/g;

/** Finds the pipe symbols outside quotes, with their positions in the command */
export function findUnquotedPipeSymbols(command: string): { symbol: string; index: number }[] {
  return [...command.matchAll(quoteOrPipeSymbolRegex)]
    .filter((match) => match[1] !== undefined)
    .map((match) => ({ symbol: match[1], index: match.index }));
}

/** Puts spaces around unquoted pipe symbols, so "echo 1|grep 1" is parsed like "echo 1 | grep 1" */
export function spaceOutPipeSymbols(command: string): string {
  return command.replace(quoteOrPipeSymbolRegex, (match, symbol?: string) => (symbol ? ` ${symbol} ` : match));
}

// Helper function to parse individual arguments into number/boolean/string as appropriate
function parseArg(arg: string): string | number | boolean {
  if (arg === "true") return true;
  if (arg === "false") return false;
  const argAsNumber = Number(arg);
  if (!isNaN(argAsNumber)) return argAsNumber;
  return trimQuotes(arg);
}

/** split a commands string into a commands array */
export function splitCommands(commandsText: string): string[] {
  // regex to match each entire command separately, without the semicolon included.
  const commandRegex = /(?:'[^']*'|"[^"]*"|[^;])*/g;
  const commands = commandsText.match(commandRegex);
  if (!commands) return [];
  return commands.map((command) => command.trim());
}

/** parse a commands string, including alias substitution, into a commands array */
export function parseCommands(commandsText: string): string[] {
  // Split the commands, apply aliases once, then split again and filter out empty commands.
  // Pipe symbols are spaced out before and after aliasing, so "ll|grep x" expands ll and an alias may contain "ls|cat"
  return splitCommands(commandsText)
    .map(spaceOutPipeSymbols)
    .map(substituteAliases)
    .flatMap(splitCommands)
    .map(spaceOutPipeSymbols)
    .filter(Boolean);
}

/**
 * Matches each argument in a command string, keeping quoted strings (and any pipe symbols inside them) whole.
 * See https://regex101.com/r/kO7ijG/1 for a breakdown of this regex
 */
export const commandArgRegex = /(?:([^ ;"']*"[^"]*"|[^ ;"']*'[^']*'|[^\s]+))/g;

/** get a commandArgs array from a single command string */
export function parseCommand(command: string, parseArgs = true): (string | number | boolean)[] {
  const commandArgs = command.match(commandArgRegex);
  if (!commandArgs) return [];
  return parseArgs ? commandArgs.map(parseArg) : commandArgs;
}

export function applyLastPidVariables(
  command: (string | number | boolean)[],
  pid: number,
): (string | number | boolean)[] {
  return command.map((c) => (c === "$!" ? pid : c));
}
