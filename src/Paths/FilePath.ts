import {
  Directory,
  isAbsolutePath,
  BasicDirectory,
  resolveValidatedDirectory,
  oneValidCharacter,
  directoryRegexString,
  AbsolutePath,
} from "./Directory";
/** Filepath Rules:
 * 1. File extension cannot contain a "/"
 * 2. Last character before the extension cannot be a "/" as this would be a blank filename
 * 3. Must not contain a leading "/"
 * 4. Directory names cannot be 0-length (no "//")
 * 5. The characters *, ?, [, and ]  cannot exist in the filepath*/
type BasicFilePath = string & { __type: "FilePath" };

/** A file path that is also an absolute path. Additional absolute rules:
 * 1. Specific directory names "." and ".." are disallowed
 * Absoluteness is typechecked with isAbsolutePath in DirectoryPath.ts */
export type FilePath = BasicFilePath & AbsolutePath;

// Capturing group named file which captures the entire filename part of a file path.
const filenameRegexString = `(?<file>${oneValidCharacter}+\\.${oneValidCharacter}+)$`;

/** Regex made of the two above regex parts to test for a whole valid filepath. */
const basicFilePathRegex = new RegExp(directoryRegexString + filenameRegexString) as RegExp & {
  exec: (path: string) => null | { groups: { directory: BasicDirectory; file: FilePath } };
};

/** Simple validation function with no modification. Can be combined with isAbsolutePath to get a real FilePath */
export function isFilePath(path: string): path is BasicFilePath {
  return basicFilePathRegex.test(path);
}

export function asFilePath<T extends string>(input: T): T & FilePath {
  if (isFilePath(input) && isAbsolutePath(input)) return input;
  throw new Error(`${input} failed to validate as a FilePath.`);
}

export function getFilenameOnly<T extends BasicFilePath>(path: T): T & FilePath {
  const start = path.lastIndexOf("/") + 1;
  return path.substring(start) as T & FilePath;
}

/** Validate while also capturing and returning directory and file parts */
function getFileParts(path: string): { directory: BasicDirectory; file: FilePath } | null {
  const result = basicFilePathRegex.exec(path) as null | { groups: { directory: BasicDirectory; file: FilePath } };
  return result ? result.groups : null;
}

/** Sanitizes a player input and resolves a relative file path to an absolute one.
 * @param path The player-provided path string. Can include relative directories.
 * @param base The absolute base for resolving a relative path. */
export function resolveFilePath(path: string, base = "" as FilePath | Directory): FilePath | null {
  if (isAbsolutePath(path)) {
    if (path.startsWith("/")) path = path.substring(1);
    // Because we modified the string since checking absoluteness, we have to assert that it's still absolute here.
    return isFilePath(path) ? (path as FilePath) : null;
  }
  // Turn base into a DirectoryName in case it was not
  base = getBaseDirectory(base);
  const pathParts = getFileParts(path);
  if (!pathParts) return null;
  const directory = resolveValidatedDirectory(pathParts.directory, base);
  // Have to specifically check null here instead of truthiness, because empty string is a valid DirectoryPath
  return directory === null ? null : combinePath(directory, pathParts.file);
}

/** Remove the file part from an absolute path (FilePath or DirectoryPath - no modification is done for a DirectoryPath) */
export function getBaseDirectory(path: FilePath | Directory): Directory {
  return path.replace(/[^/]+\.[^/]+$/, "") as Directory;
}
/** Combine an absolute DirectoryPath and FilePath to create a new FilePath */
export function combinePath<T extends FilePath>(directory: Directory, file: T): T {
  // Preserves the specific file type because the filepart is preserved.
  return (directory + file) as T;
}

export function removeDirectoryFromPath(directory: Directory, path: FilePath): FilePath | null {
  if (!path.startsWith(directory)) return null;
  return path.substring(directory.length) as FilePath;
}
