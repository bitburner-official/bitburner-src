import { BaseServer } from "../../Server/BaseServer";
import { Terminal } from "../../Terminal";

export function rm(args: (string | number | boolean)[], server: BaseServer): void {
  if (args.length !== 1) return Terminal.error("Incorrect number of arguments. Usage: rm [program/script]");
  const delTarget = Terminal.getFilepath(args[0] + "");
  if (!delTarget) return Terminal.error(`Invalid filename: ${args[0]}`);
  const status = server.removeFile(delTarget);
  if (!status.res && status.msg) Terminal.error(status.msg);
}
