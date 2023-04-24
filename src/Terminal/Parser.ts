import { substituteAliases } from "../Alias";
// Helper function to parse individual arguments into number/boolean/string as appropriate
function parseArg(arg: string): string | number | boolean {
  if (arg === "true") return true;
  if (arg === "false") return false;
  const argAsNumber = Number(arg);
  if (!isNaN(argAsNumber)) return argAsNumber;
  // For quoted strings just return the inner string
  if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
    return arg.substring(1, arg.length - 1);
  }
  return arg;
}

/** Split a commands string (what is typed into the terminal) into multiple commands */
export function splitCommands(commandString: string): string[] {
  const commandArray = commandString.match(/(?:'[^']*'|"[^"]*"|[^;"])*/g);
  if (!commandArray) return [];
  return commandArray.map((command) => command.trim());
}

/** Split commands string while also applying aliases */
export function parseCommands(commands: string): string[] {
  // Remove any unquoted whitespace longer than length 1
  commands = commands.replace(/(?:"[^"]*"|'[^']*'|\s{2,})+?/g, (match) => (match.startsWith(" ") ? " " : match));
  // Split the commands, apply aliases once, then split again and filter out empty strings.
  const commandsArr = splitCommands(commands).map(substituteAliases).flatMap(splitCommands).filter(Boolean);
  return commandsArr;
}

export function parseCommand(command: string): (string | number | boolean)[] {
  const commandArgs = command.match(/(?:("[^"]*"|'[^']*'|[^\s]+))+?/g);
  if (!commandArgs) return [];
  const argsToReturn = commandArgs.map(parseArg);
  return argsToReturn;
}
