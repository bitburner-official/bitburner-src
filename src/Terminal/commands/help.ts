import { ScriptFilePath } from "src/Paths/ScriptFilePath";
import { Terminal } from "../../Terminal";
import { TerminalHelpText, HelpTexts } from "../HelpText";
import { Player } from "@player";
import { compile } from "src/NetscriptJSEvaluator";

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
      
      // Sanitize the input from dots or leading slashes.
      // man pages' synopses do not start with a relative path. 
      // However, since dirs aren't really a thing in Bitburner, 
      // helpers/launch.ts and launch.ts don't conflict with each other.
      const cmdCopy = String(cmd).replace(/^[/\.]+/, "") as ScriptFilePath;

      // Get a list of commands to check against the help arg.
      const currServer = Player.getCurrentServer();
      const playerScripts: ScriptFilePath[] = Array.from(
        currServer.scripts.keys()
        .filter((s) => s === cmdCopy)
      );
      if (!playerScripts.includes(cmdCopy as ScriptFilePath)) {
        Terminal.error("No help topics match '" + cmdCopy + "'");
        return;
      }

      // Check above guarantees that the map contains the script.
      const script = currServer.scripts[cmdCopy]!;

      // Get the module for the script and check if it has a help function.
      // If it does, utilize its help function to print the help text.
      compile(script, currServer.scripts)
      .then((compiledModule) => {
        if (compiledModule.help == null) {
          Terminal.error("No help topics match '" + cmdCopy + "'");
          return;
        }
        
        const helpText = compiledModule.help();
        if (typeof helpText === "string") {
          Terminal.print(helpText);
        } else {
          helpText.forEach((line) => Terminal.print(line));
        }
      })
      .catch((err) => {
        Terminal.error("Failed to get information for '" + cmdCopy + "'. Check if the script can be ran.");
        console.error(err);
        return;
      });

    }
    txt.forEach((t) => Terminal.print(t));
  }
}
