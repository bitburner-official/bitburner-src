import { Terminal } from "../../Terminal";
import { StdIO } from "../StdIO/StdIO";
import { BaseServer } from "../../Server/BaseServer";

export function expr(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  if (args.length === 0) {
    Terminal.fatal("Incorrect usage of expr command. Usage: expr [math expression]", stdIO);
    return;
  }
  const expr = args.join("");

  // Sanitize the math expression
  const sanitizedExpr = expr.replace(/[^-()\deE/*+.%]/g, "");
  let result: string;
  try {
    result = String(eval?.(sanitizedExpr));
  } catch (e) {
    Terminal.fatal(`Could not evaluate expression: ${sanitizedExpr}. Error: ${e}.`, stdIO);
    return;
  }
  Terminal.print(result, stdIO);
}
