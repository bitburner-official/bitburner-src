import { Directory } from "./Directory";
import { FilePath, isFilePath, resolveFilePath } from "./FilePath";

/** Filepath with the additional constraint of having a .cct extension */
type WithProgramExtension = string & { __fileType: "Program" };
export type ProgramFilePath = FilePath & WithProgramExtension;

/** Check extension only. Programs are a bit different than others because of incomplete programs. */
export function hasProgramExtension(path: string): path is WithProgramExtension {
  if (path.endsWith(".exe")) return true;
  const extension = path.substring(path.indexOf("."));
  return /^\.exe-[0-9]{1-2}\.[0-9]{2}%-INC$/.test(extension);
}

/** Sanitize a player input, resolve any relative paths, and for imports add the correct extension if missing */
export function resolveProgramFilePath(path: string, base = "" as FilePath | Directory): ProgramFilePath | null {
  const result = resolveFilePath(path, base);
  return result && hasProgramExtension(result) ? result : null;
}

/** Full typecheck with no modification */
export function isProgramFilePath(path: string): path is ProgramFilePath {
  return hasProgramExtension(path) && isFilePath(path);
}
