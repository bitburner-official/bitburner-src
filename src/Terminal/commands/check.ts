import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { findRunningScripts } from "../../Script/ScriptHelpers";
import { hasScriptExtension, validScriptExtensions } from "../../Paths/ScriptFilePath";
import { StdIO } from "../StdIO/StdIO";

export function check(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined {
  if (args.length < 1) {
    Terminal.fatal(`Incorrect number of arguments. Usage: check [script] [arg1] [arg2]...`, stdIO);
  } else {
    const scriptName = Terminal.getFilepath(args[0] + "");
    if (!scriptName) return Terminal.fatal(`Invalid filename: ${args[0]}`, stdIO);

    // Can only tail script files
    if (!hasScriptExtension(scriptName)) {
      return Terminal.fatal(`check: File extension must be one of ${validScriptExtensions.join(", ")})`, stdIO);
    }

    // Check that the script is running on this machine
    const runningScripts = findRunningScripts(scriptName, args.slice(1), server);
    if (runningScripts === null) {
      Terminal.fatal(`No script named ${scriptName} is running on the server`, stdIO);
      return;
    }
    const next = runningScripts.values().next();
    if (!next.done) {
      next.value.displayLog(stdIO);
    }
  }
}
