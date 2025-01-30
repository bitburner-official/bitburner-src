import { connectServer } from "../../Server/ServerHelpers";
import { Terminal } from "../../Terminal";
import { Player } from "@player";

export function home(args: (string | number | boolean)[]): void {
  if (args.length !== 0) {
    Terminal.error("Incorrect usage of home command. Usage: home");
    return;
  }
  connectServer(Player.getHomeComputer());
  Terminal.print("Connected to home");
}
