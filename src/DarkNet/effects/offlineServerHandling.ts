import type { NetscriptContext } from "../../Netscript/APIWrapper";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { isAuthenticated } from "./authentication";
import { helpers } from "../../Netscript/NetscriptHelpers";
import { errorMessage } from "../../Netscript/ErrorMessages";
import type { BaseServer } from "../../Server/BaseServer";
import { GetServer } from "../../Server/AllServers";
import { DarknetState } from "../models/DarknetState";
import { GenericResponseMessage, ResponseCodeEnum } from "../Enums";
import { getBackdooredDarkwebServers } from "../utils/darknetNetworkUtils";
import { hasDarknetAccess } from "../utils/darknetAuthUtils";
import { DarknetServer } from "../../Server/DarknetServer";
import { CompletedProgramName } from "../../Enums";
import type { DarknetResponseCode } from "@nsdefs";

type FailureResultOptions = {
  requireAdminRights?: boolean;
  requireSession?: boolean;
  requireDirectConnection?: boolean;
  preventUseOnStationaryServers?: boolean;
};

export const logger = (ctx: NetscriptContext) => (message: string) => helpers.log(ctx, () => message);

export function expectDarknetAccess(ctx: NetscriptContext): void {
  if (!hasDarknetAccess()) {
    throw errorMessage(
      ctx,
      `You do not have access to the dnet api. Purchase "${CompletedProgramName.darkscape}" through your TOR router to unlock it.`,
    );
  }
}

export function getFailureResult(
  ctx: NetscriptContext,
  hostname: string,
  options: FailureResultOptions = {},
):
  | { success: true; code: DarknetResponseCode; message: string; server: DarknetServer }
  | { success: false; code: DarknetResponseCode; message: string } {
  expectDarknetAccess(ctx);
  const currentServer = ctx.workerScript.getServer();
  const targetServer = GetServer(hostname);
  // If the target server does not exist
  if (!targetServer) {
    if (DarknetState.offlineServers.includes(hostname)) {
      // If the server is offline, return a dummy object with isOnline = false.
      const result = `Target server ${hostname} is offline.`;
      logger(ctx)(result);
      return {
        success: false,
        code: ResponseCodeEnum.ServiceUnavailable,
        message: GenericResponseMessage.ServiceUnavailable,
      };
    } else {
      // Throw, otherwise.
      const result = `Target server ${hostname} does not exist. It may have gone offline.`;
      throw errorMessage(ctx, result);
    }
  }
  if (!(targetServer instanceof DarknetServer)) {
    const result = `${targetServer.hostname} is not a darknet server.`;
    throw errorMessage(ctx, result);
  }
  if (options.preventUseOnStationaryServers && targetServer.isStationary) {
    const result = `${targetServer.hostname} is not a valid target: it is a stationary server.`;
    throw errorMessage(ctx, result);
  }
  if (options.requireDirectConnection && !isDirectConnected(currentServer, targetServer)) {
    const result = `${targetServer.hostname} is not connected to the current server ${currentServer.hostname}. It may have moved.`;
    logger(ctx)(result);
    return {
      success: false,
      code: ResponseCodeEnum.DirectConnectionRequired,
      message: GenericResponseMessage.DirectConnectionRequired,
    };
  }
  if ((options.requireSession || options.requireAdminRights) && !targetServer.hasAdminRights) {
    const result = `${targetServer.hostname} requires root access. Use ns.dnet.authenticate() to gain access.`;
    logger(ctx)(result);
    return {
      success: false,
      code: ResponseCodeEnum.AuthFailure,
      message: GenericResponseMessage.AuthFailure,
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
      code: ResponseCodeEnum.AuthFailure,
      message: GenericResponseMessage.AuthFailure,
    };
  }

  return {
    success: true,
    code: ResponseCodeEnum.Success,
    message: GenericResponseMessage.Success,
    server: targetServer,
  };
}

export const isDirectConnected = (currentServer: BaseServer, targetServer: DarknetServer): boolean =>
  currentServer.serversOnNetwork.includes(targetServer.hostname) || currentServer.hostname === targetServer.hostname;

/**
 * This function should only be used to check if the script is running on a darknet server.
 *
 * Note that this function only checks the server with a simple check of "instanceof". It does not handle the offline
 * cases like getFailureResult does. This is intentional. When a server goes offline, all scripts are killed. After
 * that, accessing NS APIs will throw the ScriptDeath error, so there is no way this function can be called.
 */
export function expectRunningOnDarknetServer(ctx: NetscriptContext): DarknetServer {
  const hostname = ctx.workerScript.hostname;
  const server = GetServer(hostname);
  if (!(server instanceof DarknetServer)) {
    throw errorMessage(
      ctx,
      `This API can only be used on a darknet server, but it was called by ${ctx.workerScript.name} (PID: ` +
        `${ctx.workerScript.pid}) on ${hostname}.`,
    );
  }
  return server;
}

export function expectAuthenticated(ctx: NetscriptContext, server: DarknetServer) {
  /**
   * Some non-dnet APIs (e.g., scp, exec) requires a session. We make darkweb an exception, so the player can interact
   * with it without buying DarkscapeNavigator.exe.
   */
  if (ctx.workerScript.hostname === server.hostname || server.hostname === SpecialServers.DarkWeb) {
    return;
  }
  if (!server.hasAdminRights) {
    throw errorMessage(
      ctx,
      `[${ctx.function}] Server ${server.hostname} is password-protected. Use ns.dnet.authenticate() to gain access before running ${ctx.function}.`,
    );
  }
  if (!isAuthenticated(server, ctx.workerScript.pid)) {
    throw errorMessage(
      ctx,
      `[${ctx.function}] Server ${server.hostname} requires a session to be targeted with ${ctx.function}. Use ns.dnet.connectToSession() first to authenticate with that server.`,
    );
  }
}

/**
 * This function checks if the target server has a session and a direct connection (serversOnNetwork, stasis link,
 * backdoor) to the running script's server.
 */
export function hasExecConnection(ctx: NetscriptContext, targetServer: DarknetServer) {
  expectAuthenticated(ctx, targetServer);
  const directConnected = isDirectConnected(ctx.workerScript.getServer(), targetServer);
  const backdoored = targetServer.backdoorInstalled;
  return directConnected || backdoored;
}

export function getTimeoutChance() {
  const backdooredDarknetServerCount = getBackdooredDarkwebServers().length - 2;
  return Math.max(Math.min(backdooredDarknetServerCount * 0.03, 0.5), 0);
}
