import { Terminal } from "../../Terminal";
import type { TerminalAction } from "../TerminalAction";
import { BaseServer } from "../../Server/BaseServer";
import { runScript } from "./runScript";
import { runProgram } from "./runProgram";
import { hasScriptExtension } from "../../Paths/ScriptFilePath";
import { hasContractExtension } from "../../Paths/ContractFilePath";
import { hasProgramExtension } from "../../Paths/ProgramFilePath";
import { hasCacheExtension } from "../../Paths/CacheFilePath";
import { DarknetServer } from "../../Server/DarknetServer";
import { getRewardFromCache } from "../../DarkNet/effects/cacheFiles";

export function run(args: (string | number | boolean)[], server: BaseServer): undefined | TerminalAction {
  // Run a program or a script
  const arg = args.shift();
  if (!arg)
    return Terminal.error(
      "Usage: run [program/script] [-t num_threads] [--tail] [--ram-override ram_in_GBs] [--temporary] [args...]",
    );

  const path = Terminal.getFilepath(String(arg));
  if (!path) return Terminal.error(`${arg} is not a valid filepath.`);
  if (hasScriptExtension(path)) {
    runScript(path, args, server);
    return;
  } else if (hasContractExtension(path)) {
    Terminal.runContract(path).catch((error) => {
      console.error(error);
      Terminal.error(`Cannot run contract ${path} on ${server.hostname}. Error: ${error}.`);
    });
    return;
  } else if (hasProgramExtension(path)) {
    runProgram(path, args, server);
    return;
  } else if (hasCacheExtension(path)) {
    if (!(server instanceof DarknetServer) || !server.caches.includes(path)) {
      Terminal.error(`Cache file not found: ${path} on server ${server.hostname}`);
      return;
    }
    return Terminal.timedAction(4, "run", () => {
      // Check again, it may have been used
      if (!server.caches.includes(path)) {
        Terminal.error(`Cache file not found: ${path} on server ${server.hostname}`);
        return;
      }
      server.caches = server.caches.filter((cache) => cache !== path);
      const result = getRewardFromCache(server, path, true);
      Terminal.print(result.message);
    });
  }
  Terminal.error(`Invalid file extension. Only .js, .jsx, .ts, .tsx, .cct, .cache, and .exe files can be run.`);
}
