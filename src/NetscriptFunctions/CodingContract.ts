import { Player } from "@player";
import { CodingContract } from "../CodingContract/Contract";
import { CodingContractObject, CodingContract as ICodingContract } from "@nsdefs";
import { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { CodingContractName } from "@enums";
import { generateDummyContract } from "../CodingContract/ContractGenerator";
import { isCodingContractName } from "../CodingContract/ContractTypes";
import { type BaseServer } from "../Server/BaseServer";

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
    if (contract.isSolution(answer)) {
      const reward = Player.gainCodingContractReward(contract.reward, contract.getDifficulty());
      helpers.log(ctx, () => `Successfully completed Coding Contract '${contract.fn}'. Reward: ${reward}`);
      server.removeContract(contract.fn);
      return reward;
    }

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

  return {
    attempt: (ctx) => (answer, _filename, _host?) => {
      const filename = helpers.string(ctx, "filename", _filename);
      const host = _host ? helpers.string(ctx, "host", _host) : ctx.workerScript.hostname;
      const contract = getCodingContract(ctx, host, filename);

      if (!contract.isValid(answer))
        throw helpers.errorMessage(
          ctx,
          `Answer is not in the right format for contract '${contract.type}'. Got: ${answer}`,
        );

      const serv = helpers.getServer(ctx, host);
      return attemptContract(ctx, serv, contract, answer);
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
      const type = helpers.string(ctx, "type", _type);
      if (!isCodingContractName(type))
        return helpers.errorMessage(ctx, `The given type is not a valid contract type. Got '${type}'`);
      return generateDummyContract(type);
    },
    getContractTypes: () => () => Object.values(CodingContractName),
  };
}
