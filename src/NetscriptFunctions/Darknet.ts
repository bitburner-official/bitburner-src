import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import type { Darknet as DarknetAPI, DarknetResult } from "@nsdefs";
import { helpers } from "../Netscript/NetscriptHelpers";
import {
  calculateAuthenticationTime,
  calculatePasswordAttemptChaGain,
  chargeServerMigration,
  getBackdoorAuthTimeDebuff,
  getSetStasisLinkDuration,
  getStasisLinkLimit,
  setStasisLink,
} from "../DarkNet/effects/effects";
import { Player } from "@player";
import { formatNumber } from "../ui/formatNumber";
import { GetServer } from "../Server/AllServers";
import { addSessionToServer, DarknetState } from "../DarkNet/models/DarknetState";
import { getStockFromSymbol } from "./StockMarket";
import { CompletedProgramName } from "@enums";
import { handleStormSeed } from "../DarkNet/effects/webstorm";
import { getPasswordType } from "../DarkNet/controllers/ServerGenerator";
import { checkPassword, getAuthResult, isAuthenticated } from "../DarkNet/effects/authentication";
import {
  getLabMaze,
  getPositionInLab,
  getLabyrinthDetails,
  getLabyrinthLocationReport,
  getSurroundingsVisualized,
  isLabyrinthServer,
  labData,
} from "../DarkNet/effects/labyrinth";
import { getPhishingAttackSpeed, handlePhishingAttack } from "../DarkNet/effects/phishing";
import { handleRamBlockRemoved } from "../DarkNet/effects/ramblock";
import {
  expectDarknetAccess,
  expectRunningOnDarknetServer,
  checkDarknetServer,
  getTimeoutChance,
  isDirectConnected,
  logger,
} from "../DarkNet/effects/offlineServerHandling";
import { DarknetServer } from "../Server/DarknetServer";
import { exampleDarknetServerDetails, GenericResponseMessage, ResponseCodeEnum } from "../DarkNet/Enums";
import { getRewardFromCache } from "../DarkNet/effects/cacheFiles";
import { CONSTANTS } from "../Constants";
import { getStasisLinkServers } from "../DarkNet/utils/darknetNetworkUtils";
import { resolveCacheFilePath } from "../Paths/CacheFilePath";
import type { CacheResult } from "@nsdefs";
import { MAX_PASSWORD_LENGTH } from "../DarkNet/Constants";
import { isIPAddress } from "../Types/strings";
import { type DarknetServerData, getDarknetServerOrThrow } from "../DarkNet/utils/darknetServerUtils";
import { shuffle } from "lodash";
import { getSharedChars } from "../DarkNet/utils/darknetAuthUtils";
import { freezeServer } from "../DarkNet/controllers/NetworkMovement";
import { getServerLogs } from "../DarkNet/models/packetSniffing";

type CompleteHeartbleedOptions = {
  peek: boolean;
  logsToCapture: number;
  additionalMsec: number;
};

function heartbleedOptions(ctx: NetscriptContext, opts: unknown): CompleteHeartbleedOptions {
  const defaults = {
    peek: false,
    logsToCapture: 1,
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
  const peek = helpers.boolean(ctx, "options.peek", options.peek);
  const logsToCapture = helpers.positiveInteger(ctx, "options.logsToCapture", options.logsToCapture);
  const additionalMsec = helpers.integer(ctx, "options.additionalMsec", options.additionalMsec);
  if (additionalMsec < 0) {
    throw helpers.errorMessage(
      ctx,
      `Invalid arguments: "options.additionalMsec" (${options.additionalMsec}) must be a non-negative integer`,
    );
  }
  return {
    peek,
    logsToCapture,
    additionalMsec,
  };
}

export function NetscriptDarknet(): InternalAPI<DarknetAPI> {
  return {
    authenticate: (ctx: NetscriptContext, _host, _password, _additionalMsec): Promise<DarknetResult> => {
      const targetHost = helpers.string(ctx, "host", _host);
      const password = helpers.string(ctx, "password", _password);
      const additionalMsec = helpers.number(ctx, "additionalMsec", _additionalMsec ?? 0);
      if (additionalMsec < 0) {
        throw helpers.errorMessage(ctx, `Invalid arguments: "additionalMsec" is not a positive integer`);
      }
      if (password.length > MAX_PASSWORD_LENGTH * 2) {
        // No password will ever be this long, and this prevents extremely long password attempts from causing performance issues,
        // or feedback loops where longer and longer passwords are attempted due to player script bugs.
        throw helpers.errorMessage(
          ctx,
          `Invalid arguments: "password" is too long. Attempted length: ${
            password.length
          }. Attempted password starts with ${password.slice(0, 100)} `,
        );
      }
      const serverCheck = checkDarknetServer(ctx, targetHost, {
        requireDirectConnection: true,
      });
      if (!serverCheck.success) {
        return helpers.netscriptDelay(ctx, 100).then(() => ({
          success: false,
          code: serverCheck.code,
          message: serverCheck.message,
        }));
      }
      const server = serverCheck.server;

      const threads = ctx.workerScript.scriptRef.threads;
      const sharedChars = getSharedChars(server.password, password);
      const networkDelay = calculateAuthenticationTime(server, Player, threads, sharedChars) + additionalMsec;

      logger(ctx)(
        `Connecting to ${server.hostname} with password '${password}'... (Est: ${formatNumber(
          networkDelay / 1000,
          1,
        )}s)`,
      );

      return helpers.netscriptDelay(ctx, networkDelay).then(() => {
        const serverCheck = checkDarknetServer(ctx, targetHost, { requireDirectConnection: true });
        if (!serverCheck.success) {
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            code: serverCheck.code,
            message: serverCheck.message,
          }));
        }

        const server = serverCheck.server;
        // Authentication has a chance to timeout based on darknet instability
        if (Math.random() < getTimeoutChance()) {
          logger(ctx)(`Authentication to ${server.hostname} timed out due to network instability. Please try again.`);
          return {
            success: false,
            code: ResponseCodeEnum.RequestTimeOut,
            message: GenericResponseMessage.RequestTimeOut,
          };
        }

        const authResult = getAuthResult(server, password, threads, networkDelay, ctx.workerScript.pid);
        const success = authResult.result.success;
        const xp = formatNumber(calculatePasswordAttemptChaGain(server, threads, success), 1);
        logger(ctx)(`Authentication on ${server.hostname} ${success ? "succeeded" : "failed"}. (Gained ${xp} cha xp)`);

        if (isLabyrinthServer(server.hostname)) {
          return {
            success: success,
            code: success ? ResponseCodeEnum.Success : ResponseCodeEnum.AuthFailure,
            message: authResult.response.message,
            data: authResult.response.data,
          };
        }

        return {
          success: success,
          code: success ? ResponseCodeEnum.Success : ResponseCodeEnum.AuthFailure,
          message: success ? GenericResponseMessage.Success : GenericResponseMessage.AuthFailure,
        };
      });
    },
    connectToSession: (ctx: NetscriptContext, _host, _password): DarknetResult => {
      const targetHost = helpers.string(ctx, "host", _host);
      const token = helpers.string(ctx, "password", _password);
      if (token.length > 100) {
        throw helpers.errorMessage(
          ctx,
          `Invalid arguments: "password" is too long. Attempted length: ${
            token.length
          }. Attempted password starts with ${token.slice(0, 100)} `,
        );
      }
      const serverCheck = checkDarknetServer(ctx, targetHost, {
        requireAdminRights: true,
      });
      if (!serverCheck.success) {
        return {
          success: false,
          code: serverCheck.code,
          message: serverCheck.message,
        };
      }
      const server = serverCheck.server;

      const result = checkPassword(server, token, ctx.workerScript.scriptRef.threads, ctx.workerScript.pid);
      if (result.code !== ResponseCodeEnum.Success) {
        logger(ctx)(
          `${server.hostname} does not recognise that password. Use ns.dnet.authenticate() to create a session.`,
        );
        return {
          success: false,
          code: ResponseCodeEnum.AuthFailure,
          message: GenericResponseMessage.AuthFailure,
        };
      }
      addSessionToServer(server, ctx.workerScript.pid);
      logger(ctx)(`Authentication on ${server.hostname} succeeded.`);
      return {
        success: true,
        code: ResponseCodeEnum.Success,
        message: GenericResponseMessage.Success,
      };
    },
    freezeServer: (ctx: NetscriptContext, _host) => {
      const targetHost = helpers.string(ctx, "host", _host);
      const serverCheck = checkDarknetServer(ctx, targetHost, {
        requireDirectConnection: true,
      });
      if (!serverCheck.success) {
        return {
          success: false,
          code: serverCheck.code,
          message: serverCheck.message,
        };
      }
      freezeServer(serverCheck.server);
      logger(ctx)(`Froze ${serverCheck.server.hostname}`);
      return {
        success: true,
        code: ResponseCodeEnum.Success,
        message: GenericResponseMessage.Success,
      };
    },
    heartbleed: (ctx: NetscriptContext, _host, _opts): Promise<DarknetResult & { logs: string[] }> => {
      const targetHost = helpers.string(ctx, "host", _host ?? ctx.workerScript.hostname);
      const options = heartbleedOptions(ctx, _opts);
      const serverCheck = checkDarknetServer(ctx, targetHost, {
        requireDirectConnection: true,
      });
      if (!serverCheck.success) {
        return helpers.netscriptDelay(ctx, 100).then(() => ({
          success: false,
          code: serverCheck.code,
          message: serverCheck.message,
          logs: [],
        }));
      }
      const server = serverCheck.server;
      const networkDelay =
        calculateAuthenticationTime(server, Player, ctx.workerScript.scriptRef.threads) * 1.5 +
        (options.additionalMsec ?? 0);
      logger(ctx)(
        `Attempting to extract data from ${server.hostname}... (Est: ${formatNumber(networkDelay / 1000, 1)}s)`,
      );
      DarknetState.hasUsedHeartbleed = true;

      if (Player.skills.charisma < server.requiredCharismaSkill) {
        logger(ctx)(
          `You need a higher charisma level to extract data from ${server.hostname}. (${server.requiredCharismaSkill} required)`,
        );
        return helpers.netscriptDelay(ctx, 100).then(() => ({
          success: false,
          code: ResponseCodeEnum.NotEnoughCharisma,
          message: GenericResponseMessage.NotEnoughCharisma,
          logs: [],
        }));
      }

      return helpers.netscriptDelay(ctx, networkDelay).then(() => {
        const xpGained = Player.mults.charisma_exp * 50 * ((500 + Player.skills.charisma) / 500);
        Player.gainCharismaExp(xpGained);

        const serverCheck = checkDarknetServer(ctx, targetHost, { requireDirectConnection: true });
        if (!serverCheck.success) {
          return {
            success: false,
            code: serverCheck.code,
            message: serverCheck.message,
            logs: [],
          };
        }
        const capturedLogs = getServerLogs(server, options.logsToCapture, options.peek);
        logger(ctx)(`Extracted log data from ${server.hostname}... (Gained ${formatNumber(xpGained, 1)} cha xp)`);

        return {
          success: true,
          code: ResponseCodeEnum.Success,
          message: GenericResponseMessage.Success,
          logs: capturedLogs.map((log) =>
            typeof log.message === "string" ? log.message : JSON.stringify(log.message),
          ),
        };
      });
    },
    openCache: (ctx: NetscriptContext, _fileName, _suppressToast): CacheResult => {
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
      const result = getRewardFromCache(server, fileName, suppressToast);
      logger(ctx)(`Data file ${fileName} opened. ${result.message}.`);
      return result;
    },
    probe: (ctx: NetscriptContext, _returnByIp): string[] => {
      const returnByIP = helpers.boolean(ctx, "returnByIP", _returnByIp ?? false);
      expectDarknetAccess(ctx);
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
      helpers.log(ctx, () => `Returned ${out.length} connections for ${server.hostname}`);
      // The order of results is shuffled. This is to avoid clues to the network structure
      // like there are in the standard network's scan results order.
      return shuffle(out);
    },
    setStasisLink: (ctx: NetscriptContext, _shouldLink): Promise<DarknetResult> => {
      const shouldLink = helpers.boolean(ctx, "shouldLink", _shouldLink ?? true);
      const targetHost = ctx.workerScript.getServer().hostname;
      const serverCheck = checkDarknetServer(ctx, targetHost);
      if (!serverCheck.success) {
        return helpers.netscriptDelay(ctx, 100).then(() => ({
          success: false,
          code: serverCheck.code,
          message: serverCheck.message,
        }));
      }
      const server = serverCheck.server;
      const stasisLinkCount = getStasisLinkServers().length;
      const stasisLinkLimit = getStasisLinkLimit();
      if (shouldLink && stasisLinkCount >= stasisLinkLimit) {
        helpers.log(ctx, () => `Stasis link limit reached. (${stasisLinkCount}/${stasisLinkLimit})`);
        return helpers.netscriptDelay(ctx, 100).then(() => ({
          success: false,
          code: ResponseCodeEnum.StasisLinkLimitReached,
          message: GenericResponseMessage.StasisLinkLimitReached,
        }));
      }
      helpers.log(
        ctx,
        () => `Beginning stasis ${shouldLink ? "" : "removal "}procedure on ${server.hostname}... (Est: 30s)`,
      );
      // setStasisLink's delay is hardcoded at 30s. We should skip this delay in Jest tests.
      return helpers.netscriptDelay(ctx, getSetStasisLinkDuration()).then(() => setStasisLink(ctx, server, shouldLink));
    },
    getStasisLinkLimit: (ctx: NetscriptContext): number => {
      expectDarknetAccess(ctx);
      const limit = getStasisLinkLimit();
      logger(ctx)(`Stasis link limit: ${limit}`);
      return limit;
    },
    getStasisLinkedServers: (ctx: NetscriptContext, _returnByIP): string[] => {
      const returnByIp = helpers.boolean(ctx, "returnByIP", _returnByIP ?? false);
      expectDarknetAccess(ctx);
      const servers = getStasisLinkServers();
      const serverNames = servers.map((s) => (returnByIp ? s.ip : s.hostname));
      logger(ctx)(`Stasis linked servers: ${serverNames}`);
      return serverNames;
    },
    getServerDetails: (ctx, _host) => {
      const targetHost = helpers.string(ctx, "host", _host ?? ctx.workerScript.hostname);
      const serverCheck = checkDarknetServer(ctx, targetHost);
      if (!serverCheck.success) {
        logger(ctx)(serverCheck.message);
        return {
          ...exampleDarknetServerDetails,
          isOnline: false,
        } satisfies ReturnType<DarknetAPI["getServerDetails"]>;
      }
      const targetServer = serverCheck.server;
      const localServer = ctx.workerScript.getServer();
      const isConnected = isDirectConnected(localServer, targetServer);
      const hasSession = isAuthenticated(targetServer, ctx.workerScript.pid);
      const depth = isLabyrinthServer(targetServer.hostname)
        ? labData[targetServer.hostname].depth
        : targetServer.depth;
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
        blockedRam: targetServer.blockedRam,
        difficulty: targetServer.difficulty,
        requiredCharismaSkill: targetServer.requiredCharismaSkill,
        depth: depth,
        isStationary: targetServer.isStationary,
      } satisfies ReturnType<DarknetAPI["getServerDetails"]>;
    },
    induceServerMigration: (ctx, _host): Promise<DarknetResult & { progress: number }> => {
      const targetHost = helpers.string(ctx, "host", _host);
      const currentProgress = DarknetState.migrationInductionServers.get(targetHost) ?? 0;
      const serverCheck = checkDarknetServer(ctx, targetHost, {
        requireDirectConnection: true,
        preventUseOnStationaryServers: true,
      });
      if (!serverCheck.success) {
        return helpers.netscriptDelay(ctx, 100).then(() => ({
          success: false,
          code: serverCheck.code,
          message: serverCheck.message,
          progress: currentProgress,
        }));
      }
      const hostOfCurrentServer = !isIPAddress(targetHost)
        ? ctx.workerScript.hostname
        : getDarknetServerOrThrow(ctx.workerScript.hostname).ip;
      if (targetHost === hostOfCurrentServer) {
        const message = `Cannot induce migration on a script's own server. induceServerMigration must target a neighboring connected server.`;
        logger(ctx)(message);
        return helpers.netscriptDelay(ctx, 100).then(() => ({
          success: false,
          code: ResponseCodeEnum.DirectConnectionRequired,
          message: message,
          progress: currentProgress,
        }));
      }
      const server = serverCheck.server;
      logger(ctx)(`Inducing server migration of ${server.hostname}... (Est: 6s)`);

      // induceServerMigration's delay is hardcoded at 6s. We should skip this delay in Jest tests.
      return helpers.netscriptDelay(ctx, !CONSTANTS.isInTestEnvironment ? 6000 : 0).then(() => {
        const serverCheck = checkDarknetServer(ctx, targetHost, {
          requireDirectConnection: true,
          preventUseOnStationaryServers: true,
        });
        if (!serverCheck.success) {
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            code: serverCheck.code,
            message: serverCheck.message,
            progress: DarknetState.migrationInductionServers.get(targetHost) ?? 0,
          }));
        }
        const server = serverCheck.server;
        const currentDepth = server.depth;
        const result = chargeServerMigration(server, ctx.workerScript.scriptRef.threads);

        logger(ctx)(
          `Induced ${formatNumber(result.chargeIncrease * 100)}%. Migration prep is now at ${formatNumber(
            result.newCharge * 100,
          )}%. (Gained ${formatNumber(result.xpGained)} cha xp)`,
        );
        if (result.newCharge >= 1 && currentDepth < server.depth) {
          logger(ctx)(`${server.hostname} has been migrated!`);
        }
        return {
          success: true,
          code: ResponseCodeEnum.Success,
          message: GenericResponseMessage.Success,
          progress: result.newCharge,
        };
      });
    },
    unleashStormSeed: (ctx): DarknetResult => {
      expectDarknetAccess(ctx);
      const server = ctx.workerScript.getServer();
      const hasStormSeed = server.programs.includes(CompletedProgramName.stormSeed);
      if (!hasStormSeed) {
        const result = `${CompletedProgramName.stormSeed} not found on ${server.hostname}`;
        logger(ctx)(result);
        return {
          success: false,
          code: ResponseCodeEnum.NotFound,
          message: GenericResponseMessage.NotFound,
        };
      }

      const result = `The webstorm has been unleashed...`;
      logger(ctx)(result);
      handleStormSeed(server);
      return {
        success: true,
        code: ResponseCodeEnum.Success,
        message: GenericResponseMessage.Success,
      };
    },
    isDarknetServer: (ctx, _host) => {
      const targetHost = helpers.string(ctx, "host", _host ?? ctx.workerScript.hostname);
      const server = GetServer(targetHost);
      if (!server) {
        return false;
      }
      if (!(server instanceof DarknetServer)) {
        return false;
      }
      return true;
    },
    memoryReallocation: (ctx, _host): Promise<DarknetResult> => {
      const targetHost = helpers.string(ctx, "host", _host ?? ctx.workerScript.hostname);
      const serverCheck = checkDarknetServer(ctx, targetHost, {
        requireDirectConnection: true,
        requireAdminRights: true,
      });
      if (!serverCheck.success) {
        return helpers.netscriptDelay(ctx, 100).then(() => ({
          success: false,
          code: serverCheck.code,
          message: serverCheck.message,
        }));
      }
      const server = serverCheck.server;

      if (server.blockedRam <= 0) {
        logger(ctx)(`Server ${server.hostname} has no host-owned ram left to reallocate.`);
        return helpers.netscriptDelay(ctx, 100).then(() => ({
          success: false,
          code: ResponseCodeEnum.NoBlockRAM,
          message: GenericResponseMessage.NoBlockRAM,
        }));
      }

      logger(ctx)(`Attempting to liberate RAM from '${server.hostname}'s owner ...`);
      const delayTime = Math.max(8000 * (500 / (500 + Player.skills.charisma)), 200);

      return helpers.netscriptDelay(ctx, delayTime).then(() => {
        const serverCheck = checkDarknetServer(ctx, targetHost, {
          requireDirectConnection: true,
          requireAdminRights: true,
        });
        if (!serverCheck.success) {
          return helpers.netscriptDelay(ctx, 100).then(() => ({
            success: false,
            code: serverCheck.code,
            message: serverCheck.message,
          }));
        }
        const server = serverCheck.server;
        if (server.blockedRam <= 0) {
          logger(ctx)(`Server ${server.hostname} has no host-owned ram left to reallocate.`);
          return {
            success: false,
            code: ResponseCodeEnum.NoBlockRAM,
            message: GenericResponseMessage.NoBlockRAM,
          };
        }
        return handleRamBlockRemoved(ctx, server);
      });
    },
    getBlockedRam: (ctx, _host): number => {
      const targetHost = helpers.string(ctx, "host", _host ?? ctx.workerScript.hostname);
      const serverCheck = checkDarknetServer(ctx, targetHost);
      if (!serverCheck.success) {
        return 0;
      }
      return serverCheck.server.blockedRam;
    },
    getDepth: (ctx, _host): number => {
      const targetHost = helpers.string(ctx, "host", _host ?? ctx.workerScript.hostname);
      const serverCheck = checkDarknetServer(ctx, targetHost);
      if (!serverCheck.success) {
        return -1;
      }
      return serverCheck.server.depth;
    },
    promoteStock: (ctx: NetscriptContext, _symbol): Promise<DarknetResult> => {
      if (!Player.hasTixApiAccess) {
        throw helpers.errorMessage(ctx, `You don't have TIX API Access! Cannot use ${ctx.function}()`);
      }
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

        logger(ctx)(`Spread promotion for ${stock.name}. (Gained ${formatNumber(chaXp, 1)} cha xp)`);
        return {
          success: true,
          code: ResponseCodeEnum.Success,
          message: GenericResponseMessage.Success,
        };
      });
    },
    phishingAttack: (ctx: NetscriptContext): Promise<DarknetResult> => {
      const waitTime = getPhishingAttackSpeed();
      const server = expectRunningOnDarknetServer(ctx);
      expectDarknetAccess(ctx);

      return helpers.netscriptDelay(ctx, waitTime).then(() => {
        return handlePhishingAttack(ctx, server);
      });
    },
    getDarknetInstability: (ctx) => {
      expectDarknetAccess(ctx);
      return {
        authenticationDurationMultiplier: getBackdoorAuthTimeDebuff(),
        authenticationTimeoutChance: getTimeoutChance(),
      };
    },
    nextMutation: (ctx) => {
      expectDarknetAccess(ctx);
      return DarknetState.nextMutation;
    },
    getServerRequiredCharismaLevel: (ctx, _host): number => {
      const targetHost = helpers.string(ctx, "host", _host);
      const serverCheck = checkDarknetServer(ctx, targetHost);
      if (!serverCheck.success) {
        return -1;
      }
      return serverCheck.server.requiredCharismaSkill;
    },
    labreport: async (ctx) => {
      expectDarknetAccess(ctx);
      expectRunningOnDarknetServer(ctx);

      const lab = getLabyrinthDetails().lab;
      if (!lab) {
        const status = "You feel lost...";
        logger(ctx)(status);
        return {
          success: false,
          message: status,
        };
      }

      const currentServer = getDarknetServerOrThrow(ctx.workerScript.hostname);
      if (!isDirectConnected(currentServer, lab)) {
        const status = "You feel disconnected...";
        logger(ctx)(status);
        return {
          success: false,
          message: status,
        };
      }

      const pid = ctx.workerScript.pid;
      const authenticationTime = calculateAuthenticationTime(lab, Player, ctx.workerScript.scriptRef.threads);
      await helpers.netscriptDelay(ctx, authenticationTime);

      return getLabyrinthLocationReport(pid);
    },
    labradar: async (ctx) => {
      expectDarknetAccess(ctx);
      expectRunningOnDarknetServer(ctx);

      const lab = getLabyrinthDetails().lab;
      if (!lab) {
        const status = "You feel blind...";
        logger(ctx)(status);
        return {
          success: false,
          message: status,
        };
      }

      const currentServer = getDarknetServerOrThrow(ctx.workerScript.hostname);
      if (!isDirectConnected(currentServer, lab)) {
        const status = "You feel disconnected...";
        logger(ctx)(status);
        return {
          success: false,
          message: status,
        };
      }

      const pid = ctx.workerScript.pid;
      const authenticationTime = calculateAuthenticationTime(lab, Player, ctx.workerScript.scriptRef.threads);
      await helpers.netscriptDelay(ctx, authenticationTime);

      const [x, y] = getPositionInLab(pid);
      return {
        success: true,
        message: getSurroundingsVisualized(getLabMaze(), x, y, 3, true, true),
      };
    },
  };
}

export const getDarknetPropertiesForDeprecationSupport = (dnetServer: DarknetServerData) => ({
  depth: {
    identifier: "ns.getServer().depth",
    message: "Use ns.dnet.getServerDetails().depth instead.",
    value: isLabyrinthServer(dnetServer.hostname) ? labData[dnetServer.hostname].depth : dnetServer.depth,
  },
  modelId: {
    identifier: "ns.getServer().modelId",
    message: "Use ns.dnet.getServerDetails().modelId instead.",
    value: dnetServer.modelId,
  },
  hasStasisLink: {
    identifier: "ns.getServer().hasStasisLink",
    message: "Use ns.dnet.getServerDetails().hasStasisLink instead.",
    value: dnetServer.hasStasisLink,
  },
  blockedRam: {
    identifier: "ns.getServer().blockedRam",
    message: "Use ns.dnet.getServerDetails().blockedRam instead.",
    value: dnetServer.blockedRam,
  },
  staticPasswordHint: {
    identifier: "ns.getServer().staticPasswordHint",
    message: "Use ns.dnet.getServerDetails().staticPasswordHint instead.",
    value: dnetServer.staticPasswordHint,
  },
  passwordHintData: {
    identifier: "ns.getServer().passwordHintData",
    message: "Use ns.dnet.getServerDetails().passwordHintData instead.",
    value: dnetServer.passwordHintData,
  },
  difficulty: {
    identifier: "ns.getServer().difficulty",
    message: "Use ns.dnet.getServerDetails().difficulty instead.",
    value: dnetServer.difficulty,
  },
  requiredCharismaSkill: {
    identifier: "ns.getServer().requiredCharismaSkill",
    message: "Use ns.dnet.getServerDetails().requiredCharismaSkill instead.",
    value: dnetServer.requiredCharismaSkill,
  },
  logTrafficInterval: {
    identifier: "ns.getServer().logTrafficInterval",
    message: "Use ns.dnet.getServerDetails().logTrafficInterval instead.",
    value: dnetServer.logTrafficInterval,
  },
  isStationary: {
    identifier: "ns.getServer().isStationary",
    message: "Use ns.dnet.getServerDetails().isStationary instead.",
    value: dnetServer.isStationary,
  },
});
