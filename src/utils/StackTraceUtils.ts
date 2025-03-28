import ErrorStackParser from "error-stack-parser";
import { type RawSourceMap, SourceMapConsumer } from "source-map-js";

/**
 * parseStackTrace uses some properties of workerScript, but the dependency chain of WorkerScript is long. In order to
 * avoid worsening the dependency chain of parseStackTrace's callers, we use this minimal version of WorkerScript's type
 * instead of importing WorkerScript. It violates the DRY principle, but it's worth the trouble:
 * - We rarely change WorkerScript.
 * - The entire codebase is riddled with massive dependency chains. We should avoid worsening the situation.
 */
export type LiteWorkerScript = {
  hostname: string;
  scriptRef: {
    dependencies: Map<
      unknown,
      {
        filename: string;
        mod: {
          sourceUrl: string;
          sourceMap?: string;
        } | null;
      }
    >;
  };
};

/**
 * This function parses the stack trace of the error and returns only stack lines in the player's scripts. With
 * transformed scripts, it also parses the source map to show the original lines/columns of the original scripts.
 *
 * For example: This stack:
 *
 *   at errorMessage (webpack://bitburner/./src/Netscript/ErrorMessages.ts?:35:97)
 *   at Object.getServer (webpack://bitburner/./src/Netscript/NetscriptHelpers.tsx?:420:72)
 *   at eval (webpack://bitburner/./src/NetscriptFunctions.ts?:889:86)
 *   at Proxy.wrappedFunction (webpack://bitburner/./src/Netscript/APIWrapper.ts?:67:16)
 *   at test1 (home/a.ts:10:8)
 *   at main (home/a.ts:23:5)
 *   at startNetscript2Script (webpack://bitburner/./src/NetscriptWorker.ts?:91:9)
 *
 * Becomes:
 *
 *   at test1 (home/a.ts:11:5)
 *   at main (home/a.ts:26:2)
 *
 * There are 2 changes:
 * - All stack lines pointing to our codebase are stripped.
 * - Stack lines show original lines/columns (e.g., a.ts:23:5 -> home/a.ts:26:2).
 */
export function parseStackTrace(error: Error, workerScript: LiteWorkerScript): string {
  const stackFrames = ErrorStackParser.parse(error);
  const stackLines = [error.message];
  const cache = new Map<string, { fileName: string; sourceMap?: string }>();
  for (const stackFrame of stackFrames) {
    if (!stackFrame.fileName) {
      continue;
    }
    /**
     * Due to how we cache modules, fileName in stackFrame may be wrong. Let's say that we have test.ts and
     * test-clone.ts. They have the same code:
     *
     * export async function main(ns: NS) {
     *   throw new Error("test error");
     * }
     *
     * If we run test.ts first, then run test-clone.ts, they generate the same error stack trace:
     *
     * Error: test error
     *   at main (test.ts:2:9)
     *   at startNetscript2Script (NetscriptWorker.ts:91:9)
     *
     * Even when we run test-clone.ts, fileName in stackFrame still points to test.ts. In order to solve this problem,
     * we loop through workerScript.scriptRef.dependencies and find the correct script. This property contains directly
     * or indirectly imports, including the script itself. In the previous example:
     *
     * test.ts: stackFrame.fileName is test.ts. workerScript.scriptRef.dependencies contains a Script instance:
     * - filename: "test.ts"
     * - mod: {
     *   sourceUrl: "home/test.ts"
     * }
     *
     * test-clone.ts: stackFrame.fileName is test.ts. workerScript.scriptRef.dependencies contains a Script instance:
     * - filename: "test-clone.ts"
     * - mod.sourceUrl: "home/test.ts"
     *
     * Both sourceUrl point to "home/test.ts", but filename is the correct value.
     *
     * Note that this solution still fails to find the correct filename in edge cases. For example:
     *
     * lib-edge-1.ts and lib-edge-2.ts with same code:
     *
     * export function test1(): void {
     * }
     * export function test2(): void {
     *   throw new Error("test error test2");
     * }
     * export async function main(ns: NS) {
     *   ns.print("lib-edge");
     * }
     *
     * b.ts:
     *
     * import { test1 } from "./lib-edge-1";
     * import { test2 } from "./lib-edge-2";
     * export async function main(ns: NS) {
     *   test1();
     *   test2();
     * }
     *
     * Run b.ts:
     *   at test2 (home/lib-edge-1.ts:4:8) -> Wrong filename
     *   at main (home/b.ts:5:2)
     *
     * When we run b.ts, "dependencies" contains:
     * - Script 1:
     *   - filename: "lib-edge-1.ts"
     *   - mod.sourceUrl: "home/lib-edge-1.ts"
     * - Script 2:
     *   - filename: "b.ts"
     *   - mod.sourceUrl: "home/b.ts"
     *
     * b.ts imports both lib-edge-1.ts and lib-edge-2.ts, but they have the same code, so "dependencies" only contains
     * the module of lib-edge-1.ts and b.ts.
     *
     * Without changing how we cache modules, we don't have enough information to perfectly deduce the correct filename
     * in all cases, unless we perform AST analysis in this function. It only affects edge cases, so we can accept it as
     * a known limitation.
     */
    let fileName;
    let sourceMap;
    const cachedValue = cache.get(stackFrame.fileName);
    if (!cachedValue) {
      // Find correct fileName.
      for (const script of workerScript.scriptRef.dependencies.values()) {
        if (script.mod === null) {
          continue;
        }
        // console.log("scrip", script);
        if (script.mod.sourceUrl !== stackFrame.fileName) {
          continue;
        }
        fileName = script.filename;
        sourceMap = script.mod.sourceMap;
        // Put it in the cache.
        cache.set(stackFrame.fileName, { fileName, sourceMap });
        break;
      }
    } else {
      // Reuse cached value.
      fileName = cachedValue.fileName;
      sourceMap = cachedValue.sourceMap;
    }

    // This only happens when the current stackFrame points to our codebase.
    if (!fileName) {
      console.warn(stackFrame.fileName);
      continue;
    }

    let line = stackFrame.lineNumber;
    let column = stackFrame.columnNumber;
    if (line !== undefined && column !== undefined && sourceMap !== undefined) {
      // console.log("stackFrame", stackFrame);
      /**
       * SourceMap is generated by SWC, so we assume that it's valid. Validating it with ajv is unnecessary. If there
       * are bugs in SWC or source-map-js, the try-catch block will ensure that the game won't crash.
       */
      try {
        const sourceMapConsumer = new SourceMapConsumer(JSON.parse(sourceMap) as RawSourceMap);
        ({ line, column } = sourceMapConsumer.originalPositionFor({ line, column }));
      } catch (errorParsingSourceMap) {
        console.error(errorParsingSourceMap);
        console.error(`Cannot parse map of ${fileName} in ${workerScript.hostname}. Source map: ${sourceMap}`);
      }
    }
    stackLines.push(`    at ${stackFrame.functionName} (${workerScript.hostname}/${fileName}:${line}:${column})`);
  }
  return stackLines.join("\n");
}
