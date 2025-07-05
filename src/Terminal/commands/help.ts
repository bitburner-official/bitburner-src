import { ScriptFilePath } from "src/Paths/ScriptFilePath";
import { Terminal } from "../../Terminal";
import { TerminalHelpText, HelpTexts } from "../HelpText";
import { Player } from "@player";
import { compile } from "../../NetscriptJSEvaluator";

export function help(args: (string | number | boolean)[]): void {
  if (args.length !== 0 && args.length !== 1) {
    Terminal.error("Incorrect usage of help command. Usage: help");
    return;
  }
  if (args.length === 0) {
    TerminalHelpText.forEach((line) => Terminal.print(line));
  } else {
    const cmd = args[0] + "";
    const txt = HelpTexts[cmd];

    if (txt == null) {
      // Here is where flow lands if we have a player-implemented command

      // Check if the file is 

      // Sanitize the input from dots or leading slashes.
      // man pages' synopses do not start with a relative path. 
      // It's good that dirs aren't really a thing in Bitburner, because
      // helpers/launch.ts and launch.ts don't conflict with each other.
      const cmdCopy = String(cmd).replace(/^[/.]+/, "") as ScriptFilePath;

      // Get a list of commands to check against the help arg.
      const currServer = Player.getCurrentServer();
      
      const isLocalScript = Array.from(currServer.scripts.keys())
        .map((p) => p == cmdCopy)
        .reduce((prev, val) => val || prev, false);

      if (!isLocalScript) {
        // There probably is a better way;
        // I'll stick with the regex for now
        if (!/(\.ts)|(\.tsx)|(\.js)|(.jsx)$/.test(cmd)) {
          Terminal.error("'" + cmdCopy + "' needs to be either a *.js, *.ts, *.jsx or *.tsx file to have detailed help information.");
          return;
        }
        Terminal.error("Could not find script '" + cmdCopy + "'");
        return;
      }

      // Check above guarantees that the map contains the script.
      const script = currServer.scripts.get(cmdCopy);

      // I don't argue with type safety!
      if (script == null) {
        throw new Error("Script pathname has no valid script object");
      }

      // Get the module for the script and check if it has a help function.
      // If it does, utilize its help function to print the help text.
      try {
        // .catch() on the promise doesn't appear to do anything? I don't use much of 
        // the old, callback-based async API to know what it does. 
        // I have to wrap this in a try-catch block to print an error

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        compile(script, currServer.scripts)
      .then((compiledModule) => {
        if (compiledModule.help == null) {
          Terminal.error("No help text for '" + cmdCopy + "'. Implement it by exporting a help() function.");
          return;
        }
        
        const helpText = compiledModule.help();
        if (typeof helpText === "string") {
          Terminal.print(helpText);
        } else {
          helpText.forEach((line) => Terminal.print(line));
        }
      });
    } catch (err) {
      Terminal.error("Failed to get information for '" + cmdCopy + "'. Check if the script has any syntax errors.");
    }
      return;
    }
    txt.forEach((t) => Terminal.print(t));
  }
}
