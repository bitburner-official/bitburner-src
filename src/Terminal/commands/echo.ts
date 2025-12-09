import { StdIO } from "../StdIO/StdIO";
import { BaseServer } from "../../Server/BaseServer";

export function echo(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): void {
  stdIO.write(args.join(" "));
  stdIO.close();
}
