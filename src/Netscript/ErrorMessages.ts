import type { WorkerScript } from "./WorkerScript";
import { ScriptDeath } from "./ScriptDeath";
import type { NetscriptContext } from "./APIWrapper";
import { parseStackTrace } from "../utils/StackTraceUtils";

/** Log a message to a script's logs */
export function log(ctx: NetscriptContext, message: () => string) {
  ctx.workerScript.log(ctx.functionPath, message);
}

/** Creates an error message string containing hostname, scriptname, and the error message msg */
export function basicErrorMessage(ws: WorkerScript | ScriptDeath, msg: string, type = "RUNTIME"): string {
  if (!(ws instanceof ScriptDeath)) {
    for (const [scriptUrl, script] of ws.scriptRef.dependencies) {
      msg = msg.replace(new RegExp(scriptUrl, "g"), script.filename);
    }
  }
  return `${type} ERROR\n${ws.name}@${ws.hostname} (PID - ${ws.pid})\n\n${msg}`;
}

/**
 * Creates an error message string with a stack trace.
 *
 * When the player provides invalid input, we try to provide a stack trace that points to the player's invalid caller,
 * but we don't have an error instance with a stack trace. In order to get that stack trace, we create a new error
 * instance, then remove "unrelated" traces (code in our codebase) and leave only traces of the player's code.
 */
export function errorMessage(ctx: NetscriptContext, msg: string, type = "RUNTIME"): string {
  const ws = ctx.workerScript;
  const stackLines = parseStackTrace(new Error(), ws);
  log(ctx, () => msg);
  const caller = ctx.functionPath;
  let rejectMsg = `${caller}: ${msg}`;
  if (stackLines.length !== 0) {
    rejectMsg += `\n\nStack: ${stackLines}`;
  }
  return basicErrorMessage(ws, rejectMsg, type);
}
