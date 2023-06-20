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
 */
export function substituteAliases(origCommand: string): string {
  const commandArray = origCommand.split(" ");
  if (commandArray.length > 0) {
    // For the alias and unalias commands, don't substitute
    if (commandArray[0] === "unalias" || commandArray[0] === "alias") {
      return commandArray.join(" ");
    }

    let somethingSubstituted = true;
    let depth = 0;
    let lastAlias;

    while (somethingSubstituted && depth < 10) {
      depth++;
      somethingSubstituted = false;
      const alias = Aliases.get(commandArray[0])?.split(" ");
      if (alias !== undefined) {
        somethingSubstituted = true;
        commandArray.splice(0, 1, ...alias);
        //commandArray[0] = alias;
      }
      for (let i = 0; i < commandArray.length; ++i) {
        const alias = GlobalAliases.get(commandArray[i])?.split(" ");
        if (alias !== undefined && (commandArray[i] != lastAlias || somethingSubstituted)) {
          somethingSubstituted = true;
          lastAlias = commandArray[i];
          commandArray.splice(i, 1, ...alias);
          i += alias.length - 1;
          //commandArray[i] = alias;
        }
      }
    }
  }
  return commandArray.join(" ");
}
