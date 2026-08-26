import { Terminal } from "../../Terminal";

export function expr(args: (string | number | boolean)[]): undefined {
  if (args.length === 0) {
    Terminal.error("expr 命令用法不正确。用法：expr [math expression]");
    return;
  }
  const expr = args.join("");

  // Sanitize the math expression
  const sanitizedExpr = expr.replace(/[^-()\deE/*+.%]/g, "");
  let result: string;
  try {
    result = String(eval?.(sanitizedExpr));
  } catch (e) {
    Terminal.error(`无法计算表达式：${sanitizedExpr}。错误：${e}。`);
    return;
  }
  Terminal.print(result);
}
