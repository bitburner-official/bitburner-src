import { Directory } from "./Directory";
import { FilePath, resolveFilePath } from "./FilePath";

/** Type for just checking a script extension with no other verification*/
type WithScriptExtension = string & { __fileType: "Script" };
/** Type for a valid absolute FilePath with a script extension */
export type ScriptFilePath = FilePath & WithScriptExtension;

export const legacyScriptExtension = ".script";

/** Valid extensions. Used for some error messaging. */
export const scriptExtensions = [".js", ".jsx", ".ts", ".tsx"] as const;
export const allScriptExtensions = [...scriptExtensions, legacyScriptExtension] as const;
export type ScriptExtension = (typeof allScriptExtensions)[number];

/** Sanitize a player input, resolve any relative paths, and for imports add the correct extension if missing
 * @param path The player-provided path to a file. Can contain relative parts.
 * @param base The base
 */
export function resolveScriptFilePath(
  path: string,
  base = "" as FilePath | Directory,
  extensionToAdd?: ScriptExtension,
): ScriptFilePath | null {
  if (extensionToAdd && !path.endsWith(extensionToAdd)) path = path + extensionToAdd;
  const result = resolveFilePath(path, base);
  return result && hasScriptExtension(result) ? result : null;
}

/** Just check extension */
export function hasScriptExtension(path: string): path is WithScriptExtension {
  return allScriptExtensions.some((extension) => path.endsWith(extension));
}

export function isLegacyScript(path: string): boolean {
  return path.endsWith(legacyScriptExtension);
}
