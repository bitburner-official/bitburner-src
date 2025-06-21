import { Terminal } from "../../Terminal";

export function expr(args: (string | number | boolean)[]): void {
  if (args.length === 0) {
    Terminal.error("Incorrect usage of expr command. Usage: expr [math expression]");
    return;
  }
  const expr = args.join("");

  // Sanitize the math expression
  const sanitizedExpr = expr.replace(/[^-()\deE/*+.%]/g, "");
  let result: string;
  try {
    result = String(eval?.(sanitizedExpr));
  } catch (e) {
    Terminal.error(`Could not evaluate expression: ${sanitizedExpr}. Error: ${e}.`);
    return;
  }
  Terminal.print(result);
}
