import type { NetscriptContext } from "../../Netscript/APIWrapper";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { isAuthenticated } from "./authentication";
import { helpers } from "../../Netscript/NetscriptHelpers";
import { errorMessage } from "../../Netscript/ErrorMessages";
import { BaseServer } from "../../Server/BaseServer";
import { GetServer } from "../../Server/AllServers";
import { DarknetState } from "../models/DarknetState";
import { ResponseStatus } from "../Enums";
import { getBackdooredDarkwebServers } from "../utils/darknetNetworkUtils";
import { getDarknetData, isDarknetServer } from "../utils/darknetServerUtils";
import { hasDarknetAccess } from "../utils/darknetAuthUtils";

type failureResultOptions = {
  requireDarknet?: boolean;
  requireAdminRights?: boolean;
  requireSession?: boolean;
  requireDirectConnection?: boolean;
  preventUseOnImmobileServers?: boolean;
};

export const logger = (ctx: NetscriptContext) => (message: string) => helpers.log(ctx, () => message);
export const error =
  (ctx: NetscriptContext) =>
  (message: string): never => {
    throw errorMessage(ctx, message);
  };

export function expectDarknetAccess(ctx: NetscriptContext) {
  if (!hasDarknetAccess()) {
    error(ctx)(
      `You do not have access to the dnet api. Purchase "DarkscapeNavigator.exe" through your tor router to unlock it.`,
    );
  }
}

export function getFailureResult(ctx: NetscriptContext, hostname: string, options: failureResultOptions = {}) {
  expectDarknetAccess(ctx);
  const currentServer = ctx.workerScript.getServer();
  const targetServer = GetServer(hostname);
  if (!targetServer && DarknetState.offlineServers.includes(hostname)) {
    const result = `Target server ${hostname} is offline.`;
    logger(ctx)(result);
    return {
      success: false,
      message: ResponseStatus.NOT_FOUND,
    };
  }
  if (!targetServer) {
    const result = `Target server ${hostname} does not exist. It may have gone offline.`;
    logger(ctx)(result);
    return {
      success: false,
      message: ResponseStatus.NOT_FOUND,
    };
  }
  if (options.preventUseOnImmobileServers && getDarknetData(targetServer)?.isMobile == false) {
    const result = `${targetServer.hostname} is not a valid target: it is a stationary server.`;
    error(ctx)(result);
  }
  if (options.requireDarknet && !isDarknetServer(targetServer)) {
    const result = `${targetServer.hostname} is not a darknet server.`;
    error(ctx)(result);
  }
  if (options.requireDirectConnection && !isDirectConnected(currentServer, targetServer)) {
    const result = `${targetServer.hostname} is not connected to the current server ${currentServer.hostname}. It may have moved.`;
    logger(ctx)(result);
    return {
      success: false,
      message: ResponseStatus.MOVED_PERMANENTLY,
    };
  }
  if ((options.requireSession || options.requireAdminRights) && !targetServer.hasAdminRights) {
    const result = `${targetServer.hostname} requires root access. Use ns.dnet.authenticate() to gain access.`;
    logger(ctx)(result);
    return {
      success: false,
      message: ResponseStatus.AUTH_FAILURE,
    };
  }
  if (
    options.requireSession &&
    hostname !== targetServer.hostname &&
    !isAuthenticated(targetServer, ctx.workerScript.pid)
  ) {
    const result = `${targetServer.hostname} requires a session to do that. Use ns.dnet.connectToSession() first to authenticate with that server.`;
    logger(ctx)(result);
    return {
      success: false,
      message: ResponseStatus.AUTH_FAILURE,
    };
  }

  return {
    success: true,
    message: "",
  };
}

export const isDirectConnected = (currentServer: BaseServer, targetServer: BaseServer): boolean =>
  currentServer.serversOnNetwork.includes(targetServer.hostname) || currentServer.hostname === targetServer.hostname;

export function expectDarknetServer(ctx: NetscriptContext, hostname: string) {
  const targetServer = GetServer(hostname);
  if (!isDarknetServer(targetServer)) {
    throw new Error(`${hostname} is not a darknet server`);
  }
  return targetServer;
}

export function expectAuthenticated(ctx: NetscriptContext, server: BaseServer) {
  if (
    !isDarknetServer(server) ||
    ctx.workerScript.hostname === server.hostname ||
    server.hostname === SpecialServers.DarkWeb
  ) {
    return;
  }
  if (!server.hasAdminRights) {
    throw new Error(
      `[${ctx.function}] Server ${server.hostname} is password-protected. Use ns.dnet.authenticate() to gain access before running ${ctx.function}.`,
    );
  }
  if (!isAuthenticated(server, ctx.workerScript.pid)) {
    throw new Error(
      `[${ctx.function}] Server ${server.hostname} requires a session to be targeted with ${ctx.function}. Use ns.dnet.connectToSession() first to authenticate with that server.`,
    );
  }
}

export function hasExecConnection(ctx: NetscriptContext, targetServer: BaseServer) {
  if (!isDarknetServer(targetServer)) return true;
  expectAuthenticated(ctx, targetServer);
  const directConnected = isDirectConnected(ctx.workerScript.getServer(), targetServer);
  const backdoored = targetServer.backdoorInstalled;
  return directConnected || backdoored;
}

export function getTimeoutChance() {
  const backdooredDarknetServerCount = getBackdooredDarkwebServers().length - 2;
  return Math.max(Math.min(backdooredDarknetServerCount * 0.03, 0.5), 0);
}
