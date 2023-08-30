// Server name
export type ServerName = string /*& { __type: "ServerName" }*/;
/*export function isExistingServerName(value: unknown): value is ServerName {
  if (AllServers.has(value as ServerName)) return true; // For AllServers as an exported map
  return false;
}*/

// IP Address
export type IPAddress = string & { __type: "IPAddress" };
export function isIPAddress(value: string): value is IPAddress {
  const regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return regex.test(value);
}
