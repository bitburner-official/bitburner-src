import { Directory } from "./Directory";
import { FilePath, resolveFilePath } from "./FilePath";

/** Filepath with the additional constraint of having a .cct extension */
type WithContractExtension = string & { __fileType: "Contract" };
export type ContractFilePath = FilePath & WithContractExtension;

/** Check extension only */
export function hasContractExtension(path: string): path is WithContractExtension {
  return path.endsWith(".cct");
}

/** Sanitize a player input, resolve any relative paths, and for imports add the correct extension if missing */
export function resolveContractFilePath(path: string, base = "" as FilePath | Directory): ContractFilePath | null {
  const result = resolveFilePath(path, base);
  return result && hasContractExtension(result) ? result : null;
}
