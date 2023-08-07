// Server and HacknetServer-related methods for the Player class (PlayerObject)
import { CONSTANTS } from "../../Constants";

import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { Server } from "../../Server/Server";
import { BaseServer } from "../../Server/BaseServer";
import { HacknetServer } from "../../Hacknet/HacknetServer";
import { GetServer, AddToAllServers, createUniqueRandomIp } from "../../Server/AllServers";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { hasHacknetServers } from "../../Hacknet/HacknetHelpers";

import type { PlayerObject } from "./PlayerObject";
import { Player } from "@player";

export function hasTorRouter(this: PlayerObject): boolean {
  return this.getHomeComputer().serversOnNetwork.includes(SpecialServers.DarkWeb);
}

export function getCurrentServer(this: PlayerObject): BaseServer {
  const server = GetServer(this.currentServer);
  if (server === null) throw new Error(`somehow connected to a server that does not exist. ${this.currentServer}`);
  return server;
}

export function getHomeComputer(this: PlayerObject): Server {
  const home = GetServer("home");
  if (home instanceof Server) return home;
  throw new Error("home computer was not a normal server");
}

export function getUpgradeHomeRamCost(this: PlayerObject): number {
  //Calculate how many times ram has been upgraded (doubled)
  const currentRam = this.getHomeComputer().maxRam;
  const numUpgrades = Math.log2(currentRam);

  //Calculate cost
  //Have cost increase by some percentage each time RAM has been upgraded
  const mult = Math.pow(1.58, numUpgrades);
  const cost = currentRam * CONSTANTS.BaseCostFor1GBOfRamHome * mult * currentNodeMults.HomeComputerRamCost * Player.mults.home_ram_cost;
  return cost;
}

export function getUpgradeHomeCoresCost(this: PlayerObject): number {
  return 1e9 * Math.pow(7.5, this.getHomeComputer().cpuCores) * Player.mults.home_core_cost;
}

export function createHacknetServer(this: PlayerObject): HacknetServer {
  const numOwned = this.hacknetNodes.length;
  const name = hasHacknetServers() ? `hacknet-server-${numOwned}` : `hacknet-node-${numOwned}`;
  const server = new HacknetServer({
    adminRights: true,
    hostname: name,
    ip: createUniqueRandomIp(),
    // player: this,
  });
  this.hacknetNodes.push(server.hostname);

  // Configure the HacknetServer to actually act as a Server
  AddToAllServers(server);
  const homeComputer = this.getHomeComputer();
  homeComputer.serversOnNetwork.push(server.hostname);
  server.serversOnNetwork.push(SpecialServers.Home);

  return server;
}
