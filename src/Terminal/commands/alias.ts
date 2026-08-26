import { Terminal } from "../../Terminal";
import { parseAliasDeclaration, printAliases } from "../../Alias";

export function alias(args: (string | number | boolean)[]): undefined {
  if (args.length === 0) {
    printAliases();
    return;
  }
  if (args[0] === "--all") {
    Terminal.error(`--all 保留用于移除操作`);
    return;
  }
  if (args.length === 1) {
    if (parseAliasDeclaration(args[0] + "")) {
      Terminal.print(`已设置别名 ${args[0]}`);
      return;
    }
  }
  if (args.length === 2) {
    if (args[0] === "-g") {
      if (parseAliasDeclaration(args[1] + "", true)) {
        Terminal.print(`已设置全局别名 ${args[1]}`);
        return;
      }
    }
  }
  Terminal.error('alias 命令用法不正确。用法：alias [-g] [aliasname="value"]');
}
