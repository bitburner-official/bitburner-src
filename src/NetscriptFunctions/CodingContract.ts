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
  const getCodingContract = function (ctx: NetscriptContext, hostname: string, filename: string): CodingContract {
    const server = helpers.getServer(ctx, hostname);
    const contract = server.getContract(filename);
    if (contract == null) {
      throw helpers.errorMessage(ctx, `Cannot find contract '${filename}' on server '${hostname}'`);
    }

    return contract;
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
        const reward = Player.gainCodingContractReward(contract.reward, contract.getDifficulty());
        helpers.log(ctx, () => `Successfully completed Coding Contract '${contract.fn}'. Reward: ${reward}`);
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
          helpers.log(ctx, () => `Coding Contract attempt '${contract.fn}' failed. Contract is now self-destructing`);
          server.removeContract(contract.fn);
        } else {
          helpers.log(
            ctx,
            () =>
              `Coding Contract attempt '${contract.fn}' failed. ${
                contract.getMaxNumTries() - contract.tries
              } attempt(s) remaining.`,
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
    attempt: (ctx) => (answer, _filename, _host?) => {
      const filename = helpers.string(ctx, "filename", _filename);
      const host = _host ? helpers.string(ctx, "host", _host) : ctx.workerScript.hostname;
      const contract = getCodingContract(ctx, host, filename);
      const server = helpers.getServer(ctx, host);
      return attemptContract(ctx, server, contract, answer);
    },
    getContractType: (ctx) => (_filename, _host?) => {
      const filename = helpers.string(ctx, "filename", _filename);
      const host = _host ? helpers.string(ctx, "host", _host) : ctx.workerScript.hostname;
      const contract = getCodingContract(ctx, host, filename);
      return contract.getType();
    },
    getData: (ctx) => (_filename, _host?) => {
      const filename = helpers.string(ctx, "filename", _filename);
      const host = _host ? helpers.string(ctx, "host", _host) : ctx.workerScript.hostname;
      const contract = getCodingContract(ctx, host, filename);
      return structuredClone(contract.getData());
    },
    getContract: (ctx) => (_filename, _host?) => {
      const filename = helpers.string(ctx, "filename", _filename);
      const host = _host ? helpers.string(ctx, "host", _host) : ctx.workerScript.hostname;
      const server = helpers.getServer(ctx, host);
      const contract = getCodingContract(ctx, host, filename);
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
    getDescription: (ctx) => (_filename, _host?) => {
      const filename = helpers.string(ctx, "filename", _filename);
      const host = _host ? helpers.string(ctx, "host", _host) : ctx.workerScript.hostname;
      const contract = getCodingContract(ctx, host, filename);
      return contract.getDescription();
    },
    getNumTriesRemaining: (ctx) => (_filename, _host?) => {
      const filename = helpers.string(ctx, "filename", _filename);
      const host = _host ? helpers.string(ctx, "host", _host) : ctx.workerScript.hostname;
      const contract = getCodingContract(ctx, host, filename);
      return contract.getMaxNumTries() - contract.tries;
    },
    createDummyContract: (ctx) => (_type) => {
      const type = getEnumHelper("CodingContractName").nsGetMember(ctx, _type);
      return generateDummyContract(type);
    },
    getContractTypes: () => () => Object.values(CodingContractName),
  };
}
