import { Terminal } from "./Terminal";
import { trimQuotes } from "./utils/helpers/string";

export const Aliases = new Map<string, string>();
export const GlobalAliases = new Map<string, string>();

export function loadAliases(saveString: string): void {
  Aliases.clear();
  const parsedAliases: unknown = JSON.parse(saveString);
  if (!parsedAliases || typeof parsedAliases !== "object") return;
  for (const [name, alias] of Object.entries(parsedAliases)) {
    if (typeof name === "string" && typeof alias === "string") Aliases.set(name, alias);
  }
}

export function loadGlobalAliases(saveString: string): void {
  GlobalAliases.clear();
  const parsedAliases: unknown = JSON.parse(saveString);
  if (!parsedAliases || typeof parsedAliases !== "object") return;
  for (const [name, alias] of Object.entries(parsedAliases)) {
    if (typeof name === "string" && typeof alias === "string") GlobalAliases.set(name, alias);
  }
}

// Prints all aliases to terminal
export function printAliases(): void {
  for (const [name, alias] of Aliases) Terminal.print("alias " + name + "=" + alias);
  for (const [name, alias] of GlobalAliases) Terminal.print("global alias " + name + "=" + alias);
}

// Returns true if successful, false otherwise
export function parseAliasDeclaration(dec: string, global = false): boolean {
  const re = /^([\w|!%,@-]+)=(.+)$/;
  const matches = dec.match(re);
  if (matches == null || matches.length != 3) {
    return false;
  }
  matches[2] = trimQuotes(matches[2]);

  if (global) {
    addGlobalAlias(matches[1], matches[2]);
  } else {
    addAlias(matches[1], matches[2]);
  }
  return true;
}

function addAlias(name: string, value: string): void {
  GlobalAliases.delete(name);
  Aliases.set(name, value.trim());
}

function addGlobalAlias(name: string, value: string): void {
  Aliases.delete(name);
  GlobalAliases.set(name, value.trim());
}

export function removeAlias(name: string): boolean {
  const hadAlias = Aliases.has(name) || GlobalAliases.has(name);
  Aliases.delete(name);
  GlobalAliases.delete(name);
  return hadAlias;
}

/**
 * Returns the original string with any aliases substituted in.
 * Aliases are only applied to "whole words", one level deep
 * @param origCommand the original command string
 * @param maxDepth the maximum depth that alias chains are permitted (default 10)
 */
export function substituteAliases(origCommand: string, maxDepth = 10): string {
  return applyAliases(origCommand, maxDepth);
}

/**
 * Recursively evaluates aliases and applies them to the command string,
 * unless there are any reference loops or the reference chain is too deep
 * @param origCommand the original command string
 * @param depth the current recursion depth
 * @param maxDepth the maximum depth that alias chains are permitted
 * @param currentlyProcessingAliases any aliases that have been applied in the recursive evaluation leading to this point
 * @return { string } the provided command with all of its referenced aliases evaluated
 */
function applyAliases(origCommand: string, maxDepth = 10, depth = 0, currentlyProcessingAliases: string[] = []) {
  // Prevent extremely deep alias chains
  if (depth >= maxDepth || !origCommand) {
    return origCommand;
  }
  const commandArray = origCommand.split(" ");

  // Do not apply aliases when defining a new alias
  if (commandArray[0] === "unalias" || commandArray[0] === "alias") {
    return commandArray.join(" ");
  }

  // First get non-global aliases, and recursively apply them
  // (unless there are any reference loops or the reference chain is too deep)
  const localAlias = Aliases.get(commandArray[0]);
  if (localAlias && !currentlyProcessingAliases.includes(localAlias)) {
    const appliedAlias = applyAliases(localAlias, maxDepth, depth + 1, [localAlias, ...currentlyProcessingAliases]);
    commandArray.splice(0, 1, ...appliedAlias.split(" "));
  }

  // Once local aliasing is complete (or if none are present) handle any global aliases
  const processedCommands = commandArray.reduce((resolvedCommandArray: string[], command) => {
    const globalAlias = GlobalAliases.get(command);
    if (globalAlias && !currentlyProcessingAliases.includes(globalAlias)) {
      const appliedAlias = applyAliases(globalAlias, maxDepth, depth + 1, [globalAlias, ...currentlyProcessingAliases]);
      resolvedCommandArray.push(appliedAlias);
    } else {
      // If there is no alias, or if the alias has a circular reference, leave the command as-is
      resolvedCommandArray.push(command);
    }
    return resolvedCommandArray;
  }, []);

  return processedCommands.join(" ");
}
