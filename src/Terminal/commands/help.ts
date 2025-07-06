import { Player } from "@player";
import type { AutocompleteData } from "@nsdefs";
import { TerminalHelpText, HelpTexts } from "../HelpText";
import { Terminal } from "../../Terminal";
import { compile } from "../../NetscriptJSEvaluator";
import { wrapUserNode } from "../../Netscript/NetscriptHelpers";
import { enums } from "../../NetscriptFunctions";
import { GetAllServers } from "../../Server/AllServers";
import { hasScriptExtension, resolveScriptFilePath, ScriptFilePath } from "../../Paths/ScriptFilePath";
import { Flags } from "../../NetscriptFunctions/Flags";
import { hasTextExtension } from "../../Paths/TextFilePath";

export function help(args: (string | number | boolean)[]): void {
  if (args.length !== 0 && args.length !== 1) {
    Terminal.error("Incorrect usage of help command. Usage: help");
    return;
  }
  if (args.length === 0) {
    const flushedOut = TerminalHelpText.join("\n");
    Terminal.print(flushedOut);
  } else {
    const cmd = args[0] + "";
    const txt = HelpTexts[cmd];

    if (txt == null) {
      // Here is where flow lands if we have a player-implemented command

      // Input sanitization
      const cmdCopy = String(cmd).replace(/^[/.]+/, "") as ScriptFilePath;
      const filePath = resolveScriptFilePath(cmdCopy);

      const localServer = Player.getCurrentServer();

      if (filePath == null) {
        if (hasScriptExtension(cmdCopy)) {
          Terminal.error(`Could not find script '${cmdCopy}'\nMake sure this file exists in this server.`);
        } else if (hasTextExtension(cmdCopy)) {
          Terminal.error(
            `'${cmdCopy}' needs to be either a *.js, *.ts, *.jsx or *.tsx file to have detailed help information.`,
          );
        } else {
          Terminal.error(`No help entry for '${cmdCopy}'.`);
        }
        return;
      }

      const script = localServer.scripts.get(filePath);

      try {
        if (script == null) {
          throw new Error("Script pathname has no valid script object");
        }

        // Deal with help() here

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        compile(script, localServer.scripts).then((compiledModule) => {
          if (compiledModule.help == null) {
            Terminal.error("No help text for '" + cmdCopy + "'. Implement it by exporting a help() function.");
            return;
          }

          const autocompleteData: AutocompleteData = {
            hostname: localServer.hostname,
            servers: GetAllServers()
              .filter((server) => server.backdoorInstalled || localServer.serversOnNetwork.includes(server.hostname))
              .map((server) => server.hostname),
            scripts: [...localServer.scripts.keys()],
            txts: [...localServer.textFiles.keys()],
            enums: enums,
            // Pass no flags as the help command does not use flags
            flags: Flags([""]),
            filename: script.filename,
            processes: Array.from(localServer.runningScriptMap.values(), (m) =>
              Array.from(m.values(), (r) => ({
                pid: r.pid,
                filename: r.filename,
                threads: r.threads,
                args: r.args.slice(),
                temporary: r.temporary,
              })),
            ).flat(),
            // Pass the command as the script filename
            command: `${cmdCopy}`,
          };

          const helpObj = compiledModule.help(autocompleteData);
          Terminal.print(`Usage for ${cmdCopy}:`);

          if (typeof helpObj === "string") {
            Terminal.print(helpObj);
          } else {
            Terminal.printRaw(wrapUserNode(helpObj));
          }
        });
      } catch (err) {
        Terminal.error("Failed to get information for '" + cmdCopy + "'. Check if the script has any syntax errors.");
      }
      return;
    }
    const flushedOut: string = txt.join("\n");
    Terminal.print(flushedOut);
  }
}
