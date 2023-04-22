import { Directory } from "./Directory";
import { FilePath, resolveFilePath } from "./FilePath";

/** Filepath with the additional constraint of having a .js extension */
type WithTextExtension = string & { __fileType: "Text" };
export type TextFilePath = FilePath & WithTextExtension;

/** Check extension only */
export function hasTextExtension(path: string): path is WithTextExtension {
  return path.endsWith(".txt");
}

/** Sanitize a player input, resolve any relative paths, and for imports add the correct extension if missing */
export function resolveTextFilePath(path: string, base = "" as FilePath | Directory): TextFilePath | null {
  const result = resolveFilePath(path, base);
  return result && hasTextExtension(result) ? result : null;
}
