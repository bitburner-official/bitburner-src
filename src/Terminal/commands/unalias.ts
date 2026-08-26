import { Terminal } from "../../Terminal";
import { removeAlias, Aliases, GlobalAliases } from "../../Alias";

export function unalias(args: (string | number | boolean)[]): undefined {
  if (args.length !== 1) {
    Terminal.error("unalias 用法不正确。用法：unalias [alias] 或 unalias --all");
    return;
  } else if (args[0] === "--all") {
    for (const alias of Aliases) {
      if (removeAlias(alias[0] + "")) {
        Terminal.print(`已移除别名 ${alias[0]}`);
      }
    }
    for (const alias of GlobalAliases) {
      if (removeAlias(alias[0] + "")) {
        Terminal.print(`已移除别名 ${alias[0]}`);
      }
    }
  } else if (removeAlias(args[0] + "")) {
    Terminal.print(`已移除别名 ${args[0]}`);
  } else {
    Terminal.error(`不存在此别名：${args[0]}`);
  }
}
