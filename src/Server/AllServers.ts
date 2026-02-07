import { Server } from "./Server";
import { BaseServer } from "./BaseServer";

import { HacknetServer } from "../Hacknet/HacknetServer";

import { createRandomIp } from "../utils/IPAddress";
import { Reviver } from "../utils/GenericReviver";
import { IPAddress, isIPAddress } from "../Types/strings";

import "../Script/RunningScript"; // For reviver side-effect
import { assertObject } from "../utils/TypeAssertion";
import { DarknetServer } from "./DarknetServer";
import { applyRamBlocks } from "../DarkNet/effects/ramblock";
import { DarknetState } from "../DarkNet/models/DarknetState";
import { MAX_NET_DEPTH, NET_WIDTH } from "../DarkNet/Enums";

/**
 * Map of all Servers that exist in the game
 *  Key (string) = IP
 *  Value = Server object
 */
let AllServers: Map<string, BaseServer> = new Map();

function GetServerByIP(ip: string): BaseServer | undefined {
  for (const server of AllServers.values()) {
    if (server.ip !== ip) continue;
    return server;
  }
}

//Get server by IP or hostname. Returns null if invalid
export function GetServer(s: string): BaseServer | null {
  if (AllServers.has(s)) {
    return AllServers.get(s) ?? null;
  }
  if (!isIPAddress(s)) return null;
  return GetServerByIP(s) ?? null;
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

//Get server by IP or hostname. Returns null if invalid or unreachable.
export function GetReachableServer(s: string): BaseServer | null {
  const server = GetServer(s);
  if (server === null) return server;
  if (server.serversOnNetwork.length === 0) return null;
  return server;
}

// Get all servers. Only includes darknet servers if showDarkweb is true.
export function GetAllServers(showDarkweb = false): BaseServer[] {
  const servers: BaseServer[] = [];
  for (const server of AllServers.values()) {
    if (!showDarkweb && server instanceof DarknetServer) {
      continue;
    }
    servers.push(server);
  }
  return servers;
}

export function DeleteServer(serverkey: string): void {
  for (const server of AllServers.values()) {
    if (server.ip === serverkey || server.hostname === serverkey) {
      AllServers.delete(server.hostname);
      break;
    }
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
  for (const server of AllServers.values()) {
    if (server.ip === ip) {
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
  let existingServer = GetServer(server.hostname);
  if (existingServer) {
    throw new Error(
      `Trying to add a server with an existing hostname. New server: ${server.hostname} (${server.ip}). ` +
        `Existing server: ${existingServer.hostname} (IP: ${existingServer.ip}).`,
    );
  }
  existingServer = GetServer(server.ip);
  if (existingServer) {
    throw new Error(
      `Trying to add a server with an existing IP. New server: ${server.hostname} (${server.ip}). ` +
        `Existing server: ${existingServer.hostname} (IP: ${existingServer.ip}).`,
    );
  }

  AllServers.set(server.hostname, server);
}

export const renameServer = (hostname: string, newName: string): void => {
  const existingServer = AllServers.get(hostname);
  if (!existingServer) {
    throw new Error(`Cannot rename server. No server found with hostname ${hostname}`);
  }
  AllServers.set(newName, existingServer);
  AllServers.delete(hostname);
};

export function prestigeAllServers(): void {
  for (const member of Object.keys(AllServers)) {
    AllServers.delete(member);
  }
  AllServers = new Map();
  // WIP: Check other properties in DarknetState as well, then improve validateDarknetNetwork.
  DarknetState.Network = new Array(MAX_NET_DEPTH)
    .fill(null)
    .map(() => new Array<DarknetServer | null>(NET_WIDTH).fill(null));
}

export function loadAllServers(saveString: string): void {
  const allServersData: unknown = JSON.parse(saveString, Reviver);
  assertObject(allServersData);
  if (Object.keys(allServersData).length === 0) {
    throw new Error("Server list is empty.");
  }
  for (const [serverName, server] of Object.entries(allServersData)) {
    if (!(server instanceof Server) && !(server instanceof HacknetServer) && !(server instanceof DarknetServer)) {
      throw new Error(`Server ${serverName} is not an instance of Server or HacknetServer or DarknetServer.`);
    } else {
      AllServers.set(serverName, server);
    }
  }

  // Apply blocked ram for darknet servers
  applyRamBlocks();
}

export function saveAllServers(): string {
  return JSON.stringify(Object.fromEntries(AllServers.entries()));
}
