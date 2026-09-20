import { CodingContract, CodingContractRewardType, ICodingContractReward } from "./Contract";
import { CodingContractTypes } from "./ContractTypes";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { Player } from "@player";
import { CodingContractName } from "@enums";
import { GetServer, GetAllServers } from "../Server/AllServers";
import { SpecialServers } from "../Server/data/SpecialServers";
import { Server } from "../Server/Server";
import { BaseServer } from "../Server/BaseServer";

import { getRandomIntInclusive } from "../utils/helpers/getRandomIntInclusive";
import { ContractFilePath, resolveContractFilePath } from "../Paths/ContractFilePath";
import { clampNumber } from "../utils/helpers/clampNumber";
import { getRandomAlphanumericString } from "../utils/StringHelperFunctions";

export function tryGeneratingRandomContract(numberOfTries: number): void {
  /**
   * We try to generate contracts three times every 10 minutes. 1576800 is the number of tries in 10 years. There is no
   * reason to support anything above that. We tested this number (1576800) on a very old machine. It took only ~300ms
   * to loop 1576800 times and generate ~10103 contracts on that machine.
   */
  numberOfTries = clampNumber(Math.floor(numberOfTries), 0, 1576800);
  if (numberOfTries < 1) {
    return;
  }
  let currentNumberOfContracts = GetAllServers().reduce((sum, server) => {
    return sum + server.contracts.length;
  }, 0);
  for (let i = 0; i < numberOfTries; ++i) {
    const random = Math.random();
    /**
     * When currentNumberOfContracts is small, the probability is ~0.25. 25% is the "reasonable" chance of getting a
     * contract in normal situations (low currentNumberOfContracts). We have used this probability for a long time as a
     * constant before we decide to switch to a new function that is based on currentNumberOfContracts.
     *
     * This function was chosen due to these characteristics:
     * - The probability is exactly 0.25 if currentNumberOfContracts is 0.
     * - The probability is ~0.25 if currentNumberOfContracts is small (near 0).
     * - The probability approaches 0 when currentNumberOfContracts becomes unusually large:
     *   - If currentNumberOfContracts is 2500, the probability is 0.23861.
     *   - If currentNumberOfContracts is 5000, the probability is 0.12462.
     *   - If currentNumberOfContracts is 7500, the probability is 0.01176.
     *   - If currentNumberOfContracts is 10000, the probability is 0.0006129.
     *
     * With this function, we ensure that:
     * - The player gets a reasonable amount of contracts in normal situations.
     * - If the offline time is unusually large (being offline for years, editing save file, tampering function prototype,
     * etc.), the game will not hang when it tries to generate contracts.
     *
     * These are some data points for reference:
     * - 1 month: ~3157 contracts.
     * - 3 months: ~6198 contracts.
     * - 6 months: ~7231 contracts.
     * - 12 months: ~8003 contracts.
     * - 2 years: ~8687 contracts.
     * - 5 years: ~9506 contracts.
     * - 10 years: ~10103 contracts.
     * - 25 years: ~10879 contracts.
     * - 50 years: ~11461 contracts.
     *
     * Those numbers mean that if the player does not have any contracts and is online (or loads a save file with
     * equivalent offline time) for X months/years, they will have ~Y contracts.
     */
    if (random > 100 / (399 + Math.exp(0.0012 * currentNumberOfContracts))) {
      continue;
    }
    generateRandomContract();
    ++currentNumberOfContracts;
  }
}

export function generateRandomContract(): void {
  // Choose random server
  const randServer = getRandomServer();
  if (randServer === null) {
    return;
  }
  // Then select a random reward type. 'Money' will always be the last reward type
  const reward = getRandomReward();

  // Finally select a random problem type.
  // Difficulty is capped to not overwhelm a new player.
  const totalSFs = [...Player.sourceFiles].reduce<number>((total, [__bn, lvl]) => (total += lvl), 0);
  const maxDif = 2 * totalSFs + 1;

  const problemType = getRandomProblemType(maxDif);

  const contractFn = getRandomFilename(randServer);
  if (contractFn == null) {
    return;
  }
  const contract = new CodingContract(contractFn, problemType, reward);

  randServer.addContract(contract);
}

export function generateRandomContractOnHome(): void {
  // First select a random problem type
  const problemType = getRandomProblemType();

  // Then select a random reward type. 'Money' will always be the last reward type
  const reward = getRandomReward();

  // Choose random server
  const serv = Player.getHomeComputer();

  const contractFn = getRandomFilename(serv);
  if (contractFn == null) {
    return;
  }
  const contract = new CodingContract(contractFn, problemType, reward);

  serv.addContract(contract);
}

export const generateDummyContract = (problemType: CodingContractName, server: BaseServer): string | null => {
  if (!CodingContractTypes[problemType]) throw new Error(`Invalid problem type: '${problemType}'`);

  const contractFn = getRandomFilename(server);
  if (contractFn == null) {
    return null;
  }
  const contract = new CodingContract(contractFn, problemType, null);
  server.addContract(contract);

  return contractFn;
};

interface IGenerateContractParams {
  problemType?: CodingContractName;
  server?: string;
  reward?: ICodingContractReward;
  rewardScaling?: number;
}

export function generateContract(params: IGenerateContractParams): ContractFilePath | null {
  // Problem Type
  let problemType;
  const problemTypes = Object.keys(CodingContractTypes);
  if (params.problemType && problemTypes.includes(params.problemType)) {
    problemType = params.problemType;
  } else {
    problemType = getRandomProblemType();
  }

  // Reward Type
  const reward = params.reward ?? getRandomReward();

  // Server
  let server;
  if (params.server != null) {
    server = GetServer(params.server);
    if (server == null) {
      server = getRandomServer();
    }
  } else {
    server = getRandomServer();
  }
  if (server === null) {
    return null;
  }

  const filename = getRandomFilename(server);
  if (filename == null) {
    return null;
  }
  const contract = new CodingContract(filename, problemType, reward, params.rewardScaling);
  server.addContract(contract);
  return contract.fn;
}

function getRandomProblemType(maxDif = 10): CodingContractName {
  const problemTypes = Object.values(CodingContractName).filter((x) => CodingContractTypes[x].difficulty <= maxDif);
  const randIndex = getRandomIntInclusive(0, problemTypes.length - 1);

  return problemTypes[randIndex];
}

export function getRandomReward(): ICodingContractReward {
  const validRewardTypes = [
    CodingContractRewardType.FactionReputation,
    CodingContractRewardType.FactionReputationAll,
    CodingContractRewardType.CompanyReputation,
  ];
  // Don't offer money reward by default if BN multiplier is 0 (e.g. BN8)
  if (currentNodeMults.CodingContractMoney > 0) {
    validRewardTypes.push(CodingContractRewardType.Money);
  }
  return { type: getRandomIntInclusive(0, validRewardTypes.length - 1) };
}

export function getRandomServer(): BaseServer | null {
  const servers = GetAllServers().filter(
    (server: BaseServer) =>
      server instanceof Server &&
      !server.purchasedByPlayer &&
      server.hostname !== SpecialServers.WorldDaemon &&
      server.serversOnNetwork.length !== 0,
  );
  if (servers.length === 0) {
    return null;
  }
  return servers[getRandomIntInclusive(0, servers.length - 1)];
}

/**
 * This function will return null if the randomized name collides with another contract's name on the specified server.
 * Callers of this function must return early and not generate a contract when it happens. It likely happens when there
 * are ~240k contracts on the specified server.
 */
export function getRandomFilename(server: BaseServer): ContractFilePath | null {
  const contractFn = `contract-${getRandomAlphanumericString(6)}.cct`;
  // Return null if there is a contract with the same name.
  if (server.contracts.filter((c: CodingContract) => c.fn === contractFn).length) {
    return null;
  }
  const validatedPath = resolveContractFilePath(contractFn);
  if (!validatedPath) throw new Error(`Generated contract path could not be validated: ${contractFn}`);
  return validatedPath;
}
