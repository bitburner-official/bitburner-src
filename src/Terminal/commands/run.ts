import { Terminal } from "../../Terminal";
import { Player } from "@player";
import type { TerminalAction } from "../TerminalAction";
import { BaseServer } from "../../Server/BaseServer";
import { GetServer } from "../../Server/AllServers";
import { CodingContractResult } from "../../CodingContract/Contract";
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
    (async () => {
      // There's already an opened contract
      if (Terminal.contractOpen) {
        return Terminal.error("There's already a Coding Contract in Progress");
      }

      const server = Player.getCurrentServer();
      const contract = server.getContract(path);
      if (!contract) {
        return Terminal.error("No such contract");
      }

      Terminal.contractOpen = true;
      const promptResult = await contract.prompt();

      // Get a new copy of the server, in case it changed while the prompt was open
      const postPromptServer = GetServer(server.hostname);

      // Check if the contract still exists by the time the promise is fulfilled
      if (postPromptServer?.getContract(path) == null) {
        Terminal.contractOpen = false;
        return Terminal.error("Contract no longer exists (Was it solved by a script?)");
      }

      switch (promptResult.result) {
        case CodingContractResult.Success: {
          const reward = Player.gainCodingContractReward(
            contract.reward,
            contract.getDifficulty(),
            contract.rewardScaling,
          );
          Terminal.print(`Contract SUCCESS - ${reward}`);
          server.removeContract(contract);
          break;
        }
        case CodingContractResult.InvalidFormat:
          Terminal.error(
            `Contract FAILED - ${
              promptResult.message ?? `The answer is not in the right format for contract '${contract.type}'`
            }`,
          );
          break;
        case CodingContractResult.Failure:
          ++contract.tries;
          if (contract.tries >= contract.getMaxNumTries()) {
            Terminal.error("Contract FAILED - Contract is now self-destructing");
            const solution = contract.getAnswer();
            if (solution !== null) {
              Terminal.error(`Coding Contract solution was: ${solution}`);
            }
            server.removeContract(contract);
          } else {
            Terminal.error(`Contract FAILED - ${contract.getMaxNumTries() - contract.tries} tries remaining`);
          }
          break;
        case CodingContractResult.Cancelled:
          Terminal.print("Contract cancelled");
          break;
        default: {
          const __: never = promptResult.result;
        }
      }
      Terminal.contractOpen = false;
    })().catch((error) => {
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
