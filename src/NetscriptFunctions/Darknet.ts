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
import { runScriptFromScript } from "../NetscriptWorker";
import { killWorkerScriptByPid } from "../Netscript/killWorkerScript";
import { ProcessInfo } from "@nsdefs";
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

function getConnectedServer(ctx: NetscriptContext, hostname: string, requireDarknet = true): BaseServer {
  const currentServer = ctx.workerScript.getServer();
  const targetServer = GetServer(hostname);
  if (!targetServer) {
    return error(ctx)(`Could not find hostname: ${hostname}. It may have gone offline.`);
  }
  if (!currentServer.serversOnNetwork.includes(targetServer.hostname) && currentServer.hostname !== hostname) {
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
  const result = checkPassword(password, server, 0);
  if (result.status !== SUCCESS_STATUS) {
    throw new Error(
      `Authentication failed on ${server.hostname} whilst attempting to ${ctx.function}: Incorrect password (${password})`,
    );
  }
}

export function NetscriptDarknet(): InternalAPI<NSDnet> {
  return {
    authenticate:
      (ctx: NetscriptContext) =>
      (_hostname, _password): Promise<PasswordResponse> => {
        const targetHostname = helpers.string(ctx, "hostname", _hostname);
        const password = helpers.string(ctx, "password", _password);
        const targetServer = getConnectedServer(ctx, targetHostname);
        const threads = ctx.workerScript.scriptRef.threads;
        const networkDelay = calculateAuthenticationTime(targetServer, Player, threads);
        logger(ctx)(
          `Connecting to ${targetServer.hostname} with password '${password}'... (Est: ${formatNumber(
            networkDelay / 1000,
            1,
          )}s)`,
        );

        return helpers.netscriptDelay(ctx, networkDelay).then(() => {
          const result = checkPassword(password, targetServer, threads, ctx.workerScript.pid);
          if (!isDarknetServer(targetServer)) {
            logger(ctx)(`Authentication on ${targetServer.hostname} failed. (Target server is not a darknet server)`);
          } else {
            logger(ctx)(
              `Authentication on ${targetServer.hostname} ${
                result.status === SUCCESS_STATUS ? "succeeded" : "failed."
              }`,
            );
          }
          return result;
        });
      },
    openCache:
      (ctx: NetscriptContext) =>
      (_fileName): void => {
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
      (_scriptname, _hostname, _password, _thread_or_opt = 1, ..._args): number => {
        const path = helpers.scriptPath(ctx, "scriptname", _scriptname);
        const hostname = helpers.string(ctx, "hostname", _hostname);
        const password = helpers.string(ctx, "hostname", _password);
        const runOpts = helpers.runOptions(ctx, _thread_or_opt);
        const args = helpers.scriptArgs(ctx, _args);
        const server = getConnectedServer(ctx, hostname);
        expectAuthenticated(ctx, server, password);
        return runScriptFromScript("dn.exec", server, path, args, ctx.workerScript, runOpts);
      },

    scp: (ctx: NetscriptContext) => (_files, _destination, _password) => {
      const destination = helpers.string(ctx, "destination", _destination);
      const destServer = getConnectedServer(ctx, destination);
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
        const password = helpers.string(ctx, "password", _password);
        const safetyGuard = helpers.boolean(ctx, "safetyGuard", _safetyGuard);
        const server = getConnectedServer(ctx, hostname);
        if (hostname !== ctx.workerScript.hostname) {
          expectAuthenticated(ctx, server, password);
        }

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

    ps:
      (ctx) =>
      (_hostname = ctx.workerScript.hostname, _password = null) => {
        const hostname = helpers.string(ctx, "hostname", _hostname);
        const password = helpers.string(ctx, "password", _password);
        const server = getConnectedServer(ctx, hostname);
        expectAuthenticated(ctx, server, password);
        const processes: ProcessInfo[] = [];
        for (const byPid of server.runningScriptMap.values()) {
          for (const script of byPid.values()) {
            processes.push({
              filename: script.filename,
              threads: script.threads,
              args: script.args.slice(),
              pid: script.pid,
              temporary: script.temporary,
            });
          }
        }
        return processes;
      },
    getServer: (ctx) => (_hostname) => {
      const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
      const server = getConnectedServer(ctx, hostname, true);
      return {
        hostname: server.hostname,
        ip: server.ip,
        hasAdminRights: server.hasAdminRights,
        isConnectedTo: server.isConnectedTo,
        ramUsed: server.ramUsed,
        maxRam: server.maxRam,
        organizationName: server.organizationName,
        purchasedByPlayer: server.purchasedByPlayer,
        backdoorInstalled: server.backdoorInstalled ?? false,
        moneyAvailable: 0,
        moneyMax: 0,
        charismaLevel: server.requiredHackingSkill ?? 0,
        modelId: server.darknetData?.minigameType ?? -1,
      };
    },
    packetCapture: (ctx) => (_hostname) => {
      const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
      const server = getConnectedServer(ctx, hostname, false);

      const networkDelay = calculateAuthenticationTime(server, Player, ctx.workerScript.scriptRef.threads) * 4;

      return helpers.netscriptDelay(ctx, networkDelay).then(() => capturePackets(server));
    }
  };
}
