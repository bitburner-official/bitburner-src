import { Terminal } from "../../Terminal";
import { Player } from "@player";
import { listAllDarkwebItems, buyAllDarkwebItems, buyDarkwebItem } from "../../DarkWeb/DarkWeb";
import { StdIO } from "../StdIO/StdIO";
import { BaseServer } from "../../Server/BaseServer";

export function buy(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  if (!Player.hasTorRouter()) {
    Terminal.fatal(
      `You need to be able to connect to the Dark Web to use the "buy" command. (Maybe there's a TOR router you can buy somewhere)`,
      stdIO,
    );
    return;
  }
  if (args.length != 1) {
    Terminal.print("Incorrect number of arguments. Usage: ", stdIO);
    Terminal.print("buy -l", stdIO);
    Terminal.print("buy -a", stdIO);
    Terminal.print("buy [item name]", stdIO);
    return;
  }
  const arg = args[0] + "";
  if (arg == "-l" || arg == "-1" || arg == "--list") listAllDarkwebItems(stdIO);
  else if (arg == "-a" || arg == "--all") buyAllDarkwebItems(stdIO);
  else buyDarkwebItem(arg, stdIO);
}
