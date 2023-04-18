// Script Filename
export type ScriptFilename = string /*& { __type: "ScriptFilename" }*/;
/*export function isScriptFilename(value: string): value is ScriptFilename {
  // implementation
}*/
/*export function sanitizeScriptFilename(filename: string): ScriptFilename {
  // implementation
}*/
export function scriptFilenameFromImport(importPath: string, ns1?: boolean): ScriptFilename {
  if (importPath.startsWith("./")) importPath = importPath.substring(2);
  if (!ns1 && !importPath.endsWith(".js")) importPath += ".js";
  if (ns1 && !importPath.endsWith(".script")) importPath += ".script";
  return importPath as ScriptFilename;
}

// Server name
export type ServerName = string /*& { __type: "ServerName" }*/;
/*export function isExistingServerName(value: unknown): value is ServerName {
  if (AllServers.has(value as ServerName)) return true; // For AllServers as an exported map
  return false;
}*/

// IP Address
export type IPAddress = string /*& { __type: "IPAddress" }*/;
export function isIPAddress(value: string): value is IPAddress {
  const regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return regex.test(value);
}
