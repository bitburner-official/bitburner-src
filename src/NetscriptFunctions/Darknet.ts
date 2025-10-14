import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import type { Darknet as NSDnet } from "@nsdefs";
import { helpers } from "../Netscript/NetscriptHelpers";
import { SpecialServers } from "../Server/data/SpecialServers";
import {
  calculateAuthenticationTime,
  calculatePasswordAttemptChaGain,
  chargeServerMigration,
  getBackdoorAuthTimeDebuff,
  getStasisLinkLimit,
} from "../DarkNet/effects/effects";
import { Player } from "@player";
import { formatNumber } from "../ui/formatNumber";
import { GetServer } from "../Server/AllServers";
import { capturePackets } from "../DarkNet/models/packetSniffing";
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
  expectDarknetAccess,
  expectRunningOnDarknetServer,
  getFailureResult,
  getTimeoutChance,
  isDirectConnected,
  logger,
} from "../DarkNet/effects/offlineServerHandling";
import { DarknetServer } from "../Server/DarknetServer";
import { exampleDarknetServer, ResponseStatus } from "../DarkNet/Enums";
import { getRewardFromCache } from "../DarkNet/effects/cacheFiles";
import { CONSTANTS } from "../Constants";
import { getStasisLinkServers } from "../DarkNet/utils/darknetNetworkUtils";
import { resolveCacheFilePath } from "../Paths/CacheFilePath";

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
    throw helpers.errorMessage(ctx, `Invalid arguments: "options" is not an object`);
  }
  const options = {
    ...defaults,
    ...opts,
  };
  if (typeof options.peek !== "boolean") {
    throw helpers.errorMessage(ctx, `Invalid arguments: "options.peek" is not a boolean`);
  }
  if (typeof options.logsToCapture !== "number" || options.logsToCapture < 1) {
    throw helpers.errorMessage(ctx, `Invalid arguments: "options.logsToCapture" is not a positive integer`);
  }
  if (options.logsToCapture > 8) {
    throw helpers.errorMessage(
      ctx,
      `Invalid arguments: "options.logsToCapture" (${options.logsToCapture}) is larger than 8`,
    );
  }
  if (typeof options.additionalMsec !== "number" || options.additionalMsec < 0) {
    throw helpers.errorMessage(ctx, `Invalid arguments: "options.additionalMsec" is not a positive integer`);
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
        const password = helpers.string(ctx, "password", _password);
        const additionalMsec = helpers.number(ctx, "additionalMsec", _additionalMsec ?? 0);
        if (additionalMsec < 0) {
          throw helpers.errorMessage(ctx, `Invalid arguments: "additionalMsec" is not a positive integer`);
        }
        if (password.length > 100) {
          throw helpers.errorMessage(
            ctx,
            `Invalid arguments: "password" is too long. Attempted length: ${
              password.length
            }. Attempted password starts with ${password.slice(0, 100)} `,
          );
        }
        const onlineConnectionCheck = getFailureResult(ctx, targetHostname, {
          requireDirectConnection: true,
        });
        if (!onlineConnectionCheck.success) {
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: onlineConnectionCheck.message,
            requireDarknet: true,
          }));
        }
        const server = onlineConnectionCheck.server;

        const threads = ctx.workerScript.scriptRef.threads;
        const networkDelay = calculateAuthenticationTime(server, Player, threads, password) + additionalMsec;

        logger(ctx)(
          `Connecting to ${server.hostname} with password '${password}'... (Est: ${formatNumber(
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

          // Authentication has a chance to timeout based on darknet instability
          if (Math.random() < getTimeoutChance()) {
            logger(ctx)(`Autnetication to ${targetHostname} timed out due to network instability. Please try again.`);
            return {
              success: false,
              message: ResponseStatus.TIMEOUT,
            };
          }

          const server = onlineConnectionCheck.server;
          const authResult = getAuthResult(server, password, threads, networkDelay, ctx.workerScript.pid);
          const success = authResult.result.success;
          const xp = formatNumber(calculatePasswordAttemptChaGain(server, threads, success), 1);
          logger(ctx)(
            `Authentication on ${server.hostname} ${success ? "succeeded" : `failed. (Gained ${xp} cha xp)`}`,
          );

          if (isLabyrinthServer(targetHostname)) {
            return {
              success: success,
              message: authResult.response.message,
              data: authResult.response.data,
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
          throw helpers.errorMessage(
            ctx,
            `Invalid arguments: "password" is too long. Attempted length: ${
              token.length
            }. Attempted password starts with ${token.slice(0, 100)} `,
          );
        }
        const onlineConnectionCheck = getFailureResult(ctx, targetHostname, {
          requireAdminRights: true,
        });
        if (!onlineConnectionCheck.success) {
          return {
            success: false,
            message: onlineConnectionCheck.message,
          };
        }
        const server = onlineConnectionCheck.server;

        const result = checkPassword(server, token, 0, ctx.workerScript.pid);
        if (result.status === ResponseStatus.SUCCESS) {
          logger(ctx)(`Authentication on ${server.hostname} succeeded.`);
          /**
           * WIP-@fico: Do we need to call addSessionToServer here? handleSuccessfulAuth and handleLabyrinthPassword
           * already call it if the password is correct.
           */
          addSessionToServer(server, ctx.workerScript.pid);
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
        });
        if (!onlineConnectionCheck.success) {
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: onlineConnectionCheck.message,
            logs: [],
          }));
        }
        const server = onlineConnectionCheck.server;
        const networkDelay =
          calculateAuthenticationTime(server, Player, ctx.workerScript.scriptRef.threads) * 1.5 +
          (options.additionalMsec ?? 0);
        logger(ctx)(
          `Attempting to extract data from ${targetHostname}... (Est: ${formatNumber(networkDelay / 1000, 1)}s)`,
        );

        if (Player.skills.charisma < server.requiredCharismaSkill) {
          const result = `You need a higher charisma level to extract data from ${targetHostname}. (${server.requiredHackingSkill} required)`;
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
        const suppressToast = helpers.boolean(ctx, "suppressToast", _suppressToast ?? false);
        const server = expectRunningOnDarknetServer(ctx);
        expectDarknetAccess(ctx);

        const path = resolveCacheFilePath(fileName);
        if (!path) {
          throw helpers.errorMessage(ctx, `Invalid cache file. (File must end in .cache) : ${fileName}`);
        }
        const hasCacheFile = server.caches.includes(path);
        if (!hasCacheFile) {
          throw helpers.errorMessage(ctx, `Cache file not found: ${fileName} on server ${server.hostname}`);
        }

        server.caches = server.caches.filter((cache) => cache !== fileName);
        const result = getRewardFromCache(server, suppressToast);
        logger(ctx)(`Data file ${fileName} opened. ${result}`);
      },
    probe:
      (ctx: NetscriptContext) =>
      (_returnByIp): string[] => {
        const returnByIP = helpers.boolean(ctx, "returnByIP", _returnByIp ?? false);
        const server = ctx.workerScript.getServer();
        const out = [];
        for (const neighbor of server.serversOnNetwork) {
          const neighborServer = GetServer(neighbor);
          if (!(neighborServer instanceof DarknetServer)) {
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
        const shouldLink = helpers.boolean(ctx, "shouldLink", _shouldLink ?? true);
        const hostname = ctx.workerScript.getServer().hostname;
        const onlineConnectionCheck = getFailureResult(ctx, hostname);
        if (!onlineConnectionCheck.success) {
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: onlineConnectionCheck.message,
          }));
        }
        const server = onlineConnectionCheck.server;
        if (!server.isMobile) {
          helpers.log(ctx, () => `${server.hostname} cannot be stasis linked: it is a stationary server.`);
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: `${server.hostname} cannot be stasis linked.`,
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
        // setStasisLink's delay is hardcoded at 30s. We should skip this delay in Jest tests.
        return helpers.netscriptDelay(ctx, !CONSTANTS.isInTestEnvironment ? 30000 : 0).then(() => {
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
          const message = `Stasis link ${shouldLink ? "applied to" : "removed from"} server ${server.hostname}.`;
          helpers.log(ctx, () => `${message}. (${stasisLinkCount}/${stasisLinkLimit} links in use)`);
          return { success: true, message };
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
      const onlineConnectionCheck = getFailureResult(ctx, hostname);
      if (!onlineConnectionCheck.success) {
        logger(ctx)(onlineConnectionCheck.message);
        return {
          ...exampleDarknetServer,
          hostname: hostname,
          isOnline: false,
        };
      }
      const server = onlineConnectionCheck.server;
      return {
        hostname: server.hostname,
        isOnline: true,
        ip: server.ip,
        hasAdminRights: server.hasAdminRights,
        isConnectedTo: server.isConnectedTo,
        ramUsed: server.ramUsed,
        maxRam: server.maxRam,
        ownerAllocatedRam: server.ramBlock,
        backdoorInstalled: server.backdoorInstalled,
        depth: server.depth,
        modelId: server.modelId,
        organizationName: server.organizationName,
        purchasedByPlayer: server.purchasedByPlayer,
        hasStasisLink: server.hasStasisLink,
        ramBlock: server.ramBlock,
        staticPasswordHint: server.staticPasswordHint,
        passwordHintData: server.passwordHintData,
        difficulty: server.difficulty,
        requiredCharismaSkill: server.requiredCharismaSkill,
        logTrafficInterval: server.logTrafficInterval,
      };
    },
    getServerAuthDetails: (ctx) => (_hostname) => {
      const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
      const onlineConnectionCheck = getFailureResult(ctx, hostname);
      if (!onlineConnectionCheck.success) {
        logger(ctx)(onlineConnectionCheck.message);
        return {
          isOnline: false,
          isConnectedToCurrentServer: false,
          hasSession: false,
          modelId: "",
          passwordHint: "",
          data: "",
          logTrafficInterval: -1,
          passwordLength: -1,
          passwordFormat: "numeric",
        };
      }
      const targetServer = onlineConnectionCheck.server;
      const localServer = ctx.workerScript.getServer();
      const isConnected = isDirectConnected(localServer, targetServer);
      const hasSession =
        DarknetState.serverState[targetServer.hostname]?.authenticatedPIDs.includes(ctx.workerScript.pid) ||
        hostname === SpecialServers.DarkWeb;
      return {
        isOnline: true,
        isConnectedToCurrentServer: isConnected,
        hasSession,
        modelId: targetServer.modelId,
        passwordHint: targetServer.staticPasswordHint,
        data: targetServer.passwordHintData ?? "",
        logTrafficInterval: targetServer.logTrafficInterval,
        passwordLength: targetServer.password.length,
        passwordFormat: getPasswordType(targetServer.password),
      };
    },
    packetCapture: (ctx) => (_hostname) => {
      const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
      const onlineConnectionCheck = getFailureResult(ctx, hostname, {
        requireDirectConnection: true,
      });
      if (!onlineConnectionCheck.success) {
        return helpers.netscriptDelay(ctx, 100).then(() => ({
          success: false,
          message: onlineConnectionCheck.message,
          data: "",
        }));
      }

      const server = onlineConnectionCheck.server;
      const networkDelay = calculateAuthenticationTime(server, Player, ctx.workerScript.scriptRef.threads) * 4;
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
          preventUseOnImmobileServers: true,
        });
        if (!onlineConnectionCheck.success) {
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: onlineConnectionCheck.message,
          }));
        }
        const server = onlineConnectionCheck.server;
        logger(ctx)(`Inducing server migration of ${server.hostname}... (Est: 6s)`);

        // induceServerMigration's delay is hardcoded at 6s. We should skip this delay in Jest tests.
        return helpers.netscriptDelay(ctx, !CONSTANTS.isInTestEnvironment ? 6000 : 0).then(() => {
          const onlineConnectionCheck = getFailureResult(ctx, hostname, {
            requireDirectConnection: true,
            preventUseOnImmobileServers: true,
          });
          if (!onlineConnectionCheck.success) {
            return helpers.netscriptDelay(ctx, 100).then(() => ({
              success: false,
              message: onlineConnectionCheck.message,
            }));
          }
          const server = onlineConnectionCheck.server;
          const currentDepth = server.depth;
          const result = chargeServerMigration(server, ctx.workerScript.scriptRef.threads);

          const message = `Induced ${formatNumber(
            result.chargeIncrease * 100,
          )}%. Migration prep is now at ${formatNumber(result.newCharge * 100)}%.  (Gained ${formatNumber(
            result.xpGained,
          )} cha xp)`;
          logger(ctx)(message);
          if (result.newCharge >= 1 && currentDepth < server.depth) {
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
      const server = GetServer(hostname);
      if (!server) {
        return false;
      }
      if (!(server instanceof DarknetServer)) {
        return false;
      }
      return true;
    },
    memoryReallocation:
      (ctx) =>
      (_hostname): Promise<DarknetResult> => {
        const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
        const onlineConnectionCheck = getFailureResult(ctx, hostname, {
          requireDirectConnection: true,
          requireSession: true,
        });
        if (!onlineConnectionCheck.success) {
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            message: onlineConnectionCheck.message,
          }));
        }
        const server = onlineConnectionCheck.server;

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
          /**
           * WIP-@fico: I moved this block of code from handleRamBlockRemoved to here. I notice that the check here does
           * not use requireSession like the check above. Is this intentional?
           */
          const onlineConnectionCheck = getFailureResult(ctx, hostname, { requireDirectConnection: true });
          if (!onlineConnectionCheck.success) {
            return helpers.netscriptDelay(ctx, 100).then(() => ({
              success: false,
              message: onlineConnectionCheck.message,
            }));
          }
          const server = onlineConnectionCheck.server;
          if (server.ramBlock <= 0) {
            const result = `Server ${server.hostname} has no host-owned ram left to reallocate.`;
            logger(ctx)(result);
            return {
              success: false,
              message: result,
            };
          }
          return handleRamBlockRemoved(ctx, server);
        });
      },
    getOwnerAllocatedRam:
      (ctx) =>
      (_hostname): number => {
        const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
        expectRunningOnDarknetServer(ctx);
        const onlineConnectionCheck = getFailureResult(ctx, hostname);
        if (!onlineConnectionCheck.success) {
          return 0;
        }
        return onlineConnectionCheck.server.ramBlock;
      },
    getCurrentDepth:
      (ctx) =>
      (_hostname): number => {
        const hostname = helpers.string(ctx, "hostname", _hostname ?? ctx.workerScript.hostname);
        expectRunningOnDarknetServer(ctx);
        const onlineConnectionCheck = getFailureResult(ctx, hostname);
        if (!onlineConnectionCheck.success) {
          return -1;
        }
        return onlineConnectionCheck.server.depth;
      },
    promoteStock:
      (ctx: NetscriptContext) =>
      (_symbol): Promise<DarknetResult> => {
        const symbol = helpers.string(ctx, "symbol", _symbol);
        const stock = getStockFromSymbol(ctx, symbol);
        expectRunningOnDarknetServer(ctx);
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
      const server = expectRunningOnDarknetServer(ctx);
      expectDarknetAccess(ctx);

      return helpers.netscriptDelay(ctx, waitTime).then(() => {
        return handlePhishingAttack(ctx, server);
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
