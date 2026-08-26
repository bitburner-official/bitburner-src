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
    throw helpers.errorMessage(ctx, `无效参数："options" 不是对象`);
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
      `无效参数："options.additionalMsec" (${options.additionalMsec}) 必须是非负整数`,
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
        throw helpers.errorMessage(ctx, `无效参数："additionalMsec" 不是正整数`);
      }
      if (password.length > MAX_PASSWORD_LENGTH * 2) {
        // No password will ever be this long, and this prevents extremely long password attempts from causing performance issues,
        // or feedback loops where longer and longer passwords are attempted due to player script bugs.
        throw helpers.errorMessage(
          ctx,
          `无效参数："password" 过长。尝试的长度：${
            password.length
          }。尝试的密码开头为 ${password.slice(0, 100)} `,
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
        `正在使用密码 '${password}' 连接到 ${server.hostname}...（预计：${formatNumber(
          networkDelay / 1000,
          1,
        )}s）`,
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
          logger(ctx)(`由于网络不稳定，到 ${server.hostname} 的身份验证超时。请重试。`);
          return {
            success: false,
            code: ResponseCodeEnum.RequestTimeOut,
            message: GenericResponseMessage.RequestTimeOut,
          };
        }

        const authResult = getAuthResult(server, password, threads, networkDelay, ctx.workerScript.pid);
        const success = authResult.result.success;
        const xp = formatNumber(calculatePasswordAttemptChaGain(server, threads, success), 1);
        logger(ctx)(`${server.hostname} 上的身份验证${success ? "成功" : "失败"}。（获得 ${xp} 魅力经验）`);

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
          `无效参数："password" 过长。尝试的长度：${
            token.length
          }。尝试的密码开头为 ${token.slice(0, 100)} `,
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
          `${server.hostname} 无法识别该密码。请使用 ns.dnet.authenticate() 创建会话。`,
        );
        return {
          success: false,
          code: ResponseCodeEnum.AuthFailure,
          message: GenericResponseMessage.AuthFailure,
        };
      }
      addSessionToServer(server, ctx.workerScript.pid);
      logger(ctx)(`${server.hostname} 上的身份验证成功。`);
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
      logger(ctx)(`已冻结 ${serverCheck.server.hostname}`);
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
        `正在尝试从 ${server.hostname} 提取数据...（预计：${formatNumber(networkDelay / 1000, 1)}s）`,
      );
      DarknetState.hasUsedHeartbleed = true;

      if (Player.skills.charisma < server.requiredCharismaSkill) {
        logger(ctx)(
          `你需要更高的魅力等级才能从 ${server.hostname} 提取数据。（需要 ${server.requiredCharismaSkill}）`,
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
        logger(ctx)(`已从 ${server.hostname} 提取日志数据...（获得 ${formatNumber(xpGained, 1)} 魅力经验）`);

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
        throw helpers.errorMessage(ctx, `无效的缓存文件。（文件必须以 .cache 结尾）：${fileName}`);
      }
      const hasCacheFile = server.caches.includes(path);
      if (!hasCacheFile) {
        throw helpers.errorMessage(ctx, `找不到缓存文件：${fileName}（服务器 ${server.hostname}）`);
      }

      server.caches = server.caches.filter((cache) => cache !== fileName);
      const result = getRewardFromCache(server, fileName, suppressToast);
      logger(ctx)(`数据文件 ${fileName} 已打开。${result.message}。`);
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
      helpers.log(ctx, () => `为 ${server.hostname} 返回了 ${out.length} 个连接`);
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
        helpers.log(ctx, () => `已达到滞留链路上限。（${stasisLinkCount}/${stasisLinkLimit}）`);
        return helpers.netscriptDelay(ctx, 100).then(() => ({
          success: false,
          code: ResponseCodeEnum.StasisLinkLimitReached,
          message: GenericResponseMessage.StasisLinkLimitReached,
        }));
      }
      helpers.log(
        ctx,
        () => `正在 ${server.hostname} 上开始滞留${shouldLink ? "" : "解除"}程序...（预计：30s）`,
      );
      // setStasisLink's delay is hardcoded at 30s. We should skip this delay in Jest tests.
      return helpers.netscriptDelay(ctx, getSetStasisLinkDuration()).then(() => setStasisLink(ctx, server, shouldLink));
    },
    getStasisLinkLimit: (ctx: NetscriptContext): number => {
      expectDarknetAccess(ctx);
      const limit = getStasisLinkLimit();
      logger(ctx)(`滞留链路上限：${limit}`);
      return limit;
    },
    getStasisLinkedServers: (ctx: NetscriptContext, _returnByIP): string[] => {
      const returnByIp = helpers.boolean(ctx, "returnByIP", _returnByIP ?? false);
      expectDarknetAccess(ctx);
      const servers = getStasisLinkServers();
      const serverNames = servers.map((s) => (returnByIp ? s.ip : s.hostname));
      logger(ctx)(`已建立滞留链路的服务器：${serverNames}`);
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
        const message = `无法在脚本所在的服务器上引发迁移。induceServerMigration 必须以相邻的已连接服务器为目标。`;
        logger(ctx)(message);
        return helpers.netscriptDelay(ctx, 100).then(() => ({
          success: false,
          code: ResponseCodeEnum.DirectConnectionRequired,
          message: message,
          progress: currentProgress,
        }));
      }
      const server = serverCheck.server;
      logger(ctx)(`正在引发 ${server.hostname} 的服务器迁移...（预计：6s）`);

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
          `已引发 ${formatNumber(result.chargeIncrease * 100)}%。迁移准备现在为 ${formatNumber(
            result.newCharge * 100,
          )}%。（获得 ${formatNumber(result.xpGained)} 魅力经验）`,
        );
        if (result.newCharge >= 1 && currentDepth < server.depth) {
          logger(ctx)(`${server.hostname} 已完成迁移！`);
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
        const result = `在 ${server.hostname} 上未找到 ${CompletedProgramName.stormSeed}`;
        logger(ctx)(result);
        return {
          success: false,
          code: ResponseCodeEnum.NotFound,
          message: GenericResponseMessage.NotFound,
        };
      }

      const result = `网络风暴已被释放...`;
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
        logger(ctx)(`服务器 ${server.hostname} 没有可重新分配的主机占用 RAM。`);
        return helpers.netscriptDelay(ctx, 100).then(() => ({
          success: false,
          code: ResponseCodeEnum.NoBlockRAM,
          message: GenericResponseMessage.NoBlockRAM,
        }));
      }

      logger(ctx)(`正在尝试从 '${server.hostname}' 的所有者那里夺取 RAM...`);
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
          logger(ctx)(`服务器 ${server.hostname} 没有可重新分配的主机占用 RAM。`);
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
        throw helpers.errorMessage(ctx, `你没有 TIX API 权限！无法使用 ${ctx.function}()`);
      }
      const symbol = helpers.string(ctx, "symbol", _symbol);
      const stock = getStockFromSymbol(ctx, symbol);
      expectRunningOnDarknetServer(ctx);
      expectDarknetAccess(ctx);

      const waitTime = Math.max(8000 * (600 / (600 + Player.skills.charisma)), 200);
      logger(ctx)(
        `散布 ${stock.name} 股票宣传以提升波动性...（预计：${formatNumber(waitTime / 1000, 1)}s）`,
      );

      return helpers.netscriptDelay(ctx, waitTime).then(() => {
        const threads = ctx.workerScript.scriptRef.threads;
        const promotionAmount = threads * ((500 + Player.skills.charisma) / 500);
        DarknetState.stockPromotions[symbol] = (DarknetState.stockPromotions[symbol] ?? 0) + promotionAmount;

        const chaXp = Player.mults.charisma_exp * threads * 10 * ((200 + Player.skills.charisma) / 200);
        Player.gainCharismaExp(chaXp);

        logger(ctx)(`已为 ${stock.name} 散布宣传。（获得 ${formatNumber(chaXp, 1)} 魅力经验）`);
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
        const status = "你感到迷茫...";
        logger(ctx)(status);
        return {
          success: false,
          message: status,
        };
      }

      const currentServer = getDarknetServerOrThrow(ctx.workerScript.hostname);
      if (!isDirectConnected(currentServer, lab)) {
        const status = "你感到断连...";
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
        const status = "你感到一片漆黑...";
        logger(ctx)(status);
        return {
          success: false,
          message: status,
        };
      }

      const currentServer = getDarknetServerOrThrow(ctx.workerScript.hostname);
      if (!isDirectConnected(currentServer, lab)) {
        const status = "你感到断连...";
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
