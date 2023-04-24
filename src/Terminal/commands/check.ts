import { Terminal } from "../../Terminal";
import { BaseServer } from "../../Server/BaseServer";
import { findRunningScript } from "../../Script/ScriptHelpers";
import { hasScriptExtension, validScriptExtensions } from "../../Paths/ScriptFilePath";

export function check(args: (string | number | boolean)[], server: BaseServer): void {
  if (args.length < 1) {
    Terminal.error(`Incorrect number of arguments. Usage: check [script] [arg1] [arg2]...`);
  } else {
    const scriptName = Terminal.getFilepath(args[0] + "");
    if (!scriptName) return Terminal.error(`Invalid filename: ${args[0]}`);

    // Can only tail script files
    if (!hasScriptExtension(scriptName)) {
      return Terminal.error(`check: File extension must be one of ${validScriptExtensions.join(", ")})`);
    }

    // Check that the script is running on this machine
    const runningScript = findRunningScript(scriptName, args.slice(1), server);
    if (runningScript == null) return Terminal.error(`No script named ${scriptName} is running on the server`);
    runningScript.displayLog();
  }
}
