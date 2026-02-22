import { trimQuotes } from "../utils/helpers/string";
import { substituteAliases } from "../Alias";
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
  const commands = splitCommands(commandsText).map(substituteAliases).flatMap(splitCommands).filter(Boolean);
  return commands;
}

/** get a commandArgs array from a single command string */
export function parseCommand(command: string): (string | number | boolean)[] {
  // Match every command arg in a given command string
  const argDetection = /(?:([^ ;"']*"[^"]*"|[^ ;"']*'[^']*'|[^\s]+))/g;
  const commandArgs = command.match(argDetection);
  if (!commandArgs) return [];
  return commandArgs.map(parseArg);
}
