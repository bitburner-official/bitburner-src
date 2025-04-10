import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import type { Darknet as NSDnet } from "@nsdefs";
import { getServer, helpers } from "../Netscript/NetscriptHelpers";
import { checkPassword, isDarknetServer, PasswordResponse, ResponseStatus } from "../DarkWeb/models/DnetServerData";
import { SpecialServers } from "../Server/data/SpecialServers";
import {
  calculateAuthenticationTime,
  calculatePasswordAttemptChaGain,
  getRewardFromCache,
  hasCacheFileExtension,
} from "../DarkWeb/models/effects";
import { Player } from "@player";
import type { FilePath } from "../Paths/FilePath";
import { getServerOnNetwork } from "../Server/ServerHelpers";
import { errorMessage } from "../Netscript/ErrorMessages";
import { formatNumber } from "../ui/formatNumber";
import { GetAllServers, GetServer } from "../Server/AllServers";
import { BaseServer } from "../Server/BaseServer";
import { runScriptFromScript } from "../NetscriptWorker";
import { killWorkerScriptByPid } from "../Netscript/killWorkerScript";
import { capturePackets } from "../DarkWeb/models/packetSniffing";

export const failForDarknetServer = (
  ctx: NetscriptContext,
  targetServer: BaseServer,
  alternativeMethodName: string,
) => {
  if (isDarknetServer(targetServer) && targetServer.hostname !== ctx.workerScript.hostname) {
    throw new Error(
      `${ctx.function}: Writing to a darknet server requires a password and a direct connection. Use ${alternativeMethodName} from an adjacent server.`,
    );
  }
};

const logger = (ctx: NetscriptContext) => (message: string) => helpers.log(ctx, () => message);
const error =
  (ctx: NetscriptContext) =>
  (message: string): never => {
    throw errorMessage(ctx, message);
  };

const isDirectConnected = (currentServer: BaseServer, targetServer: BaseServer): boolean => currentServer.serversOnNetwork.includes(targetServer.hostname) || currentServer.hostname === targetServer.hostname;

function getConnectedServer(ctx: NetscriptContext, hostname: string): BaseServer {
  const currentServer = ctx.workerScript.getServer();
  const targetServer = GetServer(hostname);
  if (!targetServer) {
    return error(ctx)(`Could not find hostname: ${hostname}. It may have gone offline.`);
  }
  if (!targetServer.darknetData) {
    return targetServer;
  }
  if (!isDirectConnected(currentServer, targetServer)) {
    return error(ctx)(
      `Target server ${hostname} is not connected to current server ${currentServer.hostname}. Try running this script on an adjacent server.`,
    );
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

function expectAuthenticated(
  ctx: NetscriptContext,
  server: BaseServer,
  password: string,
  requireDarkwebServer = false,
) {
  const authStatus = server.hasAdminRights;
  if (!authStatus) {
    throw new Error(`Server ${server.hostname} requires authentication`);
  }
  if (ctx.workerScript.hostname === server.hostname) {
    return;
  }
  if (requireDarkwebServer && server.hostname !== SpecialServers.DarkWeb) {
    expectDarknetServer(ctx, server.hostname);
  }
  if (!server.darknetData) {
    return;
  }
  const result = checkPassword(password, server, 0);
  if (result.status !== ResponseStatus.SUCCESS) {
    throw new Error(
      `Authentication failed on ${server.hostname} whilst attempting to ${ctx.function}: Incorrect password (${password})`,
    );
  }
}

function expectPassword(ctx: NetscriptContext, hostname: string, _password: unknown) {
  if (ctx.workerScript.hostname !== hostname) {
    return helpers.string(ctx, "password", _password);
  }
  return ctx.workerScript.getServer().darknetData?.password ?? "";
}

export function NetscriptDarknet(): InternalAPI<NSDnet> {
  return {
    authenticate:
      (ctx: NetscriptContext) =>
      (_hostname, _password): Promise<PasswordResponse> => {
        const targetHostname = helpers.string(ctx, "hostname", _hostname);
        const password = expectPassword(ctx, targetHostname, _password);
        const currentServer = ctx.workerScript.getServer();
        const targetServer = GetAllServers(true).find(s => s.hostname == targetHostname)
        if (!targetServer) {
          return Promise.resolve({
            status: ResponseStatus.NOT_FOUND,
            msg: `Target server ${targetHostname} does not exist. It may have gone offline.`,
          } as PasswordResponse)
        }

        const threads = ctx.workerScript.scriptRef.threads;
        const networkDelay = calculateAuthenticationTime(targetServer, Player, threads, password);
        if (!isDarknetServer(targetServer) && targetServer.hostname !== SpecialServers.DarkWeb) {
          error(ctx)(`Authentication on ${targetServer.hostname} failed. (Target server is not a darknet server)`);
        }

        if (!isDirectConnected(currentServer, targetServer)) {
          return Promise.resolve({
            status: ResponseStatus.MOVED_PERMANENTLY,
            msg: `Target server ${targetHostname} is not connected to the current server ${currentServer.hostname}. It may have moved`,
          } as PasswordResponse)
        }
        logger(ctx)(
          `Connecting to ${targetServer.hostname} with password '${password}'... (Est: ${formatNumber(
            networkDelay / 1000,
            1,
          )}s)`,
        );

        return helpers.netscriptDelay(ctx, networkDelay).then(() => {
          const result = checkPassword(password, targetServer, threads, ctx.workerScript.pid);
          const success = result.status === ResponseStatus.SUCCESS;
          const xp = formatNumber(calculatePasswordAttemptChaGain(targetServer, threads, success), 1);
          logger(ctx)(
            `Authentication on ${targetServer.hostname} ${success ? "succeeded" : `failed. (Gained ${xp} cha xp)`}`,
          );
          return result;
        });
      },
    openCache:
      (ctx: NetscriptContext) =>
      (_fileName, _suppressToast): void => {
        const fileName = helpers.string(ctx, "fileName", _fileName);
        const suppressToast = _suppressToast ? helpers.boolean(ctx, "suppressToast", _suppressToast) : false;
        if (!hasCacheFileExtension(fileName)) {
          throw new Error(`Invalid cache file. (File must end in .cache) : ${fileName}`);
        }
        const currentServer = ctx.workerScript.getServer();
        const hasCacheFile = currentServer.caches.includes(fileName as FilePath);
        if (!hasCacheFile) {
          throw new Error(`Cache file not found: ${fileName} on server ${currentServer.hostname}`);
        }

        currentServer.caches = currentServer.caches.filter((cache) => cache !== fileName);
        getRewardFromCache(currentServer, suppressToast);
      },

    scan:
      (ctx: NetscriptContext) =>
      (_hostname, _showAll): string[] => {
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

    exec:
      (ctx: NetscriptContext) =>
      (_script, _hostname, _password, _thread_or_opt = 1, ..._args): number => {
        const path = helpers.scriptPath(ctx, "script", _script);
        const hostname = helpers.string(ctx, "hostname", _hostname);
        const password = helpers.string(ctx, "password", _password);
        const runOpts = helpers.runOptions(ctx, _thread_or_opt);
        const args = helpers.scriptArgs(ctx, _args);
        const server = helpers.getServer(ctx, hostname);
        expectAuthenticated(ctx, server, password);
        return runScriptFromScript("dnet.exec", server, path, args, ctx.workerScript, runOpts);
      },

    scp: (ctx: NetscriptContext) => (_files, _destination, _password) => {
      const destination = helpers.string(ctx, "destination", _destination);
      const destServer = helpers.getServer(ctx, destination);
      const sourceServer = helpers.getServer(ctx, ctx.workerScript.hostname);
      const password = helpers.string(ctx, "password", _password);
      const files = Array.isArray(_files) ? _files : [_files];
      expectAuthenticated(ctx, destServer, password);
      return helpers.scp(ctx, files, sourceServer, destServer);
    },

    killall:
      (ctx) =>
      (_hostname = ctx.workerScript.hostname, _password, _safetyGuard = true) => {
        const hostname = helpers.string(ctx, "hostname", _hostname);
        const password = expectPassword(ctx, hostname, _password);
        const safetyGuard = helpers.boolean(ctx, "safetyGuard", _safetyGuard);
        const server = helpers.getServer(ctx, hostname);
        expectAuthenticated(ctx, server, password);

        let scriptsKilled = 0;

        for (const byPid of server.runningScriptMap.values()) {
          for (const pid of byPid.keys()) {
            if (safetyGuard && pid == ctx.workerScript.pid) continue;
            killWorkerScriptByPid(pid, ctx.workerScript);
            ++scriptsKilled;
          }
        }
        helpers.log(ctx, () => `Killing all scripts on '${server.hostname}'.`);

        return scriptsKilled > 0;
      },
    getServer: (ctx) => (_hostname) => {
      const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
      const server = expectDarknetServer(ctx, hostname);
      const examplePasswordResponse = checkPassword("?", server, 0);
      return {
        hostname: server.hostname,
        ip: "??.?.?.?",
        hasAdminRights: server.hasAdminRights,
        isConnectedTo: server.isConnectedTo,
        ramUsed: server.ramUsed,
        maxRam: server.maxRam,
        organizationName: server.organizationName,
        purchasedByPlayer: server.purchasedByPlayer,
        backdoorInstalled: server.backdoorInstalled ?? false,
        moneyAvailable: 0,
        moneyMax: 0,
        passwordHintExample: examplePasswordResponse.msg,
        passwordDataExample: examplePasswordResponse.data ?? "",
        charismaLevel: server.requiredHackingSkill ?? 0,
        modelId: server?.darknetData?.minigameType ?? -1,
      };
    },
    getIp: (ctx) => (_hostname, _password) => {
      if (!_hostname) {
        const currentServer = ctx.workerScript.getServer();
        expectAuthenticated(ctx, currentServer, currentServer.darknetData?.password ?? "");
        return currentServer.ip;
      }
      const hostname = helpers.string(ctx, "hostname", _hostname);
      const password = expectPassword(ctx, hostname, _password);
      const server = helpers.getServer(ctx, hostname);
      expectAuthenticated(ctx, server, password);
      return server.ip;
    },
    packetCapture: (ctx) => (_hostname) => {
      const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
      const server = getConnectedServer(ctx, hostname);

      const networkDelay = calculateAuthenticationTime(server, Player, ctx.workerScript.scriptRef.threads) * 4;
      const xp = formatNumber(calculatePasswordAttemptChaGain(server, ctx.workerScript.scriptRef.threads), 1);
      logger(ctx)(`Captured some outgoing transmissions from ${hostname}. (Gained ${xp} cha xp)`);
      return helpers.netscriptDelay(ctx, networkDelay).then(() => {
        return capturePackets(server);
      });
    },
  };
}
