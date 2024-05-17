import {
  CodingContract,
  CodingContractRewardType,
  CodingContractTypes,
  ICodingContractReward,
} from "./CodingContracts";
import { currentNodeMults } from "./BitNode/BitNodeMultipliers";
import { Factions } from "./Faction/Factions";
import { Player } from "@player";
import { GetServer, GetAllServers } from "./Server/AllServers";
import { SpecialServers } from "./Server/data/SpecialServers";
import { Server } from "./Server/Server";
import { BaseServer } from "./Server/BaseServer";

import { getRandomIntInclusive } from "./utils/helpers/getRandomIntInclusive";
import { ContractFilePath, resolveContractFilePath } from "./Paths/ContractFilePath";

export function generateRandomContract(): void {
  // First select a random problem type
  const problemType = getRandomProblemType();

  // Then select a random reward type. 'Money' will always be the last reward type
  const reward = getRandomReward();

  // Choose random server
  const randServer = getRandomServer();

  const contractFn = getRandomFilename(randServer, reward);
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

  const contractFn = getRandomFilename(serv, reward);
  const contract = new CodingContract(contractFn, problemType, reward);

  serv.addContract(contract);
}

export const generateDummyContract = (problemType: string): string => {
  if (!CodingContractTypes[problemType]) throw new Error(`Invalid problem type: '${problemType}'`);
  const serv = Player.getHomeComputer();

  const contractFn = getRandomFilename(serv);
  const contract = new CodingContract(contractFn, problemType, null);
  serv.addContract(contract);

  return contractFn;
};

interface IGenerateContractParams {
  problemType?: string;
  server?: string;
  fn?: ContractFilePath;
}

export function generateContract(params: IGenerateContractParams): void {
  // Problem Type
  let problemType;
  const problemTypes = Object.keys(CodingContractTypes);
  if (params.problemType && problemTypes.includes(params.problemType)) {
    problemType = params.problemType;
  } else {
    problemType = getRandomProblemType();
  }

  // Reward Type - This is always random for now
  const reward = getRandomReward();

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

  const filename = params.fn ? params.fn : getRandomFilename(server, reward);

  const contract = new CodingContract(filename, problemType, reward);
  server.addContract(contract);
}

// Ensures that a contract's reward type is valid
function sanitizeRewardType(rewardType: CodingContractRewardType): CodingContractRewardType {
  let type = rewardType; // Create copy

  const factionsThatAllowHacking = Player.factions.filter((fac) => {
    try {
      return Factions[fac].getInfo().offerHackingWork;
    } catch (e) {
      console.error(`Error when trying to filter Hacking Factions for Coding Contract Generation: ${e}`);
      return false;
    }
  });
  if (type === CodingContractRewardType.FactionReputation && factionsThatAllowHacking.length === 0) {
    type = CodingContractRewardType.CompanyReputation;
  }
  if (type === CodingContractRewardType.FactionReputationAll && factionsThatAllowHacking.length === 0) {
    type = CodingContractRewardType.CompanyReputation;
  }
  if (type === CodingContractRewardType.CompanyReputation && Object.keys(Player.jobs).length === 0) {
    type = CodingContractRewardType.Money;
  }

  return type;
}

function getRandomProblemType(): string {
  const problemTypes = Object.keys(CodingContractTypes);
  const randIndex = getRandomIntInclusive(0, problemTypes.length - 1);

  return problemTypes[randIndex];
}

function getRandomReward(): ICodingContractReward {
  // Don't offer money reward by default if BN multiplier is 0 (e.g. BN8)
  const rewardTypeUpperBound =
    currentNodeMults.CodingContractMoney === 0 ? CodingContractRewardType.Money - 1 : CodingContractRewardType.Money;
  const rewardType = sanitizeRewardType(getRandomIntInclusive(0, rewardTypeUpperBound));

  // Add additional information based on the reward type
  const factionsThatAllowHacking = Player.factions.filter((fac) => Factions[fac].getInfo().offerHackingWork);

  switch (rewardType) {
    case CodingContractRewardType.FactionReputation: {
      // Get a random faction that player is a part of. That
      // faction must allow hacking contracts
      const numFactions = factionsThatAllowHacking.length;
      // This check is unnecessary because sanitizeRewardType ensures that it won't happen. However, I'll still leave
      // it here, just in case somebody else changes sanitizeRewardType without taking account of this check.
      if (numFactions > 0) {
        const randFaction = factionsThatAllowHacking[getRandomIntInclusive(0, numFactions - 1)];
        return { type: rewardType, name: randFaction };
      }
      return { type: CodingContractRewardType.Money };
    }
    case CodingContractRewardType.CompanyReputation: {
      const allJobs = Object.keys(Player.jobs);
      // This check is also unnecessary. Check the comment above.
      if (allJobs.length > 0) {
        return {
          type: CodingContractRewardType.CompanyReputation,
          name: allJobs[getRandomIntInclusive(0, allJobs.length - 1)],
        };
      }
      return { type: CodingContractRewardType.Money };
    }
    default:
      return { type: rewardType };
  }
}

function getRandomServer(): BaseServer {
  const servers = GetAllServers().filter((server: BaseServer) => server.serversOnNetwork.length !== 0);
  let randIndex = getRandomIntInclusive(0, servers.length - 1);
  let randServer = servers[randIndex];

  // An infinite loop shouldn't ever happen, but to be safe we'll use
  // a for loop with a limited number of tries
  for (let i = 0; i < 200; ++i) {
    if (
      randServer instanceof Server &&
      !randServer.purchasedByPlayer &&
      randServer.hostname !== SpecialServers.WorldDaemon
    ) {
      break;
    }
    randIndex = getRandomIntInclusive(0, servers.length - 1);
    randServer = servers[randIndex];
  }

  return randServer;
}

function getRandomFilename(
  server: BaseServer,
  reward: ICodingContractReward = { type: CodingContractRewardType.Money },
): ContractFilePath {
  let contractFn = `contract-${getRandomIntInclusive(0, 1e6)}`;

  for (let i = 0; i < 1000; ++i) {
    if (
      server.contracts.filter((c: CodingContract) => {
        return c.fn === contractFn;
      }).length <= 0
    ) {
      break;
    }
    contractFn = `contract-${getRandomIntInclusive(0, 1e6)}`;
  }

  if ("name" in reward) {
    // Only alphanumeric characters in the reward name.
    contractFn += `-${reward.name.replace(/[^a-zA-Z0-9]/g, "")}`;
  }
  contractFn += ".cct";
  const validatedPath = resolveContractFilePath(contractFn);
  if (!validatedPath) throw new Error(`Generated contract path could not be validated: ${contractFn}`);
  return validatedPath;
}
