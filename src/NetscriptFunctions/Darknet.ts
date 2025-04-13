import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import type { Darknet as NSDnet } from "@nsdefs";
import { getServer, helpers } from "../Netscript/NetscriptHelpers";
import {
  checkPassword,
  isAuthenticated,
  isDarknetServer,
  PasswordResponse,
  ResponseStatus,
} from "../DarkWeb/models/DnetServerData";
import { SpecialServers } from "../Server/data/SpecialServers";
import {
  calculateAuthenticationTime,
  calculatePasswordAttemptChaGain,
  getBackdoorAuthTimeDebuff,
  getRewardFromCache,
  hasCacheFileExtension,
} from "../DarkWeb/models/effects";
import { Player } from "@player";
import type { FilePath } from "../Paths/FilePath";
import { errorMessage } from "../Netscript/ErrorMessages";
import { formatNumber } from "../ui/formatNumber";
import { GetAllServers, GetServer } from "../Server/AllServers";
import { BaseServer } from "../Server/BaseServer";
import { capturePackets } from "../DarkWeb/models/packetSniffing";
import { getBackdooredDarkwebServers } from "../DarkWeb/controllers/DarknetNetworkMovement";
import { addSessionToServer } from "../DarkWeb/models/DarknetState";

export const STASIS_LINK_LIMIT = 2; // TODO: make this upgradable

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

const isDirectConnected = (currentServer: BaseServer, targetServer: BaseServer): boolean =>
  currentServer.serversOnNetwork.includes(targetServer.hostname) || currentServer.hostname === targetServer.hostname;

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

export function expectAuthenticated(ctx: NetscriptContext, server: BaseServer) {
  if (!server.darknetData || ctx.workerScript.hostname === server.hostname) {
    return;
  }
  if (!server.hasAdminRights) {
    throw new Error(`Server ${server.hostname} requires root access. use ns.dnet.authenticate() to gain access.`);
  }
  if (!isAuthenticated(server, ctx.workerScript.pid)) {
    throw new Error(
      `${ctx.function}: Server ${server.hostname} requires a session to do that. Use ns.dnet.connectToSession() first to authenticate with that server.`,
    );
  }
}

export function expectExecConnection(ctx: NetscriptContext, targetServer: BaseServer) {
  if (!targetServer.darknetData) return;
  expectAuthenticated(ctx, targetServer);
  const directConnected = isDirectConnected(ctx.workerScript.getServer(), targetServer);
  const backdoored = targetServer.backdoorInstalled;
  if (!directConnected && !backdoored) {
    throw new Error(
      `${ctx.function}: exec to a darknet server requires a direct connection, a stasis link, or a backdoor. Use exec() from an adjacent server, or set a stasis link on the target server.`,
    );
  }
}

function expectPassword(ctx: NetscriptContext, hostname: string, _password: unknown) {
  if (ctx.workerScript.hostname !== hostname) {
    return helpers.string(ctx, "password", _password);
  }
  return ctx.workerScript.getServer().darknetData?.password ?? "";
}

function getTimeoutChance() {
  const backdooredDarknetServerCount = getBackdooredDarkwebServers().length - 2;
  return Math.max(Math.min(backdooredDarknetServerCount * 0.03, 0.5), 0);
}

export function NetscriptDarknet(): InternalAPI<NSDnet> {
  return {
    authenticate:
      (ctx: NetscriptContext) =>
      (_hostname, _password): Promise<PasswordResponse> => {
        const targetHostname = helpers.string(ctx, "hostname", _hostname);
        const password = expectPassword(ctx, targetHostname, _password);
        const currentServer = ctx.workerScript.getServer();
        const targetServer = GetAllServers(true).find((s) => s.hostname === targetHostname);
        if (!targetServer) {
          return Promise.resolve({
            status: ResponseStatus.NOT_FOUND,
            msg: `Target server ${targetHostname} does not exist. It may have gone offline.`,
          } as PasswordResponse);
        }

        const threads = ctx.workerScript.scriptRef.threads;
        const networkDelay = calculateAuthenticationTime(targetServer, Player, threads, password);
        if (!isDarknetServer(targetServer) && targetServer.hostname !== SpecialServers.DarkWeb) {
          return Promise.resolve({
            status: ResponseStatus.I_AM_A_TEAPOT,
            msg: `Target server ${targetHostname} is not a darknet server.`,
          } as PasswordResponse);
        }

        if (!isDirectConnected(currentServer, targetServer)) {
          return Promise.resolve({
            status: ResponseStatus.MOVED_PERMANENTLY,
            msg: `Target server ${targetHostname} is not connected to the current server ${currentServer.hostname}. It may have moved`,
          } as PasswordResponse);
        }
        logger(ctx)(
          `Connecting to ${targetServer.hostname} with password '${password}'... (Est: ${formatNumber(
            networkDelay / 1000,
            1,
          )}s)`,
        );

        return helpers.netscriptDelay(ctx, networkDelay).then(() => {
          if (Math.random() < getTimeoutChance()) {
            logger(ctx)(
              `Authentication on ${targetServer.hostname} timed out due to darknet instability. Please try again.`,
            );
            return {
              status: ResponseStatus.TIMEOUT,
              msg: `Request timed out due to darknet instability. This is likely caused by overuse of backdoors.`,
            } as PasswordResponse;
          }

          const result = checkPassword(password, targetServer, threads, ctx.workerScript.pid);
          const success = result.status === ResponseStatus.SUCCESS;
          const xp = formatNumber(calculatePasswordAttemptChaGain(targetServer, threads, success), 1);
          logger(ctx)(
            `Authentication on ${targetServer.hostname} ${success ? "succeeded" : `failed. (Gained ${xp} cha xp)`}`,
          );
          return result;
        });
      },
    connectToSession:
      (ctx: NetscriptContext) =>
      (_hostname, _password): Promise<PasswordResponse> => {
        const targetHostname = helpers.string(ctx, "hostname", _hostname);
        const token = helpers.string(ctx, "password", _password);
        const targetServer = GetAllServers(true).find((s) => s.hostname === targetHostname);
        if (!targetServer) {
          return Promise.resolve({
            status: ResponseStatus.NOT_FOUND,
            msg: `Target server ${targetHostname} does not exist. It may have gone offline.`,
          } as PasswordResponse);
        }
        if (!targetServer.hasAdminRights) {
          return Promise.resolve({
            status: ResponseStatus.AUTH_FAILURE,
            msg: `Target server ${targetHostname} requires root access before you can connect to a session. Use ns.dnet.authenticate() to gain access.`,
          } as PasswordResponse);
        }
        if (!targetServer.darknetData && targetServer.hostname !== SpecialServers.DarkWeb) {
          return Promise.resolve({
            status: ResponseStatus.I_AM_A_TEAPOT,
            msg: `Target server ${targetHostname} is not a darknet server.`,
          } as PasswordResponse);
        }
        const result = checkPassword(token, targetServer, 0, ctx.workerScript.pid);
        if (result.status === ResponseStatus.SUCCESS) {
          addSessionToServer(targetServer, ctx.workerScript.pid);
          return Promise.resolve({
            status: ResponseStatus.SUCCESS,
            msg: `Authentication on ${targetServer.hostname} succeeded.`,
          } as PasswordResponse);
        }
        return Promise.resolve({
          status: ResponseStatus.AUTH_FAILURE,
          msg: `${targetHostname} does not recognise that password. Use ns.dnet.authenticate() to create a session.`,
        } as PasswordResponse);
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
    probe: (ctx: NetscriptContext) => (_returnOpts): string[] => {
      const returnOpts = helpers.hostReturnOptions(_returnOpts);
      const server: BaseServer = ctx.workerScript.getServer();
      const out: string[] = [];
      for (const neighbor of server.serversOnNetwork) {
        const neighborServer = helpers.getServer(ctx, neighbor);
        if (!neighborServer.darknetData) {
          continue;
        }
        const entry = helpers.returnServerID(neighborServer, returnOpts);
        if (entry) {
          out.push(entry);
        }
      }
      helpers.log(ctx, () => `returned ${out.length} connections for ${server.hostname}`);
      return out;
    },
    setStasisLink:
      (ctx: NetscriptContext) =>
      (_shouldLink): Promise<boolean> => {
        const shouldLink = helpers.boolean(ctx, "shouldLink", _shouldLink);
        const server = ctx.workerScript.getServer();
        if (!server.darknetData) {
          helpers.log(ctx, () => `${server.hostname} was not stasis linked; it is not a darknet server`);
          return Promise.resolve(false);
        }

        const stasisLinkCount = GetAllServers(true).filter((s) => s.darknetData?.hasStasisLink).length;
        if (shouldLink && stasisLinkCount >= STASIS_LINK_LIMIT) {
          helpers.log(ctx, () => `Stasis link limit reached. (${stasisLinkCount}/${STASIS_LINK_LIMIT})`);
          return Promise.resolve(false);
        }
        helpers.log(
          ctx,
          () =>
            `Beginning stasis ${shouldLink ? "" : "removal "}procedure on ${server.hostname}... (Est: 30s)`,
        );
        return helpers.netscriptDelay(ctx, 30000).then(() => {
          if (server.darknetData) {
            server.darknetData.hasStasisLink = shouldLink;
          }
          server.backdoorInstalled = shouldLink;
          helpers.log(
            ctx,
            () =>
              `Stasis link applied to server ${server.hostname}. (${stasisLinkCount}/${STASIS_LINK_LIMIT} links in use)`,
          );
          return shouldLink;
        });
      },
    hasStasisLink:
      (ctx: NetscriptContext) =>
      (_hostname): boolean => {
        const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
        const server = helpers.getServer(ctx, hostname);
        return !!server.darknetData?.hasStasisLink;
      },
    getServer: (ctx) => (_hostname) => {
      const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
      const server = expectDarknetServer(ctx, hostname);
      const examplePasswordResponse = checkPassword("?", server, 0);
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
        passwordHintExample: examplePasswordResponse.msg,
        passwordDataExample: examplePasswordResponse.data ?? "",
        charismaLevel: server.requiredHackingSkill ?? 0,
        depth: server?.darknetData?.x ?? -1,
        modelId: server?.darknetData?.minigameType ?? -1,
      };
    },
    isDarknetServer: (ctx) => (_hostname) => {
      const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
      const targetServer = GetAllServers(true).find((s) => s.hostname === hostname);
      return !!targetServer?.darknetData;
    },
    getIp: (ctx) => (_hostname) => {
      if (!_hostname) {
        const currentServer = ctx.workerScript.getServer();
        expectAuthenticated(ctx, currentServer);
        return currentServer.ip;
      }
      const hostname = helpers.string(ctx, "hostname", _hostname);
      const server = helpers.getServer(ctx, hostname);
      expectAuthenticated(ctx, server);
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
    getCurrentDarknetInstability: () => () => {
      return {
        authenticateDurationIncrease: getBackdoorAuthTimeDebuff(),
        authenticateTimeoutChance: getTimeoutChance(),
      };
    },
  };
}
