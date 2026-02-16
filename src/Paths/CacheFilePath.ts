import { Directory } from "./Directory";
import { FilePath, resolveFilePath } from "./FilePath";

/** Filepath with the additional constraint of having a .cache extension */
type WithCacheExtension = string & { __fileType: "Cache" };
export type CacheFilePath = FilePath & WithCacheExtension;

/** Check extension only */
export function hasCacheExtension(path: string): path is WithCacheExtension {
  return path.endsWith(".cache");
}

/** Sanitize a player input, resolve any relative paths, and for imports add the correct extension if missing */
export function resolveCacheFilePath(path: string, base = "" as FilePath | Directory): CacheFilePath | null {
  const result = resolveFilePath(path, base);
  return result && hasCacheExtension(result) ? result : null;
}
