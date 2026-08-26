import { Terminal } from "../../Terminal";

export function home(args: (string | number | boolean)[]): undefined {
  if (args.length !== 0) {
    Terminal.error("home 命令用法不正确。用法：home");
    return;
  }
  Terminal.connectToServer("home");
}
