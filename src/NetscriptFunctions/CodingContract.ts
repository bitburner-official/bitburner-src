import { Player } from "@player";
import { CodingContract, CodingContractResult } from "../CodingContract/Contract";
import { CodingContractObject, CodingContract as ICodingContract } from "@nsdefs";
import { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { CodingContractName } from "@enums";
import { generateDummyContract } from "../CodingContract/ContractGenerator";
import { type BaseServer } from "../Server/BaseServer";
import { exceptionAlert } from "../utils/helpers/exceptionAlert";
import { getEnumHelper } from "../utils/EnumHelper";

export function NetscriptCodingContract(): InternalAPI<ICodingContract> {
  const getCodingContract = function (
    ctx: NetscriptContext,
    _host: unknown,
    filename: string,
  ): [CodingContract, BaseServer] {
    const [server, host] = helpers.getServer(ctx, _host);
    const contract = server?.getContract(filename);
    if (server == null || contract == null) {
      throw helpers.errorMessage(ctx, `在服务器 '${host}' 上找不到合约 '${filename}'`);
    }

    return [contract, server];
  };

  function attemptContract(
    ctx: NetscriptContext,
    server: BaseServer,
    contract: CodingContract,
    answer: unknown,
  ): string {
    const validationResult = contract.isValid(answer);
    if (!validationResult.success) {
      throw helpers.errorMessage(ctx, validationResult.message);
    }

    const resultOfCheckingSolution = contract.isSolution(answer);
    switch (resultOfCheckingSolution.result) {
      case CodingContractResult.Success: {
        const reward = Player.gainCodingContractReward(
          contract.reward,
          contract.getDifficulty(),
          contract.rewardScaling,
        );
        helpers.log(ctx, () => `成功完成编程合约 '${contract.fn}'。奖励：${reward}`);
        server.removeContract(contract.fn);
        return reward;
      }
      /**
       * This should never happen. If the answer format is invalid, it should already be handled by the call to
       * contract.isValid() above.
       */
      case CodingContractResult.InvalidFormat: {
        exceptionAlert(
          new Error(
            `contract.isSolution() returns unexpected InvalidFormat result. Type: ${contract.type}. Answer: ${answer}`,
          ),
          true,
        );
        return "";
      }
      case CodingContractResult.Failure: {
        if (++contract.tries >= contract.getMaxNumTries()) {
          helpers.log(ctx, () => `编程合约 '${contract.fn}' 尝试失败。合约即将自毁`);
          const solution = contract.getAnswer();
          if (solution !== null) {
            helpers.log(ctx, () => `编程合约的答案是：${solution}`);
          }
          server.removeContract(contract.fn);
        } else {
          helpers.log(
            ctx,
            () =>
              `编程合约 '${contract.fn}' 尝试失败。剩余 ${
                contract.getMaxNumTries() - contract.tries
              } 次尝试机会。`,
          );
        }
        return "";
      }
      default: {
        const __: never = resultOfCheckingSolution.result;
      }
    }
    return "";
  }

  return {
    attempt: (ctx, answer, _filename, _host?) => {
      const filename = helpers.string(ctx, "filename", _filename);
      const [contract, server] = getCodingContract(ctx, _host, filename);
      return attemptContract(ctx, server, contract, answer);
    },
    getContractType: (ctx, _filename, _host?) => {
      const filename = helpers.string(ctx, "filename", _filename);
      const [contract] = getCodingContract(ctx, _host, filename);
      return contract.getType();
    },
    getData: (ctx, _filename, _host?) => {
      const filename = helpers.string(ctx, "filename", _filename);
      const [contract] = getCodingContract(ctx, _host, filename);
      return structuredClone(contract.getData());
    },
    getContract: (ctx, _filename, _host?) => {
      const filename = helpers.string(ctx, "filename", _filename);
      const [contract, server] = getCodingContract(ctx, _host, filename);
      // asserting type here is required, since it is not feasible to properly type getData
      return {
        type: contract.type,
        data: structuredClone(contract.getData()),
        submit: (answer: unknown) => {
          helpers.checkEnvFlags(ctx);
          return attemptContract(ctx, server, contract, answer);
        },
        description: contract.getDescription(),
        difficulty: contract.getDifficulty(),
        numTriesRemaining: () => {
          helpers.checkEnvFlags(ctx);
          return contract.getMaxNumTries() - contract.tries;
        },
      } as CodingContractObject;
    },
    getDescription: (ctx, _filename, _host?) => {
      const filename = helpers.string(ctx, "filename", _filename);
      const [contract] = getCodingContract(ctx, _host, filename);
      return contract.getDescription();
    },
    getNumTriesRemaining: (ctx, _filename, _host?) => {
      const filename = helpers.string(ctx, "filename", _filename);
      const [contract] = getCodingContract(ctx, _host, filename);
      return contract.getMaxNumTries() - contract.tries;
    },
    createDummyContract: (ctx, _type, _host?) => {
      const type = getEnumHelper("CodingContractName").nsGetMember(ctx, _type);
      const [server] = helpers.getServer(ctx, _host);
      if (server == null) {
        return null;
      }
      return generateDummyContract(type, server);
    },
    getContractTypes: () => Object.values(CodingContractName),
  };
}
