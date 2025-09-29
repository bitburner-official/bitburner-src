import { Terminal } from "../../Terminal";

export function echo(args: (string | number | boolean)[]): void {
  Terminal.print(args.join(" "));
}
