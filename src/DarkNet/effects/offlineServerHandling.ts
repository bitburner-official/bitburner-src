import type { NetscriptContext } from "../../Netscript/APIWrapper";
import { getBackdooredDarkwebServers, getServerSafely } from "../controllers/NetworkMovement";
import { ResponseStatus } from "../models/DarknetServerData";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { hasDarknetAccess, isDarknetServer } from "./effects";
import { isAuthenticated } from "./authentication";
import { getServer, helpers } from "../../Netscript/NetscriptHelpers";
import { errorMessage } from "../../Netscript/ErrorMessages";
import { BaseServer } from "../../Server/BaseServer";

type failureResultOptions = {
  requireDarknet?: boolean;
  requireSession?: boolean;
  requireDirectConnection?: boolean;
  preventDarkweb?: boolean;
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
  const targetServer = getServerSafely(hostname);
  if (!targetServer) {
    const result = `Target server ${hostname} does not exist. It may have gone offline.`;
    logger(ctx)(result);
    return {
      success: false,
      message: ResponseStatus.NOT_FOUND,
    };
  }
  if (options.preventDarkweb && targetServer.hostname === SpecialServers.DarkWeb) {
    const result = `${targetServer.hostname} is not a valid target.`;
    logger(ctx)(result);
    return {
      success: false,
      message: ResponseStatus.I_AM_A_TEAPOT,
    };
  }
  if (options.requireDarknet && !isDarknetServer(targetServer) && hostname !== SpecialServers.DarkWeb) {
    const result = `${targetServer.hostname} is not a darknet server.`;
    logger(ctx)(result);
    return {
      success: false,
      message: ResponseStatus.I_AM_A_TEAPOT,
    };
  }
  if (options.requireDirectConnection && !isDirectConnected(currentServer, targetServer)) {
    const result = `${targetServer.hostname} is not connected to the current server ${currentServer.hostname}. It may have moved.`;
    logger(ctx)(result);
    return {
      success: false,
      message: ResponseStatus.MOVED_PERMANENTLY,
    };
  }
  if (options.requireSession && !targetServer.hasAdminRights) {
    const result = `${targetServer.hostname} requires root access. Use ns.dnet.authenticate() to gain access.`;
    logger(ctx)(result);
    return {
      success: false,
      message: ResponseStatus.AUTH_FAILURE,
    };
  }
  if (options.requireSession && !isAuthenticated(targetServer, ctx.workerScript.pid)) {
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
  const targetServer = getServer(ctx, hostname);
  if (!isDarknetServer(targetServer) && targetServer.hostname != SpecialServers.DarkWeb) {
    throw new Error(`Target server ${hostname} is not a darknet server`);
  }
  return targetServer;
}

export function expectAuthenticated(ctx: NetscriptContext, server: BaseServer) {
  if (!isDarknetServer(server) || ctx.workerScript.hostname === server.hostname) {
    return;
  }
  if (!server.hasAdminRights) {
    throw new Error(`Server ${server.hostname} is password-protected. use ns.dnet.authenticate() to gain access.`);
  }
  if (!isAuthenticated(server, ctx.workerScript.pid)) {
    throw new Error(
      `${ctx.function}: Server ${server.hostname} requires a session to do that. Use ns.dnet.connectToSession() first to authenticate with that server.`,
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

export function expectPassword(ctx: NetscriptContext, hostname: string, _password: unknown) {
  if (ctx.workerScript.hostname !== hostname) {
    return helpers.string(ctx, "password", _password);
  }
  const server = getServerSafely(hostname);
  if (!server || !isDarknetServer(server)) {
    return "";
  }

  return server.darknetData.password;
}

export function getTimeoutChance() {
  const backdooredDarknetServerCount = getBackdooredDarkwebServers().length - 2;
  return Math.max(Math.min(backdooredDarknetServerCount * 0.03, 0.5), 0);
}
