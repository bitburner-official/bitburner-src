import { Cloud } from "@nsdefs";
import { InternalAPI } from "src/Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { Player } from "@player";
import {
  getCloudServerUpgradeCost,
  getCloudServerCost,
  getCloudServerLimit,
  getCloudServerMaxRam,
  renameCloudServer,
  upgradeCloudServer,
} from "../Server/ServerPurchases";
import { DeleteServer, AddToAllServers, createUniqueRandomIp, GetServerOrThrow } from "../Server/AllServers";
import { safelyCreateUniqueServer } from "../Server/ServerHelpers";
import { formatMoney } from "../ui/formatNumber";
import { isIPAddress } from "../Types/strings";

export function NetscriptCloud(): InternalAPI<Cloud> {
  return {
    getServerCost: (ctx, _ram) => {
      const ram = helpers.number(ctx, "ram", _ram);

      const cost = getCloudServerCost(ram);
      if (cost === Infinity) {
        if (ram > getCloudServerMaxRam()) {
          helpers.log(ctx, () => `Invalid argument: ram='${ram}' must not be greater than CloudServerMaxRam`);
        } else {
          helpers.log(ctx, () => `Invalid argument: ram='${ram}' must be a positive power of 2`);
        }
        return Infinity;
      }

      return cost;
    },
    purchaseServer: (ctx, _hostname, _ram) => {
      const hostname = helpers.string(ctx, "hostname", _hostname);
      const ram = helpers.number(ctx, "ram", _ram);
      if (hostname === "") {
        helpers.log(ctx, () => `Invalid argument: hostname='${hostname}' is an empty string.`);
        return "";
      }
      if (isIPAddress(hostname)) {
        helpers.log(ctx, () => `Invalid argument: hostname='${hostname}' is an IP address.`);
        return "";
      }
      if (hostname.startsWith("hacknet-node-") || hostname.startsWith("hacknet-server-")) {
        helpers.log(ctx, () => `Invalid argument: hostname='${hostname}' is a reserved hostname.`);
        return "";
      }

      if (Player.purchasedServers.length >= getCloudServerLimit()) {
        helpers.log(
          ctx,
          () =>
            `You have reached the maximum limit of ${getCloudServerLimit()} cloud servers. You cannot purchase any more.`,
        );
        return "";
      }

      const cost = getCloudServerCost(ram);
      if (cost === Infinity) {
        if (ram > getCloudServerMaxRam()) {
          helpers.log(ctx, () => `Invalid argument: ram='${ram}' must not be greater than CloudServerMaxRam`);
        } else {
          helpers.log(ctx, () => `Invalid argument: ram='${ram}' must be a positive power of 2`);
        }

        return "";
      }

      if (Player.money < cost) {
        helpers.log(ctx, () => `Not enough money to purchase cloud server. Need ${formatMoney(cost)}`);
        return "";
      }
      const newServ = safelyCreateUniqueServer({
        ip: createUniqueRandomIp(),
        hostname,
        organizationName: "",
        isConnectedTo: false,
        adminRights: true,
        purchasedByPlayer: true,
        maxRam: ram,
      });
      AddToAllServers(newServ);

      Player.purchasedServers.push(newServ.hostname);
      const homeComputer = Player.getHomeComputer();
      homeComputer.serversOnNetwork.push(newServ.hostname);
      newServ.serversOnNetwork.push(homeComputer.hostname);
      Player.loseMoney(cost, "servers");
      helpers.log(ctx, () => `Purchased new cloud server with hostname '${newServ.hostname}' for ${formatMoney(cost)}`);
      return newServ.hostname;
    },
    getServerUpgradeCost: (ctx, _host, _ram) => {
      const host = helpers.string(ctx, "host", _host);
      const ram = helpers.number(ctx, "ram", _ram);
      try {
        return getCloudServerUpgradeCost(host, ram);
      } catch (err) {
        helpers.log(ctx, () => String(err));
        return -1;
      }
    },
    upgradeServer: (ctx, _host, _ram) => {
      const host = helpers.string(ctx, "host", _host);
      const ram = helpers.number(ctx, "ram", _ram);
      try {
        upgradeCloudServer(host, ram);
        return true;
      } catch (err) {
        helpers.log(ctx, () => String(err));
        return false;
      }
    },
    renameServer: (ctx, _hostname, _newName) => {
      const hostname = helpers.string(ctx, "hostname", _hostname);
      const newName = helpers.string(ctx, "newName", _newName);
      try {
        renameCloudServer(hostname, newName);
        return true;
      } catch (err) {
        helpers.log(ctx, () => String(err));
        return false;
      }
    },

    deleteServer: (ctx, _name) => {
      const host = helpers.string(ctx, "name", _name);
      const server = helpers.getNormalServer(ctx, host);
      const hostname = server.hostname;

      if (server.hostname === "home") {
        helpers.log(ctx, () => "Cannot delete your home computer.");
        return false;
      }

      if (!server.purchasedByPlayer) {
        helpers.log(ctx, () => `Cannot delete ${hostname}. You do not own this server.`);
        return false;
      }

      // Can't delete server you're currently connected to
      if (server.isConnectedTo) {
        helpers.log(ctx, () => "You are currently connected to the cloud server you are trying to delete.");
        return false;
      }

      // A server cannot delete itself
      if (hostname === ctx.workerScript.hostname) {
        helpers.log(ctx, () => "Cannot delete the cloud server this script is running on.");
        return false;
      }

      // Delete all scripts running on server
      if (server.runningScriptMap.size > 0) {
        helpers.log(ctx, () => `Cannot delete cloud server '${hostname}' because it still has scripts running.`);
        return false;
      }

      // Delete from player's purchasedServers array
      let found = false;
      for (let i = 0; i < Player.purchasedServers.length; ++i) {
        if (hostname == Player.purchasedServers[i]) {
          found = true;
          Player.purchasedServers.splice(i, 1);
          break;
        }
      }

      if (!found) {
        helpers.log(
          ctx,
          () => `Could not identify server ${hostname} as a cloud server. This is a bug. Report to dev.`,
        );
        return false;
      }

      // Delete from all servers
      DeleteServer(hostname);

      // Delete from home computer
      found = false;
      const homeComputer = Player.getHomeComputer();
      for (let i = 0; i < homeComputer.serversOnNetwork.length; ++i) {
        if (hostname == homeComputer.serversOnNetwork[i]) {
          homeComputer.serversOnNetwork.splice(i, 1);
          helpers.log(ctx, () => `Deleted server '${hostname}'.`);
          return true;
        }
      }
      // Wasn't found on home computer
      helpers.log(ctx, () => `Could not find server ${hostname} as a cloud server. This is a bug. Report to dev.`);
      return false;
    },
    getServerNames: (_, _returnOpts): string[] => {
      const returnOpts = helpers.hostReturnOptions(_returnOpts);
      const res: string[] = [];
      for (const hostname of Player.purchasedServers) {
        const server = GetServerOrThrow(hostname);
        const id = helpers.returnServerID(server, returnOpts);
        res.push(id);
      }
      return res;
    },
    getServerLimit: () => {
      return getCloudServerLimit();
    },
    getRamLimit: () => {
      return getCloudServerMaxRam();
    },
  };
}
