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
import { StdIO } from "../StdIO/StdIO";
import { hasCacheExtension } from "../../Paths/CacheFilePath";
import { DarknetServer } from "../../Server/DarknetServer";
import { getRewardFromCache } from "../../DarkNet/effects/cacheFiles";

export function run(args: (string | number | boolean)[], server: BaseServer, stdIO: StdIO): undefined | TerminalAction {
  // Run a program or a script
  const arg = args.shift();
  if (!arg)
    return Terminal.fatal(
      "Usage: run [program/script] [-t num_threads] [--tail] [--ram-override ram_in_GBs] [--temporary] [args...]",
      stdIO,
    );

  const path = Terminal.getFilepath(String(arg));
  if (!path) return Terminal.fatal(`${arg} is not a valid filepath.`, stdIO);
  if (hasScriptExtension(path)) {
    runScript(path, args, server, stdIO);
    return;
  } else if (hasContractExtension(path)) {
    (async () => {
      // There's already an opened contract
      if (Terminal.contractOpen) {
        return Terminal.fatal("There's already a Coding Contract in Progress", stdIO);
      }

      const server = Player.getCurrentServer();
      const contract = server.getContract(path);
      if (!contract) {
        return Terminal.fatal("No such contract", stdIO);
      }

      Terminal.contractOpen = true;
      const promptResult = await contract.prompt();

      // Get a new copy of the server, in case it changed while the prompt was open
      const postPromptServer = GetServer(server.hostname);

      // Check if the contract still exists by the time the promise is fulfilled
      if (postPromptServer?.getContract(path) == null) {
        Terminal.contractOpen = false;
        return Terminal.fatal("Contract no longer exists (Was it solved by a script?)", stdIO);
      }

      switch (promptResult.result) {
        case CodingContractResult.Success:
          if (contract.reward !== null) {
            const reward = Player.gainCodingContractReward(
              contract.reward,
              contract.getDifficulty(),
              contract.rewardScaling,
            );
            Terminal.print(`Contract SUCCESS - ${reward}`, stdIO);
          }
          server.removeContract(contract);
          break;
        case CodingContractResult.InvalidFormat:
          Terminal.error(
            `Contract FAILED - ${
              promptResult.message ?? `The answer is not in the right format for contract '${contract.type}'`
            }`,
            stdIO,
          );
          break;
        case CodingContractResult.Failure:
          ++contract.tries;
          if (contract.tries >= contract.getMaxNumTries()) {
            Terminal.error("Contract FAILED - Contract is now self-destructing", stdIO);
            const solution = contract.getAnswer();
            if (solution !== null) {
              Terminal.error(`Coding Contract solution was: ${solution}`, stdIO);
            }
            server.removeContract(contract);
          } else {
            Terminal.error(`Contract FAILED - ${contract.getMaxNumTries() - contract.tries} tries remaining`, stdIO);
          }
          break;
        case CodingContractResult.Cancelled:
          Terminal.print("Contract cancelled", stdIO);
          break;
        default: {
          const __: never = promptResult.result;
        }
      }
      Terminal.contractOpen = false;
    })().catch((error) => {
      console.error(error);
      Terminal.fatal(`Cannot run contract ${path} on ${server.hostname}. Error: ${error}.`, stdIO);
    });
    return;
  } else if (hasProgramExtension(path)) {
    runProgram(path, args, server, stdIO);
    return;
  } else if (hasCacheExtension(path)) {
    if (!(server instanceof DarknetServer) || !server.caches.includes(path)) {
      Terminal.fatal(`Cache file not found: ${path} on server ${server.hostname}`, stdIO);
      return;
    }
    return Terminal.timedAction(
      4,
      "run",
      () => {
        // Check again, it may have been used
        if (!server.caches.includes(path)) {
          Terminal.fatal(`Cache file not found: ${path} on server ${server.hostname}`, stdIO);
          return;
        }
        server.caches = server.caches.filter((cache) => cache !== path);
        const result = getRewardFromCache(server, path, true);
        Terminal.print(result.message, stdIO);
      },
      stdIO,
    );
  }
  Terminal.fatal(`Invalid file extension. Only .js, .jsx, .ts, .tsx, .cct, .cache, and .exe files can be run.`, stdIO);
}
