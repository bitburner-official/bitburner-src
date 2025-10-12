import { Server } from "./Server";
import { BaseServer } from "./BaseServer";

import { HacknetServer } from "../Hacknet/HacknetServer";

import { createRandomIp } from "../utils/IPAddress";
import { Reviver } from "../utils/GenericReviver";
import { IPAddress, isIPAddress } from "../Types/strings";

import "../Script/RunningScript"; // For reviver side-effect
import { assertObject } from "../utils/TypeAssertion";
import { DarknetServer } from "./DarknetServer";
import { isDarknetServer } from "../DarkNet/utils/darknetServerUtils";
import { applyRamBlocks } from "../DarkNet/effects/ramblock";

/**
 * Map of all Servers that exist in the game
 *  Key (string) = IP
 *  Value = Server object
 */
let AllServers: Record<string, Server | HacknetServer | DarknetServer> = {};

function GetServerByIP(ip: string): BaseServer | undefined {
  for (const server of Object.values(AllServers)) {
    if (server.ip !== ip) continue;
    return server;
  }
}

//Get server by IP or hostname. Returns null if invalid
export function GetServer(s: string): BaseServer | null {
  if (Object.hasOwn(AllServers, s)) {
    const server = AllServers[s];
    if (server) return server;
  }
  if (!isIPAddress(s)) return null;
  const ipserver = GetServerByIP(s);
  if (ipserver !== undefined) {
    return ipserver;
  }

  return null;
}

/**
 * In our codebase, we usually have to call GetServer() like this:
 * ```
 * const server = GetServer(hostname);
 * if (!server) {
 *   throw new Error("Error message");
 * }
 * // Use server
 * ```
 * With this utility function, we don't need to write boilerplate code.
 */
export function GetServerOrThrow(serverId: string): BaseServer {
  const server = GetServer(serverId);
  if (!server) {
    throw new Error(`Server ${serverId} does not exist.`);
  }
  return server;
}

export function GetDarknetServerOrThrow(serverId: string): DarknetServer {
  const server = GetServer(serverId);
  if (!server) {
    throw new Error(`Server ${serverId} does not exist.`);
  }
  if (!(server instanceof DarknetServer)) {
    throw new Error(`Server ${serverId} is not a darknet server.`);
  }
  return server;
}

//Get server by IP or hostname. Returns null if invalid or unreachable.
export function GetReachableServer(s: string): BaseServer | null {
  const server = GetServer(s);
  if (server === null) return server;
  if (server.serversOnNetwork.length === 0) return null;
  return server;
}

export function GetAllServers(showDarkweb = false): BaseServer[] {
  const servers: BaseServer[] = [];
  for (const key of Object.keys(AllServers)) {
    if (!showDarkweb && AllServers[key] instanceof DarknetServer) {
      continue;
    }
    servers.push(AllServers[key]);
  }
  return servers;
}

export function DeleteServer(serverkey: string): void {
  for (const key of Object.keys(AllServers)) {
    const server = AllServers[key];
    if (server.ip !== serverkey && server.hostname !== serverkey) continue;
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete AllServers[key];
    break;
  }
}

export const connectServers = (server1: BaseServer, server2: BaseServer) => {
  if (!server1.serversOnNetwork.includes(server2.hostname)) {
    server1.serversOnNetwork.push(server2.hostname);
  }
  if (!server2.serversOnNetwork.includes(server1.hostname)) {
    server2.serversOnNetwork.push(server1.hostname);
  }
};

export const disconnectServers = (server1: BaseServer, server2: BaseServer) => {
  server1.serversOnNetwork = server1.serversOnNetwork.filter((conn) => conn !== server2.hostname);
  server2.serversOnNetwork = server2.serversOnNetwork.filter((conn) => conn !== server1.hostname);
};

export function ipExists(ip: string): boolean {
  for (const hostName in AllServers) {
    if (AllServers[hostName].ip === ip) {
      return true;
    }
  }
  return false;
}

export function createUniqueRandomIp(): IPAddress {
  let ip: IPAddress;
  // Repeat generating ip, until unique one is found
  do {
    ip = createRandomIp();
  } while (ipExists(ip));

  return ip;
}

// Safely add a Server to the AllServers map
export function AddToAllServers(server: Server | HacknetServer | DarknetServer): void {
  if (GetServer(server.hostname)) {
    console.warn(`The hostname of the server that's being added is: ${server.hostname}`);
    console.warn(`The server that already has this hostname is: ${AllServers[server.hostname].hostname}`);
    throw new Error(`Error: Trying to add a server with an existing hostname. Hostname: ${server.hostname}.`);
  }

  AllServers[server.hostname] = server;
}

export const renameServer = (hostname: string, newName: string): void => {
  AllServers[newName] = AllServers[hostname];
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete AllServers[hostname];
};

export function prestigeAllServers(): void {
  for (const member of Object.keys(AllServers)) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete AllServers[member];
  }
  AllServers = {};
}

export function loadAllServers(saveString: string): void {
  const allServersData: unknown = JSON.parse(saveString, Reviver);
  assertObject(allServersData);
  if (Object.keys(allServersData).length === 0) {
    throw new Error("Server list is empty.");
  }
  for (const [serverName, server] of Object.entries(allServersData)) {
    if (!(server instanceof Server) && !(server instanceof HacknetServer) && !isDarknetServer(server as BaseServer)) {
      throw new Error(`Server ${serverName} is not an instance of Server or HacknetServer.`);
    }
  }
  // We validated the data above, so it's safe to typecast here.
  AllServers = allServersData as typeof AllServers;

  // Apply blocked ram for darknet servers
  applyRamBlocks();
}

export function saveAllServers(): string {
  return JSON.stringify(AllServers);
}
