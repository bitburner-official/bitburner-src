import type { WorkerScript } from "./WorkerScript";
import type { NetscriptContext } from "./APIWrapper";
import { assertString } from "../utils/TypeAssertion";

// This is a *static* property of the Error class, so it applies *globally* to all
// Errors. It also is non-standard, so it doesn't work on Firefox/SpiderMonkery
// (which always includes all frames in the stack trace, at the time of this comment.)
// On Chromium/V8 and Safari/JavaScriptCore, this sets a limit on the number of frames
// returned in a stack trace. V8 defaults to 10, which is normally a reasonable default,
// but scripts which end up calling errorMessage() the start of the user's code may be 7
// or more frames down, so we expand the limit to ensure that all the user's stack
// frames are (reasonably sure to be) in the trace.
Error.stackTraceLimit = 20;

// The last/first line in a stacktrace that is non-user code. These bracket the "user code"
// part of a stack trace, allowing us to trim out the platform-code noise.
//
// Currently, this means the wrappedFunction within APIWrapper, and startNetscript2Script().
// We take advantage of the fact that, although different browsers will render these
// differently (and different builds will have wildly different line numbers), within a
// *single* run these will always be *exactly* the same strings.
let topStackLine = undefined as string | undefined;
let bottomStackLine = undefined as string | undefined;

export function setupStackBoundaries(funcName: unknown) {
  if (topStackLine && bottomStackLine) return;
  const err = new Error("Couldn't get stack trace");
  if (err.stack === undefined) throw err;
  assertString(funcName);
  const stack = err.stack.split("\n");
  const lineIdx = stack.findIndex((x) => x.includes(funcName));
  if (lineIdx < 0) {
    throw new Error(`Couldn't find stack frame for ${funcName}`);
  }
  // Our custom user script has exactly two frames. See runErrorStackScript().
  topStackLine = stack[lineIdx - 1];
  bottomStackLine = stack[lineIdx + 2];
}

/** Log a message to a script's logs */
export function log(ctx: NetscriptContext, message: () => string) {
  ctx.workerScript.log(ctx.functionPath, message);
}

/** Creates an error message string containing hostname, scriptname, and the error message msg */
export function basicErrorMessage(ws: WorkerScript, msg: string, type = "RUNTIME"): string {
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
  const errstack = new Error().stack;
  if (errstack === undefined) throw new Error("how did we not throw an error?");
  const stack = errstack.split("\n").slice(1);
  const ws = ctx.workerScript;
  const caller = ctx.functionPath;
  // indexOf will return -1 if we search for undefined
  const topIdx = stack.indexOf(topStackLine as string);
  const bottomIdx = stack.indexOf(bottomStackLine as string);
  // -1 of "not found" becomes 0 of "use whole trace" for topIdx
  const userstack = stack.slice(topIdx + 1, bottomIdx >= 0 ? bottomIdx : undefined);

  log(ctx, () => msg);
  let rejectMsg = `${caller}: ${msg}`;
  if (userstack.length !== 0) rejectMsg += `\n\nStack:\n${userstack.join("\n")}`;
  return basicErrorMessage(ws, rejectMsg, type);
}
