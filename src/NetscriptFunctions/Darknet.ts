import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import type { Darknet as NSDnet } from "@nsdefs";
import { getServer, helpers } from "../Netscript/NetscriptHelpers";
import { checkPassword, isDarknetServer, PasswordResponse, SUCCESS_STATUS } from "../DarkWeb/models/DnetServerData";
import { SpecialServers } from "../Server/data/SpecialServers";
import { calculateAuthenticationTime, getRewardFromCache, hasCacheFileExtension } from "../DarkWeb/models/effects";
import { Player } from "@player";
import type { FilePath } from "../Paths/FilePath";
import { getServerOnNetwork } from "../Server/ServerHelpers";
import { errorMessage } from "../Netscript/ErrorMessages";
import { formatNumber } from "../ui/formatNumber";
import { GetServer } from "../Server/AllServers";
import { BaseServer } from "../Server/BaseServer";

const logger = (ctx: NetscriptContext) => (message: string) => helpers.log(ctx, () => message);
const error =
  (ctx: NetscriptContext) =>
    (message: string): never => {
      throw errorMessage(ctx, message);
    };

function getConnectedServer(ctx: NetscriptContext, hostname: string, requireDarknet = true): BaseServer {
  const currentServer = ctx.workerScript.getServer();
  const targetServer = GetServer(hostname);
  if (!targetServer) {
    return error(ctx)(`Could not find hostname: ${hostname}. It may have gone offline.`);
  }
  if (!currentServer.serversOnNetwork.includes(targetServer.hostname)) {
    return error(ctx)(`Target server ${hostname} is not connected to current server ${currentServer.hostname}`);
  }
  if (requireDarknet) {
    expectDarknetServer(ctx, hostname);
  }
  return targetServer;
}

function expectDarknetServer(ctx: NetscriptContext, hostname: string) {
  const targetServer = getServer(ctx, hostname);
  if (!targetServer.darknetData && targetServer.hostname != SpecialServers.DarkWeb) {
    throw new Error(`Target server ${hostname} is not a darknet server`);
  }
  return targetServer;

}


export function NetscriptDarknet(): InternalAPI<NSDnet> {
  return {
    authenticate:
      (ctx: NetscriptContext) =>
        (_hostname: unknown, _password: unknown): Promise<PasswordResponse> => {
          const targetHostname = helpers.string(ctx, "hostname", _hostname);
          const password = helpers.string(ctx, "password", _password);
          const targetServer = getConnectedServer(ctx, targetHostname);
          const threads = ctx.workerScript.scriptRef.threads;
          const networkDelay = calculateAuthenticationTime(targetServer, Player, threads);
          logger(ctx)(`Attempting to authenticate on ${targetServer.hostname} with password '${password}'...`);
          logger(ctx)(`(Estimated time: ${formatNumber(networkDelay/1000, 1)}s)`);

          return helpers.netscriptDelay(ctx, networkDelay)
            .then(() => {
              const result = checkPassword(password, targetServer, threads);
              if (!isDarknetServer(targetServer)) {
                logger(ctx)(`Authentication on ${targetServer.hostname} failed. (Target server is not a darknet server)`);
              } else {
                logger(ctx)(`Authentication on ${targetServer.hostname} ${result.status === SUCCESS_STATUS ? "succeeded" : "failed."}`);
              }
              return result;
            });

        },
    openCache:
      (ctx: NetscriptContext) =>
        (_fileName: unknown): void => {
          const fileName = helpers.string(ctx, "fileName", _fileName);
          if (!hasCacheFileExtension(fileName)) {
            throw new Error(`Invalid cache file. (File must end in .cache) : ${fileName}`);
          }
          const currentServer = ctx.workerScript.getServer();
          const hasCacheFile = currentServer.caches.includes(fileName as FilePath);
          if (!hasCacheFile) {
            throw new Error(`Cache file not found: ${fileName} on server ${currentServer.hostname}`);
          }

          currentServer.caches = currentServer.caches.filter((cache) => cache !== fileName);

          getRewardFromCache(currentServer);
        },

    scan: (ctx) => (_hostname, _showAll): string[] => {
      const hostname = _hostname ? helpers.string(ctx, "hostname", _hostname) : ctx.workerScript.hostname;
      const showAll = _showAll ? helpers.boolean(ctx, "showAll", _showAll) : false;
      const server = helpers.getServer(ctx, hostname);
      const out: string[] = [];
      for (let i = 0; i < server.serversOnNetwork.length; i++) {
        const s = getServerOnNetwork(server, i);
        if (!s || !s.hostname) continue;
        if (!showAll && !isDarknetServer(s) && s.hostname !== SpecialServers.DarkWeb) continue;
        out.push(s.hostname);
      }
      helpers.log(ctx, () => `returned ${out.length} connections for ${server.hostname}`);
      return out;
    },
  };
}
