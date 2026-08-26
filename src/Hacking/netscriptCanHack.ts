/**
 * Functions used to determine whether the target can be hacked (or grown/weakened).
 * Meant to be used for Netscript implementation
 *
 * The returned status object's message should be used for logging in Netscript
 */
import { IReturnStatus } from "../types";

import { Player } from "@player";
import { Server } from "../Server/Server";

function baseCheck(server: Server, actionName: string): IReturnStatus {
  const hostname = server.hostname;

  if (server.purchasedByPlayer) {
    return {
      res: false,
      msg: `无法对 ${hostname} 服务器执行 ${actionName}，因为这是你自己的服务器`,
    };
  }

  if (!server.hasAdminRights) {
    return {
      res: false,
      msg: `无法对 ${hostname} 服务器执行 ${actionName}，因为你没有 root 权限`,
    };
  }

  return { res: true };
}

export function netscriptCanHack(server: Server, customActionName?: string): IReturnStatus {
  const initialCheck = baseCheck(server, customActionName ?? "hack");
  if (!initialCheck.res) {
    return initialCheck;
  }

  const s = server;
  if (s.requiredHackingSkill > Player.skills.hacking) {
    return {
      res: false,
      msg: `无法入侵 ${server.hostname} 服务器，因为你的黑客技能等级不够`,
    };
  }

  return { res: true };
}

export function netscriptCanGrow(server: Server): IReturnStatus {
  return baseCheck(server, "grow");
}

export function netscriptCanWeaken(server: Server): IReturnStatus {
  return baseCheck(server, "weaken");
}
