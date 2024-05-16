import { Server } from "./Server";
import { BaseServer } from "./BaseServer";
import { serverMetadata } from "./data/servers";

import { HacknetServer } from "../Hacknet/HacknetServer";

import { IMinMaxRange } from "../types";
import { createRandomIp } from "../utils/IPAddress";
import { getRandomIntInclusive } from "../utils/helpers/getRandomIntInclusive";
import { Reviver } from "../utils/JSONReviver";
import { SpecialServers } from "./data/SpecialServers";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { IPAddress, isIPAddress } from "../Types/strings";

import "../Script/RunningScript"; // For reviver side-effect

/**
 * Map of all Servers that exist in the game
 *  Key (string) = IP
 *  Value = Server object
 */
let AllServers: Record<string, Server | HacknetServer> = {};

function GetServerByIP(ip: string): BaseServer | undefined {
  for (const key of Object.keys(AllServers)) {
    const server = AllServers[key];
    if (server.ip !== ip) continue;
    return server;
  }
}

//Returns server object with corresponding hostname
//    Relatively slow, would rather not use this a lot
function GetServerByHostname(hostname: string): BaseServer | null {
  for (const key of Object.keys(AllServers)) {
    const server = AllServers[key];
    if (server.hostname == hostname) {
      return server;
    }
  }

  return null;
}

//Get server by IP or hostname. Returns null if invalid
export function GetServer(s: string): BaseServer | null {
  if (Object.hasOwn(AllServers, s)) {
    const server = AllServers[s];
    if (server) return server;
  }

  if (!isIPAddress(s)) return GetServerByHostname(s);

  const ipserver = GetServerByIP(s);
  if (ipserver !== undefined) {
    return ipserver;
  }

  return null;
}

export function GetAllServers(): BaseServer[] {
  const servers: BaseServer[] = [];
  for (const key of Object.keys(AllServers)) {
    servers.push(AllServers[key]);
  }
  return servers;
}

export function DeleteServer(serverkey: string): void {
  for (const key of Object.keys(AllServers)) {
    const server = AllServers[key];
    if (server.ip !== serverkey && server.hostname !== serverkey) continue;
    delete AllServers[key];
    break;
  }
}

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
export function AddToAllServers(server: Server | HacknetServer): void {
  if (GetServer(server.hostname)) {
    console.warn(`Hostname of the server thats being added: ${server.hostname}`);
    console.warn(`The server that already has this IP is: ${AllServers[server.hostname].hostname}`);
    throw new Error("Error: Trying to add a server with an existing IP");
  }

  AllServers[server.hostname] = server;
}

export const renameServer = (hostname: string, newName: string): void => {
  AllServers[newName] = AllServers[hostname];
  delete AllServers[hostname];
};

interface IServerParams {
  hackDifficulty?: number;
  hostname: string;
  ip: IPAddress;
  maxRam?: number;
  moneyAvailable?: number;
  numOpenPortsRequired: number;
  organizationName: string;
  requiredHackingSkill?: number;
  serverGrowth?: number;
}

export function initForeignServers(homeComputer: Server): void {
  /* Create a randomized network for all the foreign servers */
  //Groupings for creating a randomized network
  const networkLayers: Server[][] = [];
  for (let i = 0; i < 15; i++) {
    networkLayers.push([]);
  }

  const toNumber = (value: number | IMinMaxRange): number => {
    if (typeof value === "number") return value;
    else return getRandomIntInclusive(value.min, value.max);
  };

  for (const metadata of serverMetadata) {
    const serverParams: IServerParams = {
      hostname: metadata.hostname,
      ip: createUniqueRandomIp(),
      numOpenPortsRequired: metadata.numOpenPortsRequired,
      organizationName: metadata.organizationName,
    };

    if (metadata.maxRamExponent !== undefined) {
      serverParams.maxRam = Math.pow(2, toNumber(metadata.maxRamExponent));
    }

    if (metadata.hackDifficulty) serverParams.hackDifficulty = toNumber(metadata.hackDifficulty);
    if (metadata.moneyAvailable) serverParams.moneyAvailable = toNumber(metadata.moneyAvailable);
    if (metadata.requiredHackingSkill) serverParams.requiredHackingSkill = toNumber(metadata.requiredHackingSkill);
    if (metadata.serverGrowth) serverParams.serverGrowth = toNumber(metadata.serverGrowth);

    const server = new Server(serverParams);
    for (const filename of metadata.literature || []) {
      server.messages.push(filename);
    }

    if (server.hostname === SpecialServers.WorldDaemon) {
      server.requiredHackingSkill *= currentNodeMults.WorldDaemonDifficulty;
    }
    AddToAllServers(server);
    if (metadata.networkLayer !== undefined) {
      networkLayers[toNumber(metadata.networkLayer) - 1].push(server);
    }
  }

  /* Create a randomized network for all the foreign servers */
  const linkComputers = (server1: Server, server2: Server): void => {
    server1.serversOnNetwork.push(server2.hostname);
    server2.serversOnNetwork.push(server1.hostname);
  };

  const getRandomArrayItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const linkNetworkLayers = (network1: Server[], selectServer: () => Server): void => {
    for (const server of network1) {
      linkComputers(server, selectServer());
    }
  };

  // Connect the first tier of servers to the player's home computer
  linkNetworkLayers(networkLayers[0], () => homeComputer);
  for (let i = 1; i < networkLayers.length; i++) {
    linkNetworkLayers(networkLayers[i], () => getRandomArrayItem(networkLayers[i - 1]));
  }
}

export function prestigeAllServers(): void {
  for (const member of Object.keys(AllServers)) {
    delete AllServers[member];
  }
  AllServers = {};
}

export function loadAllServers(saveString: string): void {
  AllServers = JSON.parse(saveString, Reviver);
}

export function saveAllServers(): string {
  return JSON.stringify(AllServers);
}
