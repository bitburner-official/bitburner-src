import { Terminal } from "../../Terminal";

export function home(args: (string | number | boolean)[]): void {
  if (args.length !== 0) {
    Terminal.error("Incorrect usage of home command. Usage: home");
    return;
  }
  Terminal.connectToServer("home");
}
