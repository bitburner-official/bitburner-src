import { Directory } from "./Directory";
import { FilePath, resolveFilePath } from "./FilePath";

/** Type for just checking a script extension with no other verification*/
type WithScriptExtension = string & { __fileType: "Script" };
/** Type for a valid absolute FilePath with a script extension */
export type ScriptFilePath = FilePath & WithScriptExtension;

export const legacyScriptExtension = ".script";

/**
 * Valid extensions. Used for some error messaging.
 *
 * Running .script is unsupported, but we still put it in the list of valid script extensions. When we remove the
 * support of NS1, we only remove the ability to run it. Except the migration docs, the official documentation (help
 * text, TSDoc of NS APIs, etc.) does not mention NS1 and .script anymore. However, for the player's convenience when
 * migrating from NS1 to NS2, we still let them perform other actions on their unsupported scripts (e.g., open, copy,
 * move, delete).
 */
export const validScriptExtensions = [".js", ".jsx", ".ts", ".tsx", legacyScriptExtension] as const;
export type ScriptExtension = (typeof validScriptExtensions)[number];

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
  return validScriptExtensions.some((extension) => path.endsWith(extension));
}

export function isLegacyScript(path: string): boolean {
  return path.endsWith(legacyScriptExtension);
}
