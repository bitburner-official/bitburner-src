import { BaseServer } from "../Server/BaseServer";
import { root } from "./Directory";
import { ContentFileMap, allContentFiles } from "./ContentFile";

/** Search for files (Script and TextFile only) that match a given glob pattern
 * @param pattern The glob pattern. Supported glob characters are * and ?
 * @param server The server to search using the pattern
 * @param currentDir The base directory. Optional, defaults to root. Also forced to root if the pattern starts with /
 * @returns A map keyed by paths (ScriptFilePath or TextFilePath) with files as values (Script or TextFile). */
export function getGlobbedFileMap(pattern: string, server: BaseServer, currentDir = root): ContentFileMap {
  const map: ContentFileMap = new Map();
  // A pattern starting with / indicates wanting to match things from root directory instead of current.
  if (pattern.startsWith("/")) {
    currentDir = root;
    pattern = pattern.substring(1);
  }
  // Only search within the current directory
  pattern = currentDir + pattern;

  // This globbing supports * and ?.
  // * will be turned into regex .*
  // ? will be turned into regex .
  // All other special regex characters in the pattern will need to be escaped out.
  const charsToEscape = new Set(["/", "\\", "^", "$", ".", "|", "+", "(", ")", "[", "{"]);
  pattern = pattern
    .split("")
    .map((char) => {
      if (char === "*") return ".*";
      if (char === "?") return ".";
      if (charsToEscape.has(char)) return "\\" + char;
      return char;
    })
    .join("");
  const regex = new RegExp(`^${pattern}$`);

  for (const [path, file] of allContentFiles(server)) {
    if (regex.test(path)) map.set(path, file);
  }
  return map;
}
