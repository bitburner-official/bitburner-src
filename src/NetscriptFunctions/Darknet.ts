import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import type { Darknet as NSDnet, ServerAuthDetails } from "@nsdefs";
import { getServer, helpers } from "../Netscript/NetscriptHelpers";
import { isDarknetServer, ResponseStatus } from "../DarkNet/models/DnetServerData";
import { SpecialServers } from "../Server/data/SpecialServers";
import {
  addCacheToServer,
  calculateAuthenticationTime,
  calculatePasswordAttemptChaGain,
  getRamBlockRemoved,
  getRewardFromCache,
  getStasisLinkLimit,
  handleRamBlockClearedRewards,
  hasCacheFileExtension, hasDarknetAccess,
} from "../DarkNet/models/effects";
import { Player } from "@player";
import type { FilePath } from "../Paths/FilePath";
import { errorMessage } from "../Netscript/ErrorMessages";
import { formatNumber } from "../ui/formatNumber";
import { GetAllServers, GetServer } from "../Server/AllServers";
import { BaseServer } from "../Server/BaseServer";
import { capturePackets } from "../DarkNet/models/packetSniffing";
import { getBackdooredDarkwebServers, getServerSafely } from "../DarkNet/controllers/DarknetNetworkMovement";
import { addSessionToServer, DarknetState, getServerState } from "../DarkNet/models/DarknetState";
import { getStockFromSymbol } from "./StockMarket";
import { CompletedProgramName } from "@enums";
import { handleStormSeed } from "../DarkNet/controllers/webstorm";
import { getPasswordType, Minigames } from "../DarkNet/controllers/DarknetServerGenerator";
import { checkPassword, getAuthResult, isAuthenticated } from "../DarkNet/models/authentication";
import { getLabMaze, getSurroundingsVisualized, isLabyrinthServer } from "../DarkNet/models/labyrinth";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";

export type DarknetResult = { success: boolean; message: string };

const logger = (ctx: NetscriptContext) => (message: string) => helpers.log(ctx, () => message);
const error =
  (ctx: NetscriptContext) =>
  (message: string): never => {
    throw errorMessage(ctx, message);
  };

const isDirectConnected = (currentServer: BaseServer, targetServer: BaseServer): boolean =>
  currentServer.serversOnNetwork.includes(targetServer.hostname) || currentServer.hostname === targetServer.hostname;

export function getConnectedServer(ctx: NetscriptContext, hostname: string): BaseServer {
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

function expectDarknetAccess(ctx: NetscriptContext) {
  if (!hasDarknetAccess()) {
    error(ctx)(`You do not have access to the dnet api. Purchase "DarkscapeNavigator.exe" through your tor router to unlock it.`);
  }
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

export function getTimeoutChance() {
  const backdooredDarknetServerCount = getBackdooredDarkwebServers().length - 2;
  return Math.max(Math.min(backdooredDarknetServerCount * 0.03, 0.5), 0);
}

type CompleteHeartbleedOptions = {
  peek?: boolean;
  logsToCapture?: number;
  additionalMsec?: number;
};

function heartbleedOptions(ctx: NetscriptContext, opts: unknown): CompleteHeartbleedOptions {
  const defaults = {
    peek: false,
    logsToCapture: 3,
    additionalMsec: 0,
  };
  if (opts == null) {
    return defaults;
  }
  if (typeof opts !== "object") {
    return error(ctx)(`Invalid arguments: "options" is not an object`);
  }
  const options = {
    ...defaults,
    ...opts,
  };
  if (typeof options.peek !== "boolean") {
    return error(ctx)(`Invalid arguments: "options.peek" is not a boolean`);
  }
  if (typeof options.logsToCapture !== "number" || options.logsToCapture < 1) {
    return error(ctx)(`Invalid arguments: "options.logsToCapture" is not a positive integer`);
  }
  if (options.logsToCapture > 8) {
    return error(ctx)(`Invalid arguments: "options.logsToCapture" (${options.logsToCapture}) is larger than 8 `);
  }
  if (typeof options.additionalMsec !== "number" || options.additionalMsec < 0) {
    return error(ctx)(`Invalid arguments: "options.additionalMsec" is not a positive integer`);
  }
  return {
    peek: options.peek,
    logsToCapture: options.logsToCapture,
    additionalMsec: options.additionalMsec,
  };
}

export function NetscriptDarknet(): InternalAPI<NSDnet> {
  return {
    authenticate:
      (ctx: NetscriptContext) =>
      (_hostname, _password, _additionalMsec): Promise<DarknetResult> => {
        const targetHostname = helpers.string(ctx, "hostname", _hostname);
        const password = expectPassword(ctx, targetHostname, _password);
        const additionalMsec = helpers.number(ctx, "additionalMsec", _additionalMsec ?? 0);
        if (additionalMsec < 0) {
          return error(ctx)(`Invalid arguments: "additionalMsec" is not a positive integer`);
        }
        if (token.length > 100) {
          error(ctx)(`Invalid arguments: "password" is too long. Attempted length: ${token.length}. Attempted password starts with ${token.slice(0, 100)} `);
        }
        expectDarknetAccess(ctx);

        const currentServer = ctx.workerScript.getServer();
        const targetServer = getServerSafely(targetHostname);
        if (!targetServer) {
          logger(ctx)(`Target server ${targetHostname} does not exist. It may have gone offline.`);
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: ResponseStatus.NOT_FOUND,
          }));
        }

        const threads = ctx.workerScript.scriptRef.threads;
        const networkDelay = calculateAuthenticationTime(targetServer, Player, threads, password) + additionalMsec;
        if (!isDarknetServer(targetServer) && targetServer.hostname !== SpecialServers.DarkWeb) {
          logger(ctx)(`Target server ${targetHostname} is not a darknet server.`);
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: ResponseStatus.I_AM_A_TEAPOT,
          }));
        }

        if (!isDirectConnected(currentServer, targetServer)) {
          logger(ctx)(
            `Target server ${targetHostname} is not connected to the current server ${currentServer.hostname}. It may have moved`,
          );
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: ResponseStatus.MOVED_PERMANENTLY,
          }));
        }
        logger(ctx)(
          `Connecting to ${targetServer.hostname} with password '${password}'... (Est: ${formatNumber(
            networkDelay / 1000,
            1,
          )}s)`,
        );

        return helpers.netscriptDelay(ctx, networkDelay).then(() => {
          if (!getServerSafely(targetHostname)) {
            logger(ctx)(`Server ${targetHostname} not found. It may have gone offline.`);
            return {
              success: false,
              message: ResponseStatus.NOT_FOUND,
            };
          }
          if (Math.random() < getTimeoutChance()) {
            logger(ctx)(
              `Authentication on ${targetServer.hostname} timed out due to darknet instability. Please try again.`,
            );
            return {
              success: false,
              message: ResponseStatus.TIMEOUT,
            };
          }

          const result = getAuthResult(password, targetServer, threads, networkDelay, ctx.workerScript.pid);
          const success = result.result.success;
          const xp = formatNumber(calculatePasswordAttemptChaGain(targetServer, threads, success), 1);
          logger(ctx)(
            `Authentication on ${targetServer.hostname} ${success ? "succeeded" : `failed. (Gained ${xp} cha xp)`}`,
          );

          if (isLabyrinthServer(targetHostname)) {
            return {
              success: success,
              message: result.response.message,
            };
          }

          return {
            success: success,
            message: success ? ResponseStatus.SUCCESS : ResponseStatus.AUTH_FAILURE,
          };
        });
      },
    connectToSession:
      (ctx: NetscriptContext) =>
      (_hostname, _password): DarknetResult => {
        const targetHostname = helpers.string(ctx, "hostname", _hostname);
        const token = helpers.string(ctx, "password", _password);
        const targetServer = getServerSafely(targetHostname);
        expectDarknetAccess(ctx);

        if (token.length > 100) {
          error(ctx)(`Invalid arguments: "password" is too long. Attempted length: ${token.length}. Attempted password starts with ${token.slice(0, 100)} `);
        }

        if (!targetServer) {
          logger(ctx)(`Target server ${targetHostname} does not exist. It may have gone offline.`);
          return {
            success: false,
            message: ResponseStatus.NOT_FOUND,
          };
        }
        if (!targetServer.hasAdminRights) {
          logger(ctx)(
            `Target server ${targetHostname} requires root access. Use ns.dnet.authenticate() to gain access.`,
          );
          return {
            success: false,
            message: ResponseStatus.AUTH_FAILURE,
          };
        }
        if (!targetServer.darknetData && targetServer.hostname !== SpecialServers.DarkWeb) {
          logger(ctx)(`Target server ${targetHostname} is not a darknet server.`);
          return {
            success: false,
            message: ResponseStatus.I_AM_A_TEAPOT,
          };
        }
        const result = checkPassword(token, targetServer, 0, ctx.workerScript.pid);
        if (result.status === ResponseStatus.SUCCESS) {
          logger(ctx)(`Authentication on ${targetServer.hostname} succeeded.`);
          addSessionToServer(targetServer, ctx.workerScript.pid);
          return {
            success: true,
            message: ResponseStatus.SUCCESS,
          };
        }
        logger(ctx)(
          `${targetHostname} does not recognise that password. Use ns.dnet.authenticate() to create a session.`,
        );
        return {
          success: false,
          message: ResponseStatus.AUTH_FAILURE,
        };
      },
    heartbleed:
      (ctx: NetscriptContext) =>
      (_hostname, _opts): Promise<DarknetResult & { logs: string[] }> => {
        const targetHostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
        const options = heartbleedOptions(ctx, _opts);
        const targetServer = getServerSafely(targetHostname);
        expectDarknetAccess(ctx);

        if (!targetServer) {
          const result = `Target server ${targetHostname} does not exist. It may have gone offline.`;
          logger(ctx)(result);
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: result,
            logs: [],
          }));
        }
        if (!targetServer.darknetData) {
          const result = `${targetHostname} does not seem to be vulnerable to heartbleed.`;
          logger(ctx)(result);
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: result,
            logs: [],
          }));
        }
        const networkDelay =
          calculateAuthenticationTime(targetServer, Player, ctx.workerScript.scriptRef.threads) * 1.5 +
          (options.additionalMsec ?? 0);
        logger(ctx)(
          `Attempting to extract data from ${targetHostname}... (Est: ${formatNumber(networkDelay / 1000, 1)}s)`,
        );

        if ((targetServer.requiredHackingSkill ?? 0) > Player.skills.charisma) {
          const result = `You need a higher charisma level to extract data from ${targetHostname}. (${targetServer.requiredHackingSkill} required)`;
          logger(ctx)(result);
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: result,
            logs: [],
          }));
        }

        return helpers.netscriptDelay(ctx, networkDelay).then(() => {
          const xpGained = Player.mults.charisma_exp * 50 * ((500 + Player.skills.charisma) / 500);
          Player.gainCharismaExp(xpGained);
          if (!getServerSafely(targetHostname)) {
            const result = `Target server ${targetHostname} does not exist. It may have gone offline.`;
            logger(ctx)(result);
            return {
              success: false,
              message: result,
              logs: [],
            };
          }
          const serverState = getServerState(targetHostname);

          logger(ctx)(`Extracted log data from ${targetHostname}... (Gained ${formatNumber(xpGained, 1)} cha xp)`);

          if (isLabyrinthServer(targetHostname)) {
            const location = DarknetState.labLocations[ctx.workerScript.pid];
            if (!location) {
              return {
                success: true,
                message: "A mysterious maze has appeared...",
                logs: [],
              };
            }
            const surroundings = getSurroundingsVisualized(getLabMaze(), location[0], location[1]);
            const status = {
              coords: [location[0], location[1]],
              north: surroundings[0][1] === " ",
              east: surroundings[1][2] === " ",
              south: surroundings[2][1] === " ",
              west: surroundings[1][0] === " ",
            };
            return {
              success: true,
              message: `Extracted log data from ${targetHostname}`,
              logs: [JSON.stringify(status)],
            };
          }

          if (options.peek) {
            return {
              success: true,
              message: `Extracted log data from ${targetHostname}`,
              logs: serverState.serverLogs.slice(0, 1),
            };
          }
          const capturedLogs = serverState.serverLogs.slice(0, options.logsToCapture);
          serverState.serverLogs = serverState.serverLogs.slice(options.logsToCapture);

          return {
            success: true,
            message: `Extracted log data from ${targetHostname}`,
            logs: capturedLogs,
          };
        });
      },
    openCache:
      (ctx: NetscriptContext) =>
      (_fileName, _suppressToast): void => {
        const fileName = helpers.string(ctx, "fileName", _fileName);
        const suppressToast = _suppressToast ? helpers.boolean(ctx, "suppressToast", _suppressToast) : false;
        expectDarknetAccess(ctx);

        if (!hasCacheFileExtension(fileName)) {
          throw new Error(`Invalid cache file. (File must end in .cache) : ${fileName}`);
        }
        const currentServer = ctx.workerScript.getServer();
        const hasCacheFile = currentServer.caches.includes(fileName as FilePath);
        if (!hasCacheFile) {
          throw new Error(`Cache file not found: ${fileName} on server ${currentServer.hostname}`);
        }

        currentServer.caches = currentServer.caches.filter((cache) => cache !== fileName);
        const result = getRewardFromCache(currentServer, suppressToast);
        logger(ctx)(`Data file ${fileName} opened. ${result}`);
      },
    probe:
      (ctx: NetscriptContext) =>
      (_returnByIp): string[] => {
        const returnByIP = helpers.boolean(ctx, "returnByIP", _returnByIp ?? false);
        expectDarknetAccess(ctx);
        const server: BaseServer = ctx.workerScript.getServer();
        const out: string[] = [];
        for (const neighbor of server.serversOnNetwork) {
          const neighborServer = getServerSafely(neighbor);
          if (!neighborServer?.darknetData) {
            continue;
          }
          const entry = helpers.returnServerID(neighborServer, { returnByIP });
          if (entry) {
            out.push(entry);
          }
        }
        helpers.log(ctx, () => `returned ${out.length} connections for ${server.hostname}`);
        return out;
      },
    setStasisLink:
      (ctx: NetscriptContext) =>
      (_shouldLink): Promise<DarknetResult> => {
        const shouldLink = helpers.boolean(ctx, "shouldLink", _shouldLink);
        expectDarknetAccess(ctx);
        const server = ctx.workerScript.getServer();
        if (!server.darknetData) {
          helpers.log(ctx, () => `${server.hostname} was not stasis linked; it is not a darknet server`);
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: `${server.hostname} is not a darknet server.`,
          }));
        }

        const stasisLinkCount = GetAllServers(true).filter((s) => s.darknetData?.hasStasisLink).length;
        const stasisLinkLimit = getStasisLinkLimit();
        if (shouldLink && stasisLinkCount >= stasisLinkLimit) {
          helpers.log(ctx, () => `Stasis link limit reached. (${stasisLinkCount}/${stasisLinkLimit})`);
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: `Stasis link limit reached. (${stasisLinkCount}/${stasisLinkLimit})`,
          }));
        }
        helpers.log(
          ctx,
          () => `Beginning stasis ${shouldLink ? "" : "removal "}procedure on ${server.hostname}... (Est: 30s)`,
        );
        return helpers.netscriptDelay(ctx, 30000).then(() => {
          const stasisLinkCount = GetAllServers(true).filter((s) => s.darknetData?.hasStasisLink).length;
          const stasisLinkLimit = getStasisLinkLimit();
          if (shouldLink && stasisLinkCount >= stasisLinkLimit) {
            helpers.log(ctx, () => `Stasis link limit reached. (${stasisLinkCount}/${stasisLinkLimit})`);
            return {
              success: false,
              message: `Stasis link limit reached. (${stasisLinkCount}/${stasisLinkLimit})`,
            };
          }

          if (server.darknetData) {
            server.darknetData.hasStasisLink = shouldLink;
          }
          server.backdoorInstalled = shouldLink;
          helpers.log(
            ctx,
            () =>
              `Stasis link applied to server ${server.hostname}. (${stasisLinkCount}/${stasisLinkLimit} links in use)`,
          );
          return {
            success: true,
            message: `Stasis link ${shouldLink ? "applied" : "removed"} to server ${server.hostname}.`,
          };
        });
      },
    getStasisLinkLimit: (ctx: NetscriptContext) => (): number => {
      const limit = getStasisLinkLimit();
      logger(ctx)(`Stasis link limit: ${limit}`);
      return limit;
    },
    getStasisLinkedServers:
      (ctx: NetscriptContext) =>
      (_returnByIP): string[] => {
        const returnByIp = helpers.boolean(ctx, "returnByIP", _returnByIP ?? false);
        const servers = GetAllServers(true).filter((s) => s.darknetData?.hasStasisLink);
        const serverNames = servers.map((s) => (returnByIp ? s.ip : s.hostname));
        logger(ctx)(`Stasis linked servers: ${serverNames}`);
        return serverNames;
      },
    getServer: (ctx) => (_hostname) => {
      const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
      const server = expectDarknetServer(ctx, hostname);
      return {
        hostname: server.hostname,
        ip: server.ip,
        hasAdminRights: server.hasAdminRights,
        isConnectedTo: server.isConnectedTo,
        ramUsed: server.ramUsed,
        maxRam: server.maxRam,
        ownerAllocatedRam: server?.darknetData?.ramBlock ?? 0,
        backdoorInstalled: server.backdoorInstalled ?? false,
        moneyAvailable: 0,
        moneyMax: 0,
        charismaLevel: server.requiredHackingSkill ?? 0,
        depth: server?.darknetData?.x ?? -1,
        modelId: server?.darknetData?.minigameType ?? "",
      };
    },
    getServerAuthDetails: (ctx) => (_hostname) => {
      const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
      expectDarknetAccess(ctx);
      const server = getServerSafely(hostname);
      const offlineResponse = {
        isOnline: false,
        isConnected: false,
        modelId: "",
        passwordHint: "",
        data: "",
        logTrafficInterval: -1,
        passwordLength: -1,
        passwordFormat: "numeric",
      } as ServerAuthDetails;
      if (!server) {
        logger(ctx)(`Server ${hostname} not found. It may have gone offline.`);
        return offlineResponse;
      }
      if (!server.darknetData) {
        logger(ctx)(`${server.hostname} is not a darknet server.`);
        return offlineResponse;
      }
      const localServer = ctx.workerScript.getServer();
      const isConnected = isDirectConnected(localServer, server);
      if (server.hostname === SpecialServers.DarkWeb) {
        return {
          isOnline: true,
          isConnected: isConnected,
          modelId: Minigames.EchoVuln,
          passwordHint: "The passkey is 'leekspin'",
          data: "",
          logTrafficInterval: -1,
          passwordLength: 8,
          passwordFormat: getPasswordType("leekspin"),
        };
      }
      return {
        isOnline: true,
        isConnected: isConnected,
        modelId: server.darknetData.minigameType,
        passwordHint: server.darknetData.staticPasswordHint,
        data: server.darknetData.passwordHintData ?? "",
        logTrafficInterval: server.darknetData.logTrafficInterval,
        passwordLength: server.darknetData?.password?.length ?? 0,
        passwordFormat: getPasswordType(server.darknetData.password),
      };
    },
    packetCapture: (ctx) => (_hostname) => {
      const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
      const server = getConnectedServer(ctx, hostname);
      expectDarknetAccess(ctx);

      const networkDelay = calculateAuthenticationTime(server, Player, ctx.workerScript.scriptRef.threads) * 4;
      const xp = formatNumber(calculatePasswordAttemptChaGain(server, ctx.workerScript.scriptRef.threads), 1);
      logger(ctx)(`Captured some outgoing transmissions from ${hostname}. (Gained ${xp} cha xp)`);
      return helpers.netscriptDelay(ctx, networkDelay).then(() => {
        return capturePackets(server);
      });
    },
    induceServerMigration: (ctx) => (): Promise<DarknetResult> => {
      expectDarknetAccess(ctx);
      const server = ctx.workerScript.getServer();
      if (!server.darknetData) {
        logger(ctx)(`${server.hostname} is not a darknet server.`);
        return helpers.netscriptDelay(ctx, 100).then(() => ({
          success: false,
          message: `${server.hostname} is not a darknet server.`,
        }));
      }
      logger(ctx)(`Injecting routing instability... (Est: 10s)`);

      return helpers.netscriptDelay(ctx, 10000).then(() => {
        const xpGained = Player.mults.charisma_exp * 50 * ((200 + Player.skills.charisma) / 200);
        Player.gainCharismaExp(xpGained);

        const threads = ctx.workerScript.scriptRef.threads;
        DarknetState.migrationInductionServers[server.hostname] =
          (DarknetState.migrationInductionServers[server.hostname] ?? 0) + threads;

        const result = `Routing instability induced near ${server.hostname}. (Gained ${formatNumber(xpGained)} cha xp)`;
        logger(ctx)(result);
        return {
          success: true,
          message: result,
        };
      });
    },
    unleashStormSeed: (ctx) => (): DarknetResult => {
      expectDarknetAccess(ctx);
      const server = ctx.workerScript.getServer();
      const hasStormSeed = server.programs.includes(CompletedProgramName.stormSeed);
      if (!hasStormSeed) {
        const result = `No executable found on ${server.hostname}...`;
        logger(ctx)(result);
        return {
          success: false,
          message: result,
        };
      }

      const result = `The webstorm has been unleashed...`;
      logger(ctx)(result);
      handleStormSeed(server);
      return {
        success: true,
        message: result,
      };
    },
    isDarknetServer: (ctx) => (_hostname) => {
      const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
      const targetServer = GetAllServers(true).find((s) => s.hostname === hostname);
      return !!targetServer?.darknetData;
    },
    memoryReallocation:
      (ctx) =>
      (_hostname): Promise<DarknetResult> => {
        const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
        const server = getConnectedServer(ctx, hostname);
        expectAuthenticated(ctx, server);
        expectDarknetAccess(ctx);
        if (!server.darknetData) {
          const result = `Failed. Server ${server.hostname} is not a darknet server.`;
          logger(ctx)(result);
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: result,
          }));
        }
        if (server.darknetData.ramBlock <= 0) {
          const result = `Failed. Server ${server.hostname} has no host-owned ram left to reallocate.`;
          logger(ctx)(result);
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: result,
          }));
        }

        logger(ctx)(`Attempting to liberate RAM from '${server.hostname}'s owner ...`);
        const delayTime = Math.max(8000 * (500 / (500 + Player.skills.charisma)), 200);

        return helpers.netscriptDelay(ctx, delayTime).then(() => {
          if (!server.darknetData || server.darknetData.ramBlock <= 0) {
            const result = `Server ${server.hostname} has no host-owned ram left to reallocate.`;
            logger(ctx)(result);
            return {
              success: false,
              message: result,
            };
          }

          const threads = ctx.workerScript.scriptRef.threads;
          const difficulty = server.darknetData.difficulty + 1;
          const xpGained =
            Player.mults.charisma_exp * threads * 10 * 1.1 ** difficulty * ((200 + Player.skills.charisma) / 200);
          Player.gainCharismaExp(xpGained);

          const ramBlockRemoved = getRamBlockRemoved(server, threads);
          server.darknetData.ramBlock -= ramBlockRemoved;
          server.updateRamUsed(server.ramUsed - ramBlockRemoved);

          if (server.darknetData.ramBlock <= 0) {
            handleRamBlockClearedRewards(server);
          }

          const result = `Liberated ${formatNumber(
            ramBlockRemoved,
            4,
          )}gb of RAM from the server owner's processes. (Gained ${formatNumber(xpGained, 1)} cha xp.)`;
          logger(ctx)(result);
          return {
            success: true,
            message: result,
          };
        });
      },
    getOwnerAllocatedRam:
      (ctx) =>
      (_hostname): number => {
        const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
        const server = getServerSafely(hostname);
        if (!server?.darknetData) {
          return 0;
        }
        return server.darknetData.ramBlock;
      },
    promoteStock:
      (ctx: NetscriptContext) =>
      (_symbol): Promise<DarknetResult> => {
        const symbol = helpers.string(ctx, "symbol", _symbol);
        const stock = getStockFromSymbol(ctx, symbol);
        expectDarknetServer(ctx, ctx.workerScript.hostname);
        expectDarknetAccess(ctx);

        const waitTime = Math.max(8000 * (600 / (600 + Player.skills.charisma)), 200);
        logger(ctx)(
          `Spreading ${stock.name} stock propaganda to raise volatility... (Est: ${formatNumber(waitTime / 1000, 1)}s)`,
        );

        return helpers.netscriptDelay(ctx, waitTime).then(() => {
          const threads = ctx.workerScript.scriptRef.threads;
          const promotionAmount = threads * ((500 + Player.skills.charisma) / 500);
          DarknetState.stockPromotions[symbol] = (DarknetState.stockPromotions[symbol] ?? 0) + promotionAmount;

          const chaXp = Player.mults.charisma_exp * threads * 10 * ((200 + Player.skills.charisma) / 200);
          Player.gainCharismaExp(chaXp);

          const result = `Spread promotion for ${stock.name}. (Gained ${formatNumber(chaXp, 1)} cha xp)`;
          logger(ctx)(result);
          return {
            success: true,
            message: result,
          };
        });
      },
    phishingAttack: (ctx: NetscriptContext) => (): Promise<DarknetResult> => {
      const threads = ctx.workerScript.scriptRef.threads;
      const waitTime = Math.max(10000 * (400 / (400 + Player.skills.charisma)), 200);
      expectDarknetServer(ctx, ctx.workerScript.hostname);
      expectDarknetAccess(ctx);

      return helpers.netscriptDelay(ctx, waitTime).then(() => {
        const xpGained = Player.mults.charisma_exp * threads * 50 * ((200 + Player.skills.charisma) / 200);
        Player.gainCharismaExp(xpGained);

        const timeSinceLastRewardCache = new Date().getTime() - DarknetState.lastPhishingCacheTime.getTime();
        const rewardCacheChance = 0.01 * Player.mults.crime_success * threads * ((400 + Player.skills.charisma) / 400);
        const moneyRewardChance = 0.05 * Player.mults.crime_success * ((100 + Player.skills.charisma) / 100);

        if (timeSinceLastRewardCache < 1000 * 60 * 3 && Math.random() < rewardCacheChance) {
          addCacheToServer(ctx.workerScript.getServer());
          DarknetState.lastPhishingCacheTime = new Date();
          const result = `Phishing attack succeeded! Found a cache file. (Gained ${formatNumber(xpGained, 1)} cha xp)`;
          logger(ctx)(result);
          return {
            success: true,
            message: result,
          };
        } else if (Math.random() < moneyRewardChance) {
          const randomFactor = Math.random() * 0.3 + 0.9;
          const moneyReward =
            2e4 * Player.mults.crime_money * threads * ((50 + Player.skills.charisma) / 50) * randomFactor * currentNodeMults.DarknetMoneyMultiplier;
          Player.gainMoney(moneyReward, "darknet");
          const result = `Phishing attack succeeded! $${formatNumber(moneyReward, 2)} retrieved. (Gained ${formatNumber(
            xpGained,
            1,
          )} cha xp)`;
          logger(ctx)(result);
          return {
            success: true,
            message: result,
          };
        }
        const result = `There were no takers on that phishing attempt. (Gained ${formatNumber(xpGained, 1)} cha xp)`;
        logger(ctx)(result);
        return {
          success: false,
          message: result,
        };
      });
    },
  };
}
