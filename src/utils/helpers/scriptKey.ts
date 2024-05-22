import type { ScriptArg } from "@nsdefs";
import type { ScriptFilePath } from "../../Paths/ScriptFilePath";

// This needs to be high in the dependency graph, with few/no dependencies of
// its own, since many key modules depend on it.

export type ScriptKey = string & { __type: "ScriptKey" };

// The key used to lookup worker scripts in their map.
export function scriptKey(path: ScriptFilePath, args: ScriptArg[]): ScriptKey {
  // Asterisk is used as a delimiter because it' not a valid character in paths.
  return (path + "*" + JSON.stringify(args)) as ScriptKey;
}

// Returns a RegExp that can be used to find scripts with a path that fully
// matches "pattern" in the scriptKey.
export function matchScriptPathExact(pattern: string) {
  // Must fully match pattern, starting at the beginning and ending with the
  // asterisk delimiter, which can't appear in script paths.
  return new RegExp("^" + pattern + "\\*");
}

// Returns a RegExp that can be used to find scripts with a path that
// matches "pattern" somewhere in the scriptKey.
export function matchScriptPathUnanchored(pattern: string) {
  // Don't let the match extend into the arguments part (script paths can't
  // include "[").
  return matchScriptPathExact("[^[]*" + pattern + "[^[]*");
}
