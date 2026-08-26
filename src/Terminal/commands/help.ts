import { Terminal } from "../../Terminal";
import { TerminalHelpText, HelpTexts } from "../HelpText";

export function help(args: (string | number | boolean)[]): undefined {
  if (args.length !== 0 && args.length !== 1) {
    Terminal.error("help 命令用法不正确。用法：help");
    return;
  }
  if (args.length === 0) {
    TerminalHelpText.forEach((line) => Terminal.print(line));
  } else {
    const cmd = args[0] + "";
    const txt = HelpTexts[cmd];
    if (txt == null) {
      Terminal.error("没有匹配 '" + cmd + "' 的帮助主题");
      return;
    }
    txt.forEach((t) => Terminal.print(t));
  }
}
