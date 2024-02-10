/**
 * Implements functions for purchasing servers or purchasing more RAM for
 * the home computer
 */
import { AddToAllServers, createUniqueRandomIp, GetServer, renameServer } from "./AllServers";
import { safelyCreateUniqueServer } from "./ServerHelpers";

import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { ServerConstants } from "./data/Constants";
import { Player } from "@player";

import { dialogBoxCreate } from "../ui/React/DialogBox";
import { isPowerOfTwo } from "../utils/helpers/isPowerOfTwo";
import { workerScripts } from "../Netscript/WorkerScripts";

// Returns the cost of purchasing a server with the given RAM
// Returns Infinity for invalid 'ram' arguments
/**
 * @param ram Amount of RAM on purchased server (GB)
 * @param cores Amount of cores on purchased Server
 * @returns Cost of purchasing the given server. Returns infinity for invalid arguments
 */
export function getPurchaseServerCost(ram: number, cores: number): number {
  if (!isPowerOfTwo(ram)) {
    throw new Error(`Invalid argument: ram='${ram}' must be a positive power of 2`);
  }
  if (ram > getPurchaseServerMaxRam()) {
    throw new Error(`Invalid argument: ram='${ram}' must not be greater than getPurchaseServerMaxRam`);
  }
  if (cores > getPurchasedServerMaxCores()) {
    throw new Error(`Invalid argument: cores='${cores}' must not be greater than getPurchasedServerMaxCores`);
  }

  const upg = Math.max(0, Math.log(ram) / Math.log(2) - 6);
  const coreCost =
    ServerConstants.PurchasedServerCoreBaseCost *
    (cores === 1 ? 0 : ServerConstants.PurchasedServerCoreCostGrowth ** cores);
  return (
    coreCost +
    ram *
      ServerConstants.BaseCostFor1GBOfRamServer *
      currentNodeMults.PurchasedServerCost *
      Math.pow(currentNodeMults.PurchasedServerSoftcap, upg)
  );
}

export const getPurchasedServerUpgradeCost = (hostname: string, ram: number, _cores: number): number => {
  const server = GetServer(hostname);
  if (!server) throw new Error(`Server '${hostname}' not found.`);
  if (!Player.purchasedServers.includes(hostname)) throw new Error(`Server '${hostname}' not a purchased server.`);
  if (isNaN(ram) || !isPowerOfTwo(ram) || !(Math.sign(ram) === 1))
    throw new Error(`${ram} is not a positive power of 2`);
  const cores = Math.max(_cores, server.cpuCores);
  if (server.maxRam >= ram && cores === server.cpuCores)
    throw new Error(`'${hostname}' current ram (${server.maxRam}) is bigger or equal than new ram (${ram})`);
  return getPurchaseServerCost(ram, cores) - getPurchaseServerCost(server.maxRam, server.cpuCores);
};

export const upgradePurchasedServer = (hostname: string, ram: number, cores: number): void => {
  const server = GetServer(hostname);
  if (!server) throw new Error(`Server '${hostname}' not found.`);
  const cost = getPurchasedServerUpgradeCost(hostname, ram, cores);
  if (!Player.canAfford(cost)) throw new Error(`You don't have enough money to upgrade '${hostname}'.`);
  Player.loseMoney(cost, "servers");
  server.maxRam = ram;
  server.cpuCores = cores;
};

export const renamePurchasedServer = (hostname: string, newName: string): void => {
  const server = GetServer(hostname);
  if (!server) throw new Error(`Server '${hostname}' doesn't exists.`);
  if (GetServer(newName)) throw new Error(`Server '${newName}' already exists.`);
  if (!Player.purchasedServers.includes(hostname)) throw new Error(`Server '${hostname}' is not a player server.`);
  const replace = (arr: string[], old: string, next: string): string[] => {
    return arr.map((v) => (v === old ? next : v));
  };
  Player.purchasedServers = replace(Player.purchasedServers, hostname, newName);
  if (Player.currentServer === hostname) Player.currentServer = newName;
  const home = Player.getHomeComputer();
  home.serversOnNetwork = replace(home.serversOnNetwork, hostname, newName);
  server.serversOnNetwork = replace(server.serversOnNetwork, hostname, newName);
  for (const byPid of server.runningScriptMap.values()) {
    for (const r of byPid.values()) {
      r.server = newName;
      const ws = workerScripts.get(r.pid);
      if (!ws) continue;
      ws.hostname = newName;
    }
  }
  server.scripts.forEach((r) => (r.server = newName));
  server.hostname = newName;
  renameServer(hostname, newName);
};

export function getPurchaseServerLimit(): number {
  return Math.round(ServerConstants.PurchasedServerLimit * currentNodeMults.PurchasedServerLimit);
}

export function getPurchaseServerMaxRam(): number {
  const ram = Math.round(ServerConstants.PurchasedServerMaxRam * currentNodeMults.PurchasedServerMaxRam);

  // Round this to the nearest power of 2
  return 1 << (31 - Math.clz32(ram));
}
export function getPurchasedServerMaxCores(): number {
  return ServerConstants.PurchasedServerMaxCores;
}
// Manually purchase a server (NOT through Netscript)
export function purchaseServer(hostname: string, ram: number, cost: number): void {
  //Check if player has enough money
  if (!Player.canAfford(cost)) {
    dialogBoxCreate("You don't have enough money to purchase this server!");
    return;
  }

  //Maximum server limit
  if (Player.purchasedServers.length >= getPurchaseServerLimit()) {
    dialogBoxCreate(
      "You have reached the maximum limit of " +
        getPurchaseServerLimit() +
        " servers. " +
        "You cannot purchase any more. You can " +
        "delete some of your purchased servers using the deleteServer() Netscript function in a script",
    );
    return;
  }

  if (hostname == "") {
    dialogBoxCreate("You must enter a hostname for your new server!");
    return;
  }

  // Create server
  const newServ = safelyCreateUniqueServer({
    adminRights: true,
    hostname: hostname,
    ip: createUniqueRandomIp(),
    isConnectedTo: false,
    maxRam: ram,
    organizationName: "",
    purchasedByPlayer: true,
  });
  AddToAllServers(newServ);

  // Add to Player's purchasedServers array
  Player.purchasedServers.push(newServ.hostname);

  // Connect new server to home computer
  const homeComputer = Player.getHomeComputer();
  homeComputer.serversOnNetwork.push(newServ.hostname);
  newServ.serversOnNetwork.push(homeComputer.hostname);

  Player.loseMoney(cost, "servers");

  dialogBoxCreate("Server successfully purchased with hostname " + newServ.hostname);
}

// Manually upgrade RAM on home computer (NOT through Netscript)
export function purchaseRamForHomeComputer(): void {
  const cost = Player.getUpgradeHomeRamCost();
  if (!Player.canAfford(cost)) {
    dialogBoxCreate("You do not have enough money to purchase additional RAM for your home computer");
    return;
  }

  const homeComputer = Player.getHomeComputer();
  if (homeComputer.maxRam >= ServerConstants.HomeComputerMaxRam) {
    dialogBoxCreate(`You cannot upgrade your home computer RAM because it is at its maximum possible value`);
    return;
  }

  homeComputer.maxRam *= 2;
  Player.loseMoney(cost, "servers");
}
