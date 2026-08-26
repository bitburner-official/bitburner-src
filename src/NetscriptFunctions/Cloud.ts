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
          helpers.log(ctx, () => `无效参数：ram='${ram}'，不能大于 CloudServerMaxRam`);
        } else {
          helpers.log(ctx, () => `无效参数：ram='${ram}'，必须是 2 的正数次幂`);
        }
        return Infinity;
      }

      return cost;
    },
    purchaseServer: (ctx, _hostname, _ram) => {
      const hostname = helpers.string(ctx, "hostname", _hostname);
      const ram = helpers.number(ctx, "ram", _ram);
      if (hostname === "") {
        helpers.log(ctx, () => `无效参数：hostname='${hostname}' 是空字符串。`);
        return "";
      }
      if (isIPAddress(hostname)) {
        helpers.log(ctx, () => `无效参数：hostname='${hostname}' 是一个 IP 地址。`);
        return "";
      }
      if (hostname.startsWith("hacknet-node-") || hostname.startsWith("hacknet-server-")) {
        helpers.log(ctx, () => `无效参数：hostname='${hostname}' 是保留主机名。`);
        return "";
      }

      if (Player.purchasedServers.length >= getCloudServerLimit()) {
        helpers.log(
          ctx,
          () =>
            `你已达到 ${getCloudServerLimit()} 台云服务器的上限，无法再购买。`,
        );
        return "";
      }

      const cost = getCloudServerCost(ram);
      if (cost === Infinity) {
        if (ram > getCloudServerMaxRam()) {
          helpers.log(ctx, () => `无效参数：ram='${ram}'，不能大于 CloudServerMaxRam`);
        } else {
          helpers.log(ctx, () => `无效参数：ram='${ram}'，必须是 2 的正数次幂`);
        }

        return "";
      }

      if (Player.money < cost) {
        helpers.log(ctx, () => `资金不足，无法购买云服务器。需要 ${formatMoney(cost)}`);
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
      helpers.log(ctx, () => `已购买新的云服务器，主机名 '${newServ.hostname}'，花费 ${formatMoney(cost)}`);
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
        helpers.log(ctx, () => "无法删除你的家用电脑。");
        return false;
      }

      if (!server.purchasedByPlayer) {
        helpers.log(ctx, () => `无法删除 ${hostname}。你不拥有该服务器。`);
        return false;
      }

      // Can't delete server you're currently connected to
      if (server.isConnectedTo) {
        helpers.log(ctx, () => "你当前正连接到要删除的云服务器。");
        return false;
      }

      // A server cannot delete itself
      if (hostname === ctx.workerScript.hostname) {
        helpers.log(ctx, () => "无法删除本脚本正在运行的云服务器。");
        return false;
      }

      // Delete all scripts running on server
      if (server.runningScriptMap.size > 0) {
        helpers.log(ctx, () => `无法删除云服务器 '${hostname}'，因为它仍有脚本在运行。`);
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
          () => `无法将服务器 ${hostname} 识别为云服务器。这是一个 bug。请报告给开发者。`,
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
          helpers.log(ctx, () => `已删除服务器 '${hostname}'。`);
          return true;
        }
      }
      // Wasn't found on home computer
      helpers.log(ctx, () => `找不到作为云服务器的服务器 ${hostname}。这是一个 bug。请报告给开发者。`);
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
