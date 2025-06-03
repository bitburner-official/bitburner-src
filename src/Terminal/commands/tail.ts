import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { findRunningScripts, findRunningScriptByPid } from "../../Script/ScriptHelpers";
import { LogBoxEvents } from "../../ui/React/LogBoxManager";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";

export function tail(commandArray: (string | number | boolean)[], server: BaseServer): void {
  try {
    if (commandArray.length < 1) {
      Terminal.error("Incorrect number of arguments. Usage: tail [pid] or tail [scriptname] [arg1] [arg2]...");
    } else if (typeof commandArray[0] === "string") {
      const [rawName, ...args] = commandArray;
      const path = Terminal.getFilepath(rawName);
      if (!path) return Terminal.error(`Invalid filename: ${rawName}`);
      if (!hasScriptExtension(path)) return Terminal.error(`Invalid file extension. Tail can only be used on scripts.`);

      const candidates = findRunningScripts(path, args, server);

      // if there's no candidate then we just don't know.
      if (candidates === null) {
        Terminal.error(`No script named ${path} with args ${JSON.stringify(args)} is running on the server`);
        return;
      }
      // Just use the first one (if there are multiple with the same
      // arguments, they can't be distinguished except by pid).
      const next = candidates.values().next();
      if (!next.done) {
        LogBoxEvents.emit(next.value);
      }
    } else if (typeof commandArray[0] === "number") {
      const runningScript = findRunningScriptByPid(commandArray[0]);
      if (runningScript == null) {
        Terminal.error(`No script with PID ${commandArray[0]} is running`);
        return;
      }
      LogBoxEvents.emit(runningScript);
    }
  } catch (error) {
    console.error(error);
    Terminal.error(String(error));
  }
}
