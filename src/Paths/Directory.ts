import type { BaseServer } from "../Server/BaseServer";
import type { FilePath } from "./FilePath";

/** The directory part of a BasicFilePath. Everything up to and including the last /
 * e.g. "file.js" => "", or "dir/file.js" => "dir/", or "../test.js" => "../" */
export type BasicDirectory = string & { __type: "Directory" };

/** Type for use in Directory and FilePath to indicate path is absolute */
export type AbsolutePath = string & { __absolutePath: true };

/** A directory path that is also absolute. Absolute Rules (FilePath and DirectoryPath):
 * 1. Specific directory names "." and ".." are disallowed */
export type Directory = BasicDirectory & AbsolutePath;
export const root = "" as Directory;

/** Invalid characters in actual filepaths and directory names:
 * /: Invalid because it is the directory separator. It's allowed in the directory part, but only as the separator.
 * *, ?, [, and ]: Invalid in actual paths because they are used for globbing.
 * !: Invalid because it conflicts with terminal history fetching
 * \: Invalid to avoid confusion with an escape character
 * ~: Invalid because it might have a use in the terminal in the future.
 * |: Invalid because it might have a use in the terminal in the future.
 * #: Invalid because it might have a use in the terminal in the future.
 * (quote marks): Invalid to avoid conflict with quote marks used in the terminal.
 * (space): Invalid to avoid confusion with terminal command separator */
const invalidCharacters = ["/", "*", "?", "[", "]", "!", "\\", "~", "|", "#", '"', "'", " "];

/** A valid character is any character that is not one of the invalid characters */
export const oneValidCharacter = `[^${invalidCharacters.map((c) => "\\" + c).join("")}]`;

/** Regex string for matching the directory part of a valid filepath */
export const directoryRegexString = `^(?<directory>(?:${oneValidCharacter}+\\/)*)`;

/** Actual RegExp for validating that an entire string is a BasicDirectory */
const basicDirectoryRegex = new RegExp(directoryRegexString + "$");

export function isDirectoryPath(path: string): path is BasicDirectory {
  return basicDirectoryRegex.test(path);
}

/** Regex to check if relative parts are included (directory names ".." and ".") */
const relativeRegex = /(?:^|\/)\.{1,2}\//;
export function isAbsolutePath(path: string): path is AbsolutePath {
  return !relativeRegex.test(path);
}

/** Sanitize and resolve a player-provided potentially-relative path to an absolute path.
 * @param path The player-provided directory path, e.g. 2nd argument for terminal cp command
 * @param base The starting directory. */
export function resolveDirectory(path: string, base = root): Directory | null {
  // Always use absolute path if player-provided path starts with /
  if (path.startsWith("/")) {
    base = root;
    path = path.substring(1);
  }
  // Add a trailing / if it is not present
  if (path && !path.endsWith("/")) path = path + "/";
  if (!isDirectoryPath(path)) return null;
  return resolveValidatedDirectory(path, base);
}

/** Resolve an already-typechecked directory path with respect to an absolute path */
export function resolveValidatedDirectory(relative: BasicDirectory, absolute: Directory): Directory | null {
  if (!relative) return absolute;
  const relativeArray = relative.split(/(?<=\/)/);
  const absoluteArray = absolute.split(/(?<=\/)/).filter(Boolean);
  while (relativeArray.length) {
    // We just checked length so we know this is a string
    const nextDir = relativeArray.shift() as string;
    switch (nextDir) {
      case "./":
        break;
      case "../":
        if (!absoluteArray.length) return null;
        absoluteArray.pop();
        break;
      default:
        absoluteArray.push(nextDir);
    }
  }
  return absoluteArray.join("") as Directory;
}

/** Check if a given directory exists on a server, e.g. for checking if the player can CD into that directory */
export function directoryExistsOnServer(directory: Directory, server: BaseServer): boolean {
  for (const scriptFilePath of server.scripts.keys()) if (scriptFilePath.startsWith(directory)) return true;
  for (const textFilePath of server.textFiles.keys()) if (textFilePath.startsWith(directory)) return true;
  return false;
}

/** Returns the first directory, other than root, in a file path. If in root, returns null. */
export function getFirstDirectoryInPath(path: FilePath | Directory): Directory | null {
  const firstSlashIndex = path.indexOf("/");
  if (firstSlashIndex === -1) return null;
  return path.substring(0, firstSlashIndex + 1) as Directory;
}

// This is to validate the assertion earlier that root is in fact a Directory
if (!isDirectoryPath(root) || !isAbsolutePath(root)) throw new Error("Root failed to validate");
