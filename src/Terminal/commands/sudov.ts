import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";

export function sudov(args: (string | number | boolean)[], server: BaseServer): undefined {
  if (args.length !== 0) {
    Terminal.error("参数数量不正确。用法：sudov");
    return;
  }

  if (server.hasAdminRights) {
    Terminal.print("你对这台机器拥有 ROOT 权限");
  } else {
    Terminal.print("你对这台机器没有 root 权限");
  }
}
