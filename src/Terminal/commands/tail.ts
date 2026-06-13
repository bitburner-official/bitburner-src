import { escapeRegExp } from "lodash";
import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { findRunningScripts, findRunningScriptByPid } from "../../Script/ScriptHelpers";
import { LogBoxEvents } from "../../ui/React/LogBoxManager";
import { hasScriptExtension, ScriptFilePath } from "../../Paths/ScriptFilePath";
import { RunningScript } from "../../Script/RunningScript";
import { matchScriptPathExact } from "../../utils/helpers/scriptKey";
import { StdIO } from "../StdIO/StdIO";

export function tail(commandArray: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  try {
    if (commandArray.length < 1) {
      Terminal.fatal("Incorrect number of arguments. Usage: tail [pid] or tail [scriptname] [arg1] [arg2]...");
      return;
    } else if (typeof commandArray[0] === "string") {
      const [rawName, ...args] = commandArray;
      const path = Terminal.getFilepath(rawName);
      if (!path) return Terminal.fatal(`Invalid filename: ${rawName}`);
      if (!hasScriptExtension(path)) return Terminal.fatal(`Invalid file extension. Tail can only be used on scripts.`);

      // Only select from name match if there is no ambiguity and no argument filter specified
      const scriptsMatchingName = commandArray.length === 1 ? findRunningScriptsByFilename(path, server) : null;
      const scriptMatchingName = scriptsMatchingName?.size === 1 ? scriptsMatchingName.values().next() : null;

      // Check for exact matches with specified arguments
      const candidates = findRunningScripts(path, args, server);

      if (candidates === null && (scriptsMatchingName?.size ?? 0) > 1) {
        Terminal.fatal(
          `Multiple scripts named ${path} are running on the server. ` +
            `Specify arguments to pick which script to tail.`,
        );
        return;
      }

      // if there's no candidate then we just don't know.
      if (candidates === null && scriptMatchingName === null) {
        Terminal.fatal(`No script named ${path} with args ${JSON.stringify(args)} is running on the server`);
        return;
      }

      // Just use the first one (if there are multiple with the same
      // arguments, they can't be distinguished except by pid).
      const next = scriptMatchingName ?? candidates?.values().next();
      if (next && !next.done) {
        handleTail(next.value, stdIO);
      }
    } else if (typeof commandArray[0] === "number") {
      const runningScript = findRunningScriptByPid(commandArray[0]);
      if (runningScript == null) {
        Terminal.fatal(`No script with PID ${commandArray[0]} is running`);
        return;
      }
      handleTail(runningScript, stdIO);
    }
  } catch (error) {
    console.error(error);
    Terminal.fatal(String(error));
  }
}

function handleTail(script: RunningScript, stdIO: StdIO): void {
  if (!stdIO.stdout) {
    return LogBoxEvents.emit(script);
  }

  script.tailStdOut = stdIO;
  script.logs.forEach((log) => {
    script.tailStdOut?.write?.(log);
  });
}

function findRunningScriptsByFilename(path: ScriptFilePath, server: BaseServer): Map<number, RunningScript> | null {
  const result = new Map<number, RunningScript>();
  const pattern = matchScriptPathExact(escapeRegExp(path));
  for (const [key, runningScriptMap] of server.runningScriptMap.entries()) {
    if (pattern.test(key)) {
      for (const [pid, runningScript] of runningScriptMap.entries()) {
        result.set(pid, runningScript);
      }
    }
  }
  return result.size > 0 ? result : null;
}
