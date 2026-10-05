import { SourceMapConsumer, type RawSourceMap } from "source-map-js";

import type { WorkerScript } from "./WorkerScript";
import type { NetscriptContext } from "./APIWrapper";
import type { Script } from "../Script/Script";
import type { ScriptURL } from "../Script/LoadedModule";
import { FileType, getFileType, transformScript } from "../utils/ScriptTransformer";

/** Log a message to a script's logs */
export function log(ctx: NetscriptContext, message: () => string) {
  ctx.workerScript.log(ctx.functionPath, message);
}

/**
 * Regenerate a script's source map, on demand, so we can display correct error positions.
 */
function getSourceMapConsumer(
  script: Script,
  url: ScriptURL,
  cache: Map<Script, SourceMapConsumer | null>,
): SourceMapConsumer | null {
  const cachedConsumer = cache.get(script);
  if (cachedConsumer) return cachedConsumer;
  if (script.mod?.url !== url) {
    // A mismatched url means the code has been edited since compile.
    return null;
  }
  const consumer = generateSourceMapConsumer(script);
  cache.set(script, consumer);
  return consumer;
}

function generateSourceMapConsumer(script: Script): SourceMapConsumer | null {
  try {
    const fileType = getFileType(script.filename);
    if (fileType !== FileType.JSX && fileType !== FileType.TS && fileType !== FileType.TSX) {
      return null;
    }
    const { sourceMap } = transformScript(script.code, fileType);
    return sourceMap ? new SourceMapConsumer(JSON.parse(sourceMap) as RawSourceMap) : null;
  } catch (e) {
    console.warn(`Failed to regenerate source map for ${script.filename} on ${script.server}:`, e);
    return null;
  }
}

function remapPosition(
  script: Script,
  url: ScriptURL,
  line: number,
  column: number,
  cache: Map<Script, SourceMapConsumer | null>,
): { line: number; column: number } | null {
  const consumer = getSourceMapConsumer(script, url, cache);
  if (!consumer) return null;
  const mappedPosition = consumer.originalPositionFor({ line, column });
  if (mappedPosition.line != null) {
    return { line: mappedPosition.line, column: mappedPosition.column ?? 0 };
  }

  // Browsers can report a column that falls before the first mapping segment on a line (leading whitespace,
  // or the very start of the line). Retry with LEAST_UPPER_BOUND to pick up the next mapping on the same statement.
  const mappedPositionFromLowerBound = consumer.originalPositionFor({
    line,
    column,
    bias: SourceMapConsumer.LEAST_UPPER_BOUND,
  });
  return mappedPositionFromLowerBound.line
    ? { line: mappedPositionFromLowerBound.line, column: mappedPositionFromLowerBound.column ?? 0 }
    : null;
}

function escapeRegExp(str: string): string {
  // escape each regex reserved character with a backslash, so the input string can be embedded literally in a pattern
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Replace blob URLs (and the `server/filename` names browsers substitute via `//# sourceURL=`)
 * in an error message with script filenames. For transpiled scripts, also remap trailing
 * `:line:column` positions back to the original source.
 */
export function parseBlobUrlInMessage(ws: WorkerScript, msg: string): string {
  const consumerCache = new Map<Script, SourceMapConsumer | null>();
  for (const [scriptUrl, script] of ws.scriptRef.dependencies) {
    // Match the blob URL and the "server/filename" name that browsers use in its place once
    // the compiled blob has been loaded. Trailing ":line:column" is captured so we can remap it.
    const needles = [scriptUrl, `${script.server}/${script.filename}`].filter(Boolean);
    for (const needle of needles) {
      const pattern = new RegExp(`${escapeRegExp(needle)}(?::(\\d+):(\\d+))?`, "g");
      msg = msg.replace(pattern, (_match, lineStr: string | undefined, colStr: string | undefined) => {
        if (!lineStr || !colStr) return script.filename;
        const remappedPosition = remapPosition(script, scriptUrl, Number(lineStr), Number(colStr), consumerCache);
        return remappedPosition
          ? `${script.filename}:${remappedPosition.line}:${remappedPosition.column}`
          : `${script.filename}:${lineStr}:${colStr}`;
      });
    }
  }
  return msg;
}

/** Creates an error message string containing hostname, scriptname, and the error message msg */
export function basicErrorMessage(ws: WorkerScript, msg: string, type = "RUNTIME"): string {
  return `${type} ERROR\n${ws.name}@${ws.hostname} (PID - ${ws.pid})\n\n${parseBlobUrlInMessage(ws, msg)}`;
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
  const userstack = [];
  const sourceMapConsumerCache = new Map<Script, SourceMapConsumer | null>();
  for (const stackline of stack) {
    const matchingScript = findMatchingScript(ws, stackline);
    if (!matchingScript) continue;

    const call = parseChromeStackline(stackline) ??
      parseFirefoxStackline(stackline) ?? { line: "-1", column: "-1", func: "unknown" };

    if (matchingScript.script && matchingScript.url && call.line !== "-1" && call.column !== "-1") {
      const remappedPosition = remapPosition(
        matchingScript.script,
        matchingScript.url,
        Number(call.line),
        Number(call.column),
        sourceMapConsumerCache,
      );
      if (remappedPosition) {
        call.line = String(remappedPosition.line);
        call.column = String(remappedPosition.column);
      }
    }

    userstack.push(`${matchingScript.filename}:L${call.line}@${call.func}`);
  }

  log(ctx, () => msg);
  let rejectMsg = `${caller}: ${msg}`;
  if (userstack.length !== 0) rejectMsg += `\n\nStack:\n${userstack.join("\n")}`;
  return basicErrorMessage(ws, rejectMsg, type);

  interface ILine {
    line: string;
    column: string;
    func: string;
  }
  function parseChromeStackline(line: string): ILine | null {
    // Chrome frames look like "    at funcName (url:line:col)"
    const lineMatch = line.match(/.*:(\d+):(\d+).*/);
    const funcMatch = line.match(/.*at (.+) \(.*/);
    if (lineMatch && funcMatch) return { line: lineMatch[1], column: lineMatch[2], func: funcMatch[1] };
    return null;
  }
  function parseFirefoxStackline(line: string): ILine | null {
    // Firefox frames look like "funcName@url:line:col" with no trailing text
    const lineMatch = line.match(/.*:(\d+):(\d+)$/);
    const lio = line.lastIndexOf("@");
    if (lineMatch && lio !== -1) return { line: lineMatch[1], column: lineMatch[2], func: line.slice(0, lio) };
    return null;
  }
}

function findMatchingScript(ws: WorkerScript, stackline: string) {
  for (const [url, script] of ws.scriptRef.dependencies) {
    // Look for the "//# sourceURL=server/filename" format, or the blob url
    if (stackline.includes(url)) return { filename: script.filename, script, url };
    if (stackline.includes(`${script.server}/${script.filename}`)) {
      return { filename: script.filename, script, url };
    }
  }
  if (stackline.includes(ws.scriptRef.filename)) {
    return { filename: ws.scriptRef.filename, script: null, url: null };
  }
  for (const script of ws.scriptRef.dependencies.values()) {
    if (stackline.includes(script.filename)) return { filename: script.filename, script: null, url: null };
  }
  return null;
}
