import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import type { Darknet as NSDnet, ServerAuthDetails } from "@nsdefs";
import { helpers } from "../Netscript/NetscriptHelpers";
import { SpecialServers } from "../Server/data/SpecialServers";
import {
  calculateAuthenticationTime,
  calculatePasswordAttemptChaGain,
  chargeServerMigration,
  getBackdoorAuthTimeDebuff,
  getDarknetData,
  getRewardFromCache,
  getStasisLinkLimit,
  getStasisLinkServers,
  hasCacheFileExtension,
  isDarknetServer,
} from "../DarkNet/effects/effects";
import { Player } from "@player";
import type { FilePath } from "../Paths/FilePath";
import { formatNumber } from "../ui/formatNumber";
import { GetServer } from "../Server/AllServers";
import { BaseServer } from "../Server/BaseServer";
import { capturePackets } from "../DarkNet/models/packetSniffing";
import { getDarknetServerSafely } from "../DarkNet/controllers/NetworkMovement";
import { addSessionToServer, DarknetState, getServerState } from "../DarkNet/models/DarknetState";
import { getStockFromSymbol } from "./StockMarket";
import { CompletedProgramName } from "@enums";
import { handleStormSeed } from "../DarkNet/effects/webstorm";
import { getPasswordType } from "../DarkNet/controllers/ServerGenerator";
import { checkPassword, getAuthResult } from "../DarkNet/effects/authentication";
import { getLabMaze, getSurroundingsVisualized, isLabyrinthServer } from "../DarkNet/effects/labyrinth";
import { getPhishingAttackSpeed, handlePhishingAttack } from "../DarkNet/effects/phishing";
import { handleRamBlockRemoved } from "../DarkNet/effects/ramblock";
import {
  error,
  expectDarknetAccess,
  expectDarknetServer,
  expectPassword,
  getFailureResult,
  getTimeoutChance,
  isDirectConnected,
  logger,
} from "../DarkNet/effects/offlineServerHandling";
import { DarknetServer } from "../Server/DarknetServer";
import { ResponseStatus } from "../DarkNet/Enums";

export type DarknetResult = { success: boolean; message: string };

type CompleteHeartbleedOptions = {
  peek: boolean;
  logsToCapture: number;
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

function getDarknetServer(ctx: NetscriptContext, hostname: string): DarknetServer {
  const server = helpers.getServer(ctx, hostname);
  if (!isDarknetServer(server)) {
    throw helpers.errorMessage(ctx, `${hostname} is not a darknet server.`);
  }
  return server;
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
        if (password.length > 100) {
          error(ctx)(
            `Invalid arguments: "password" is too long. Attempted length: ${
              password.length
            }. Attempted password starts with ${password.slice(0, 100)} `,
          );
        }
        const onlineConnectionCheck = getFailureResult(ctx, targetHostname, { requireDirectConnection: true });
        if (!onlineConnectionCheck.success) {
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: onlineConnectionCheck.message,
            requireDarknet: true,
          }));
        }
        const targetServer = GetServer(targetHostname);
        const darknetData = getDarknetData(targetServer);
        if (!darknetData || !targetServer) {
          throw helpers.errorMessage(ctx, `${targetHostname} is not a darknet server.`);
        }

        const threads = ctx.workerScript.scriptRef.threads;
        const networkDelay = calculateAuthenticationTime(darknetData, Player, threads, password) + additionalMsec;

        logger(ctx)(
          `Connecting to ${targetServer.hostname} with password '${password}'... (Est: ${formatNumber(
            networkDelay / 1000,
            1,
          )}s)`,
        );

        return helpers.netscriptDelay(ctx, networkDelay).then(() => {
          const onlineConnectionCheck = getFailureResult(ctx, targetHostname, { requireDirectConnection: true });
          if (!onlineConnectionCheck.success) {
            return helpers.netscriptDelay(ctx, 100).then(() => ({
              success: false,
              message: onlineConnectionCheck.message,
            }));
          }

          const authResult = getAuthResult(password, targetServer, threads, networkDelay, ctx.workerScript.pid);
          const success = authResult.result.success;
          const xp = formatNumber(calculatePasswordAttemptChaGain(targetServer, threads, success), 1);
          logger(ctx)(
            `Authentication on ${targetServer.hostname} ${success ? "succeeded" : `failed. (Gained ${xp} cha xp)`}`,
          );

          if (isLabyrinthServer(targetHostname)) {
            return {
              success: success,
              message: authResult.response.message,
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
        if (token.length > 100) {
          error(ctx)(
            `Invalid arguments: "password" is too long. Attempted length: ${
              token.length
            }. Attempted password starts with ${token.slice(0, 100)} `,
          );
        }
        const onlineConnectionCheck = getFailureResult(ctx, targetHostname);
        if (!onlineConnectionCheck.success) {
          return {
            success: false,
            message: onlineConnectionCheck.message,
          };
        }
        const targetServer = helpers.getServer(ctx, targetHostname);

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
        const onlineConnectionCheck = getFailureResult(ctx, targetHostname, {
          requireDirectConnection: true,
          requireDarknet: true,
        });
        if (!onlineConnectionCheck.success) {
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: onlineConnectionCheck.message,
            logs: [],
          }));
        }
        const targetServer = getDarknetServer(ctx, targetHostname);
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
          const onlineConnectionCheck = getFailureResult(ctx, targetHostname, { requireDirectConnection: true });
          if (!onlineConnectionCheck.success) {
            return {
              success: false,
              message: onlineConnectionCheck.message,
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
          const neighborServer = getDarknetServerSafely(neighbor);
          if (!neighborServer || neighborServer.hostname !== SpecialServers.DarkWeb) {
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
        if (server.hostname === SpecialServers.DarkWeb) {
          helpers.log(ctx, () => `${server.hostname} cannot be stasis linked.`);
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: `${server?.hostname} cannot be stasis linked.`,
          }));
        }
        if (!isDarknetServer(server)) {
          helpers.log(ctx, () => `${server.hostname} was not stasis linked; it is not a darknet server`);
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: `${server?.hostname} is not a darknet server.`,
          }));
        }

        const stasisLinkCount = getStasisLinkServers().length;
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
          const stasisLinkCount = getStasisLinkServers().length;
          const stasisLinkLimit = getStasisLinkLimit();
          if (shouldLink && stasisLinkCount >= stasisLinkLimit) {
            helpers.log(ctx, () => `Stasis link limit reached. (${stasisLinkCount}/${stasisLinkLimit})`);
            return {
              success: false,
              message: `Stasis link limit reached. (${stasisLinkCount}/${stasisLinkLimit})`,
            };
          }

          server.hasStasisLink = shouldLink;
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
        const servers = getStasisLinkServers();
        const serverNames = servers.map((s) => (returnByIp ? s.ip : s.hostname));
        logger(ctx)(`Stasis linked servers: ${serverNames}`);
        return serverNames;
      },
    getServer: (ctx) => (_hostname) => {
      const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
      const server = GetServer(hostname);
      if (!server && DarknetState.offlineServers.includes(hostname)) {
        logger(ctx)(`Server ${hostname} is offline. Cannot retrieve server data.`);
        return null;
      }
      if (!server) {
        logger(ctx)(`Server ${hostname} not found.`);
        return null;
      }
      const darknetData = getDarknetData(server);
      if (!darknetData) {
        logger(ctx)(`${hostname} is not a darknet server.`);
        return null;
      }
      return {
        hostname: darknetData.hostname,
        ip: darknetData.ip,
        hasAdminRights: darknetData.hasAdminRights,
        isConnectedTo: darknetData.isConnectedTo,
        ramUsed: darknetData.ramUsed,
        maxRam: darknetData.maxRam,
        ownerAllocatedRam: darknetData.ramBlock,
        backdoorInstalled: darknetData.backdoorInstalled ?? false,
        depth: darknetData.depth ?? -1,
        modelId: darknetData.modelId ?? "",
        organizationName: darknetData.organizationName,
        purchasedByPlayer: darknetData.purchasedByPlayer,
        hasStasisLink: darknetData.hasStasisLink ?? false,
        ramBlock: darknetData.ramBlock ?? 0,
        staticPasswordHint: darknetData.staticPasswordHint ?? "",
        passwordHintData: darknetData.passwordHintData ?? "",
        difficulty: darknetData.difficulty ?? 0,
        requiredCharismaSkill: darknetData.requiredCharismaSkill ?? 0,
        logTrafficInterval: darknetData.logTrafficInterval ?? 0,
      };
    },
    getServerAuthDetails: (ctx) => (_hostname) => {
      const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
      expectDarknetAccess(ctx);
      const server = GetServer(hostname);
      const darknetData = getDarknetData(server);
      const offlineResponse = {
        isOnline: false,
        isConnectedToCurrentServer: false,
        hasSession: false,
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
      if (!darknetData) {
        logger(ctx)(`${hostname} is not a darknet server.`);
        return offlineResponse;
      }
      const localServer = ctx.workerScript.getServer();
      const isConnected = isDirectConnected(localServer, server);
      const hasSession =
        DarknetState.serverState[server.hostname]?.authenticatedPIDs.includes(ctx.workerScript.pid) ||
        hostname === SpecialServers.DarkWeb;
      return {
        isOnline: true,
        isConnectedToCurrentServer: isConnected,
        hasSession,
        modelId: darknetData.modelId,
        passwordHint: darknetData.staticPasswordHint,
        data: darknetData.passwordHintData ?? "",
        logTrafficInterval: darknetData.logTrafficInterval,
        passwordLength: darknetData.password?.length ?? 0,
        passwordFormat: getPasswordType(darknetData.password),
      };
    },
    packetCapture: (ctx) => (_hostname) => {
      const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
      const server = GetServer(hostname);
      const darknetData = getDarknetData(server);
      const onlineConnectionCheck = getFailureResult(ctx, hostname, {
        requireDirectConnection: true,
        requireDarknet: true,
      });
      if (!onlineConnectionCheck.success || !darknetData || !server) {
        return helpers.netscriptDelay(ctx, 100).then(() => ({
          success: false,
          message: onlineConnectionCheck.message,
          data: "",
        }));
      }

      const networkDelay = calculateAuthenticationTime(darknetData, Player, ctx.workerScript.scriptRef.threads) * 4;
      const xp = formatNumber(calculatePasswordAttemptChaGain(server, ctx.workerScript.scriptRef.threads), 1);

      const result = `Captured some outgoing transmissions from ${hostname}. (Gained ${xp} cha xp)`;
      logger(ctx)(result);
      return helpers.netscriptDelay(ctx, networkDelay).then(() => {
        return {
          success: true,
          message: result,
          data: capturePackets(server),
        };
      });
    },
    induceServerMigration:
      (ctx) =>
      (_hostname): Promise<DarknetResult> => {
        const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
        const onlineConnectionCheck = getFailureResult(ctx, hostname, {
          requireDirectConnection: true,
          requireDarknet: true,
          preventDarkweb: true,
        });
        if (!onlineConnectionCheck.success) {
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: onlineConnectionCheck.message,
          }));
        }
        const server = helpers.getServer(ctx, hostname);
        logger(ctx)(`Inducing server migration of ${server.hostname}... (Est: 6s)`);

        return helpers.netscriptDelay(ctx, 6000).then(() => {
          const onlineConnectionCheck = getFailureResult(ctx, hostname, {
            requireDirectConnection: true,
            requireDarknet: true,
          });
          if (!onlineConnectionCheck.success) {
            return helpers.netscriptDelay(ctx, 100).then(() => ({
              success: false,
              message: onlineConnectionCheck.message,
            }));
          }
          const server = helpers.getServer(ctx, hostname);
          const currentDepth = getDarknetData(server)?.depth ?? 0;
          const result = chargeServerMigration(server, ctx.workerScript.scriptRef.threads);

          const message = `Induced ${formatNumber(
            result.chargeIncrease * 100,
          )}%. Migration prep is now at ${formatNumber(result.newCharge * 100)}%.  (Gained ${formatNumber(
            result.xpGained,
          )} cha xp)`;
          logger(ctx)(message);
          if (result.newCharge >= 1 && currentDepth < (getDarknetData(server)?.depth ?? 0)) {
            logger(ctx)(`${server.hostname} has been migrated!`);
          }
          return {
            success: true,
            message: message,
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
      const darknetData = getDarknetData(GetServer(hostname));
      return !!darknetData;
    },
    memoryReallocation:
      (ctx) =>
      (_hostname): Promise<DarknetResult> => {
        const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
        const onlineConnectionCheck = getFailureResult(ctx, hostname, {
          requireDirectConnection: true,
          requireDarknet: true,
          requireSession: true,
          preventDarkweb: true,
        });
        if (!onlineConnectionCheck.success) {
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: onlineConnectionCheck.message,
          }));
        }
        const server = getDarknetServerSafely(hostname);
        if (!server) {
          throw helpers.errorMessage(ctx, `Server ${hostname} not found. It may have gone offline.`);
        }

        if (server.ramBlock <= 0) {
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
          return handleRamBlockRemoved(ctx, hostname);
        });
      },
    getOwnerAllocatedRam:
      (ctx) =>
      (_hostname): number => {
        const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
        const server = getDarknetServerSafely(hostname);
        if (!server) {
          return 0;
        }
        return server.ramBlock;
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
      const waitTime = getPhishingAttackSpeed();
      expectDarknetServer(ctx, ctx.workerScript.hostname);
      expectDarknetAccess(ctx);

      return helpers.netscriptDelay(ctx, waitTime).then(() => {
        return handlePhishingAttack(ctx);
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
