import type { NetscriptContext } from "../../Netscript/APIWrapper";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { isAuthenticated } from "./authentication";
import { helpers } from "../../Netscript/NetscriptHelpers";
import { errorMessage } from "../../Netscript/ErrorMessages";
import type { BaseServer } from "../../Server/BaseServer";
import { GetServer } from "../../Server/AllServers";
import { GenericResponseMessage, ResponseCodeEnum } from "../Enums";
import { getAllDarknetServers, getBackdooredDarknetServers } from "../utils/darknetNetworkUtils";
import { hasDarknetAccess } from "../utils/darknetAuthUtils";
import { DarknetServer } from "../../Server/DarknetServer";
import { CompletedProgramName } from "../../Enums";
import type { DarknetResponseCode } from "@nsdefs";
import { isIPAddress } from "../../Types/strings";
import { clampNumber } from "../../utils/helpers/clampNumber";

type CheckDarknetServerOptions = {
  requireAdminRights?: boolean;
  requireSession?: boolean;
  requireDirectConnection?: boolean;
  preventUseOnStationaryServers?: boolean;
  /**
   * If you use this option, the server property in the result object is only guaranteed to be a BaseServer, not a
   * DarknetServer as the result type shows.
   */
  allowNonDarknet?: boolean;
  backdoorBypasses?: boolean;
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

export function checkDarknetServer(
  ctx: NetscriptContext,
  _host: string,
  options: CheckDarknetServerOptions = {},
):
  | { success: true; code: DarknetResponseCode; message: string; server: DarknetServer }
  | { success: false; code: DarknetResponseCode; message: string } {
  const currentServer = ctx.workerScript.getServer();
  const [targetServer, host] = helpers.getServer(ctx, _host);
  if (!targetServer) {
    // Because servers going offline is timing-sensitive, it is outside of
    // player's control. So we don't want to throw for "server does not exist" in this case,
    // despite throwing being the usual doctrine.
    return {
      success: false,
      code: ResponseCodeEnum.ServiceUnavailable,
      message: GenericResponseMessage.ServiceUnavailable,
    };
  }
  const success = {
    success: true,
    code: ResponseCodeEnum.Success,
    message: GenericResponseMessage.Success,
    server: targetServer as DarknetServer,
  } as const;
  if (!(targetServer instanceof DarknetServer)) {
    if (options.allowNonDarknet) {
      // The return is off-shape here: server is of type DarknetServer, but
      // we've explicitly validated that it's only a BaseServer. It's still OK
      // for callers to use this, as long as they are only expecting a BaseServer.
      return success;
    }
    const result = `${host} is not a darknet server.`;
    throw errorMessage(ctx, result);
  }
  // This is down here because we don't require darknet access for using
  // allowNonDarknet APIs on non-darknet servers.
  expectDarknetAccess(ctx);
  if (options.preventUseOnStationaryServers && targetServer.isStationary) {
    const result = `${host} is not a valid target: it is a stationary server.`;
    throw errorMessage(ctx, result);
  }
  if (
    options.requireDirectConnection &&
    !isDirectConnected(currentServer, targetServer) &&
    !(options.backdoorBypasses && targetServer.backdoorInstalled)
  ) {
    let result = `${host} is not connected to the current server ${currentServer.hostname}. It may have moved.`;
    if (options.backdoorBypasses) {
      result += " You can also use a backdoor or stasis link on the target to allow remote access.";
    }
    logger(ctx)(result);
    return {
      success: false,
      code: ResponseCodeEnum.DirectConnectionRequired,
      message: GenericResponseMessage.DirectConnectionRequired,
    };
  }
  if (ctx.workerScript.hostname === targetServer.hostname || targetServer.hostname === SpecialServers.DarkWeb) {
    // We always are authed to ourselves and DarkWeb. Early-out past the last checks.
    return success;
  }
  if (options.requireAdminRights && !targetServer.hasAdminRights) {
    const result = `${host} requires root access. Use ns.dnet.authenticate() to gain access.`;
    logger(ctx)(result);
    return {
      success: false,
      code: ResponseCodeEnum.AuthFailure,
      message: GenericResponseMessage.AuthFailure,
    };
  }
  if (
    options.requireSession &&
    host !== (!isIPAddress(host) ? currentServer.hostname : currentServer.ip) &&
    !isAuthenticated(targetServer, ctx.workerScript.pid)
  ) {
    const result = `${host} requires a session to do that. Use ns.dnet.connectToSession() first to authenticate with that server.`;
    logger(ctx)(result);
    return {
      success: false,
      code: ResponseCodeEnum.AuthFailure,
      message: GenericResponseMessage.AuthFailure,
    };
  }

  return success;
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

// Having frozen servers, or more than two backdoored servers, increases darknet instability.
export function getTimeoutChance() {
  const backdooredDarknetServerCount = getBackdooredDarknetServers().length;
  const frozenServers = getAllDarknetServers().filter((s) => !s.maxRam).length;
  const serversAddingToInstability = frozenServers + Math.max(backdooredDarknetServerCount - 2, 0);
  return clampNumber(serversAddingToInstability * 0.03, 0, 0.5);
}
