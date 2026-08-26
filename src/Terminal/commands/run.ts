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
      "用法：run [program/script] [-t num_threads] [--tail] [--ram-override ram_in_GBs] [--temporary] [args...]",
    );

  const path = Terminal.getFilepath(String(arg));
  if (!path) return Terminal.error(`${arg} 不是有效的文件路径。`);
  if (hasScriptExtension(path)) {
    runScript(path, args, server);
    return;
  } else if (hasContractExtension(path)) {
    (async () => {
      // There's already an opened contract
      if (Terminal.contractOpen) {
        return Terminal.error("已有一个编程合约正在进行中");
      }

      const server = Player.getCurrentServer();
      const contract = server.getContract(path);
      if (!contract) {
        return Terminal.error("没有此合约");
      }

      Terminal.contractOpen = true;
      const promptResult = await contract.prompt();

      // Get a new copy of the server, in case it changed while the prompt was open
      const postPromptServer = GetServer(server.hostname);

      // Check if the contract still exists by the time the promise is fulfilled
      if (postPromptServer?.getContract(path) == null) {
        Terminal.contractOpen = false;
        return Terminal.error("合约已不存在（是否已被脚本解决？）");
      }

      switch (promptResult.result) {
        case CodingContractResult.Success: {
          const reward = Player.gainCodingContractReward(
            contract.reward,
            contract.getDifficulty(),
            contract.rewardScaling,
          );
          Terminal.print(`合约成功 - ${reward}`);
          server.removeContract(contract);
          break;
        }
        case CodingContractResult.InvalidFormat:
          Terminal.error(
            `合约失败 - ${
              promptResult.message ?? `答案不符合合约 '${contract.type}' 的格式要求`
            }`,
          );
          break;
        case CodingContractResult.Failure:
          ++contract.tries;
          if (contract.tries >= contract.getMaxNumTries()) {
            Terminal.error("合约失败 - 合约即将自毁");
            const solution = contract.getAnswer();
            if (solution !== null) {
              Terminal.error(`编程合约的答案是：${solution}`);
            }
            server.removeContract(contract);
          } else {
            Terminal.error(`合约失败 - 剩余 ${contract.getMaxNumTries() - contract.tries} 次尝试机会`);
          }
          break;
        case CodingContractResult.Cancelled:
          Terminal.print("合约已取消");
          break;
        default: {
          const __: never = promptResult.result;
        }
      }
      Terminal.contractOpen = false;
    })().catch((error) => {
      console.error(error);
      Terminal.error(`无法在 ${server.hostname} 上运行合约 ${path}。错误：${error}。`);
    });
    return;
  } else if (hasProgramExtension(path)) {
    runProgram(path, args, server);
    return;
  } else if (hasCacheExtension(path)) {
    if (!(server instanceof DarknetServer) || !server.caches.includes(path)) {
      Terminal.error(`未找到缓存文件：${path}（服务器 ${server.hostname}）`);
      return;
    }
    return Terminal.timedAction(4, "run", () => {
      // Check again, it may have been used
      if (!server.caches.includes(path)) {
        Terminal.error(`未找到缓存文件：${path}（服务器 ${server.hostname}）`);
        return;
      }
      server.caches = server.caches.filter((cache) => cache !== path);
      const result = getRewardFromCache(server, path, true);
      Terminal.print(result.message);
    });
  }
  Terminal.error(`无效的文件扩展名。只能运行 .js、.jsx、.ts、.tsx、.cct、.cache 和 .exe 文件。`);
}
