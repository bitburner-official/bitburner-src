import type { WorkerScript } from "./WorkerScript";
import { ScriptDeath } from "./ScriptDeath";
import type { NetscriptContext } from "./APIWrapper";
import { dialogBoxCreate } from "../ui/React/DialogBox";

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

/** Creates an error message string with a stack trace. */
export function errorMessage(ctx: NetscriptContext, msg: string, type = "RUNTIME"): string {
  const errstack = new Error().stack;
  if (errstack === undefined) throw new Error("how did we not throw an error?");
  const stack = errstack.split("\n").slice(1);
  const ws = ctx.workerScript;
  const caller = ctx.functionPath;
  const userstack = [];
  for (const stackline of stack) {
    const filename = (() => {
      // Check urls for dependencies
      for (const [url, script] of ws.scriptRef.dependencies) if (stackline.includes(url)) return script.filename;
      // Check for filenames directly if no URL found
      if (stackline.includes(ws.scriptRef.filename)) return ws.scriptRef.filename;
      for (const script of ws.scriptRef.dependencies.values()) {
        if (stackline.includes(script.filename)) return script.filename;
      }
    })();
    if (!filename) continue;

    let call = { line: "-1", func: "unknown" };
    const chromeCall = parseChromeStackline(stackline);
    if (chromeCall) {
      call = chromeCall;
    }

    const firefoxCall = parseFirefoxStackline(stackline);
    if (firefoxCall) {
      call = firefoxCall;
    }

    userstack.push(`${filename}:L${call.line}@${call.func}`);
  }

  log(ctx, () => msg);
  let rejectMsg = `${caller}: ${msg}`;
  if (userstack.length !== 0) rejectMsg += `\n\nStack:\n${userstack.join("\n")}`;
  return basicErrorMessage(ws, rejectMsg, type);

  interface ILine {
    line: string;
    func: string;
  }
  function parseChromeStackline(line: string): ILine | null {
    const lineMatch = line.match(/.*:(\d+):\d+.*/);
    const funcMatch = line.match(/.*at (.+) \(.*/);
    if (lineMatch && funcMatch) return { line: lineMatch[1], func: funcMatch[1] };
    return null;
  }
  function parseFirefoxStackline(line: string): ILine | null {
    const lineMatch = line.match(/.*:(\d+):\d+$/);
    const lio = line.lastIndexOf("@");
    if (lineMatch && lio !== -1) return { line: lineMatch[1], func: line.slice(0, lio) };
    return null;
  }
}

/** Generate an error dialog when workerscript is known */
export function handleUnknownError(e: unknown, ws: WorkerScript | ScriptDeath | null = null, initialText = "") {
  if (e instanceof ScriptDeath) {
    //No dialog for an empty ScriptDeath
    if (e.errorMessage === "") return;
    if (!ws) {
      ws = e;
      e = ws.errorMessage;
    }
  }
  if (ws && typeof e === "string") {
    const headerText = basicErrorMessage(ws, "", "");
    if (!e.includes(headerText)) e = basicErrorMessage(ws, e);
  } else if (e instanceof SyntaxError) {
    const msg = `${e.message} (sorry we can't be more helpful)`;
    e = ws ? basicErrorMessage(ws, msg, "SYNTAX") : `SYNTAX ERROR:\n\n${msg}`;
  } else if (e instanceof Error) {
    // Ignore any cancellation errors from Monaco that get here
    if (e.name === "Canceled" && e.message === "Canceled") return;
    const msg = `${e.message}${e.stack ? `\nstack:\n${e.stack.toString()}` : ""}`;
    e = ws ? basicErrorMessage(ws, msg) : `RUNTIME ERROR:\n\n${msg}`;
  }
  if (typeof e !== "string") {
    console.error("Unexpected error:", e);
    const msg = `Unexpected type of error thrown. This error was likely thrown manually within a script.
      Error has been logged to the console.\n\nType of error: ${typeof e}\nValue of error: ${e}`;
    e = ws ? basicErrorMessage(ws, msg, "UNKNOWN") : msg;
  }
  dialogBoxCreate(initialText + e);
}

/** Use this handler to handle the error when we call getSaveData function */
export function handleGetSaveDataError(error: unknown) {
  console.error(error);
  let errorMessage = `Cannot get save data. Error: ${error}.`;
  if (error instanceof RangeError) {
    errorMessage += " This may be because the save data is too large.";
  }
  if (error instanceof Error && error.stack) {
    errorMessage += `\nStack:\n${error.stack}`;
  }
  dialogBoxCreate(errorMessage);
}
