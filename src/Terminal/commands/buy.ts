import { Terminal } from "../../Terminal";
import { Player } from "@player";
import { listAllDarkwebItems, buyAllDarkwebItems, buyDarkwebItem } from "../../DarkWeb/DarkWeb";

export function buy(args: (string | number | boolean)[]): undefined {
  if (!Player.hasTorRouter()) {
    Terminal.error(
      `你需要能够连接到暗网才能使用 "buy" 命令。（也许你可以在什么地方买到 TOR 路由器）`,
    );
    return;
  }
  if (args.length != 1) {
    Terminal.print("参数数量不正确。用法：");
    Terminal.print("buy -l");
    Terminal.print("buy -a");
    Terminal.print("buy [item name]");
    return;
  }
  const arg = args[0] + "";
  if (arg == "-l" || arg == "-1" || arg == "--list") listAllDarkwebItems();
  else if (arg == "-a" || arg == "--all") buyAllDarkwebItems();
  else buyDarkwebItem(arg);
}
