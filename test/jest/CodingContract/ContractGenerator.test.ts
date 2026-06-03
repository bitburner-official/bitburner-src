import { Player } from "@player";
import {
  generateContract,
  generateDummyContract,
  generateRandomContract,
  generateRandomContractOnHome,
  getRandomFilename,
  getRandomReward,
  getRandomServer,
} from "../../../src/CodingContract/ContractGenerator";
import { CodingContractName, CompanyName, JobField, JobName } from "../../../src/Enums";
import { GetAllServers } from "../../../src/Server/AllServers";
import type { BaseServer } from "../../../src/Server/BaseServer";
import { SpecialServers } from "../../../src/Server/data/SpecialServers";
import { getNS, initGameEnvironment, setupBasicTestingEnvironment } from "../Utilities";
import { prestigeSourceFile } from "../../../src/Prestige";
import { CodingContractRewardType } from "../../../src/CodingContract/Contract";
import { joinFaction } from "../../../src/Faction/FactionHelpers";
import { Factions } from "../../../src/Faction/Factions";
import { Companies } from "../../../src/Company/Companies";
import { CodingContractTypes } from "../../../src/CodingContract/ContractTypes";
import { getRecordEntries } from "../../../src/Types/Record";
import { Server } from "../../../src/Server/Server";
import { getDarkscapeNavigator } from "../../../src/DarkNet/effects/effects";

beforeAll(() => {
  initGameEnvironment();
});

beforeEach(() => {
  setupBasicTestingEnvironment();
  assertNumberOfContracts(0, GetAllServers());
});

function assertNumberOfContracts(expected: number, servers: BaseServer[]): void {
  expect(servers.reduce((sum, server) => sum + server.contracts.length, 0)).toStrictEqual(expected);
}

describe("Generator", () => {
  test("generateRandomContract", () => {
    generateRandomContract();
    assertNumberOfContracts(1, GetAllServers());
  });
  test("generateRandomContractOnHome", () => {
    generateRandomContractOnHome();
    assertNumberOfContracts(1, [Player.getHomeComputer()]);
  });
  test("generateDummyContract", () => {
    generateDummyContract(CodingContractName.FindLargestPrimeFactor, Player.getHomeComputer());
    assertNumberOfContracts(1, GetAllServers());
  });
  // generateContract is flexible. All properties in IGenerateContractParams are optional. This test checks the usage in
  // CodingContractsDev.tsx.
  test("generateContract - home", () => {
    generateContract({ problemType: CodingContractName.FindLargestPrimeFactor, server: SpecialServers.Home });
    assertNumberOfContracts(1, [Player.getHomeComputer()]);
  });
  // This test checks the case in which we randomize everything (e.g., problemType, server).
  test("generateContract - random server", () => {
    generateContract({});
    assertNumberOfContracts(1, GetAllServers());
  });
  test("getRandomServer", () => {
    Player.sourceFiles.set(9, 3);
    getDarkscapeNavigator();
    const ns = getNS();
    for (let i = 0; i < ns.cloud.getServerLimit(); ++i) {
      ns.cloud.purchaseServer(`pserver-${i}`, 2);
    }
    for (let i = 0; i < ns.hacknet.maxNumNodes(); ++i) {
      ns.hacknet.purchaseNode();
    }
    const testRandomServer = () => {
      const server = getRandomServer();
      if (server === null) {
        throw new Error(`getRandomServer does not return a server`);
      }
      if (
        !(server instanceof Server) ||
        server.purchasedByPlayer ||
        server.hostname === SpecialServers.WorldDaemon ||
        server.serversOnNetwork.length === 0
      ) {
        throw new Error(`getRandomServer returns an invalid server: ${server.hostname}`);
      }
    };

    const spiedMathRandom = jest.spyOn(Math, "random").mockReturnValue(0);
    testRandomServer();
    spiedMathRandom.mockRestore();
    for (let i = 0; i < 10000; ++i) {
      testRandomServer();
    }
  });
});

describe("getRandomFilename", () => {
  test("Check format and collision", () => {
    const server = Player.getHomeComputer();
    const set = new Set();
    // Contract names contain only alphanumeric chars.
    const regex = /[^a-zA-Z0-9]/g;
    const maxIter = 1000;
    for (let i = 0; i < maxIter; ++i) {
      const filename = getRandomFilename(server);
      if (filename == null) {
        throw new Error("Cannot generate random filename");
      }
      expect(filename).toMatch(regex);
      set.add(filename);
    }
    // getRandomFilename had a bug that made the filenames collide much easier than what we expected. Please check
    // https://github.com/bitburner-official/bitburner-src/pull/2399 for more information.
    // This test is designed to catch that kind of bug. The probability of collision is greater than zero, so this test
    // may give a false positive. However, the probability is very low (0.000008802741646607437), and the error log
    // should point that out immediately.
    expect(set.size).toStrictEqual(maxIter);
  });
});

describe("getRandomReward", () => {
  test("Disable money reward when CodingContractMoney BN multiplier is 0", () => {
    Player.bitNodeN = 8;
    prestigeSourceFile(true);
    for (let i = 0; i < 1000; ++i) {
      expect(getRandomReward().type).not.toStrictEqual(CodingContractRewardType.Money);
    }
  });
  test("Have all valid reward types", () => {
    const rewardTypeCounts = [0, 0, 0, 0];
    for (let i = 0; i < 1000; ++i) {
      ++rewardTypeCounts[getRandomReward().type];
    }
    expect(rewardTypeCounts.length).toStrictEqual(4);
    expect(rewardTypeCounts[CodingContractRewardType.FactionReputation]).toBeGreaterThan(0);
    expect(rewardTypeCounts[CodingContractRewardType.FactionReputationAll]).toBeGreaterThan(0);
    expect(rewardTypeCounts[CodingContractRewardType.CompanyReputation]).toBeGreaterThan(0);
    expect(rewardTypeCounts[CodingContractRewardType.Money]).toBeGreaterThan(0);
  });
});

describe("Receive correct reward", () => {
  test("FactionReputation", () => {
    const ns = getNS();
    generateContract({
      problemType: CodingContractName.FindLargestPrimeFactor,
      server: SpecialServers.Home,
      reward: { type: CodingContractRewardType.FactionReputation },
    });
    joinFaction(Factions.CyberSec);
    expect(Factions.CyberSec.playerReputation).toStrictEqual(0);
    const contract = Player.getHomeComputer().contracts[0];
    ns.codingcontract.attempt(contract.getAnswer(), contract.fn);
    expect(Factions.CyberSec.playerReputation).toBeGreaterThan(0);
  });
  test("FactionReputationAll", () => {
    const ns = getNS();
    generateContract({
      problemType: CodingContractName.FindLargestPrimeFactor,
      server: SpecialServers.Home,
      reward: { type: CodingContractRewardType.FactionReputationAll },
    });
    joinFaction(Factions.CyberSec);
    joinFaction(Factions.NiteSec);
    expect(Factions.CyberSec.playerReputation).toStrictEqual(0);
    expect(Factions.NiteSec.playerReputation).toStrictEqual(0);
    const contract = Player.getHomeComputer().contracts[0];
    ns.codingcontract.attempt(contract.getAnswer(), contract.fn);
    expect(Factions.CyberSec.playerReputation).toBeGreaterThan(0);
    expect(Factions.NiteSec.playerReputation).toBeGreaterThan(0);
  });
  test("CompanyReputation", () => {
    const ns = getNS();
    generateContract({
      problemType: CodingContractName.FindLargestPrimeFactor,
      server: SpecialServers.Home,
      reward: { type: CodingContractRewardType.CompanyReputation },
    });
    expect(ns.singularity.applyToCompany(CompanyName.JoesGuns, JobField.employee)).toStrictEqual(JobName.employee);
    expect(Companies[CompanyName.JoesGuns].playerReputation).toStrictEqual(0);
    const contract = Player.getHomeComputer().contracts[0];
    ns.codingcontract.attempt(contract.getAnswer(), contract.fn);
    expect(Companies[CompanyName.JoesGuns].playerReputation).toBeGreaterThan(0);
  });
  test("Money", () => {
    const ns = getNS();
    generateContract({
      problemType: CodingContractName.FindLargestPrimeFactor,
      server: SpecialServers.Home,
      reward: { type: CodingContractRewardType.Money },
    });
    Player.money = 0;
    const contract = Player.getHomeComputer().contracts[0];
    ns.codingcontract.attempt(contract.getAnswer(), contract.fn);
    expect(Player.money).toBeGreaterThan(0);
  });
});

describe("Receive fallback reward", () => {
  test("FactionReputation", () => {
    const ns = getNS();
    generateContract({
      problemType: CodingContractName.FindLargestPrimeFactor,
      server: SpecialServers.Home,
      reward: { type: CodingContractRewardType.FactionReputation },
    });
    expect(Player.factions.length).toStrictEqual(0);
    Player.money = 0;
    const contract = Player.getHomeComputer().contracts[0];
    ns.codingcontract.attempt(contract.getAnswer(), contract.fn);
    expect(Player.money).toBeGreaterThan(0);
  });
  test("FactionReputationAll", () => {
    const ns = getNS();
    generateContract({
      problemType: CodingContractName.FindLargestPrimeFactor,
      server: SpecialServers.Home,
      reward: { type: CodingContractRewardType.FactionReputationAll },
    });
    expect(Player.factions.length).toStrictEqual(0);
    Player.money = 0;
    const contract = Player.getHomeComputer().contracts[0];
    ns.codingcontract.attempt(contract.getAnswer(), contract.fn);
    expect(Player.money).toBeGreaterThan(0);
  });
  test("CompanyReputation", () => {
    const ns = getNS();
    generateContract({
      problemType: CodingContractName.FindLargestPrimeFactor,
      server: SpecialServers.Home,
      reward: { type: CodingContractRewardType.CompanyReputation },
    });
    expect(Object.keys(Player.jobs).length).toStrictEqual(0);
    joinFaction(Factions.CyberSec);
    expect(Factions.CyberSec.playerReputation).toStrictEqual(0);
    const contract = Player.getHomeComputer().contracts[0];
    ns.codingcontract.attempt(contract.getAnswer(), contract.fn);
    expect(Factions.CyberSec.playerReputation).toBeGreaterThan(0);
  });
});

describe("Check getAnswer and solver", () => {
  // These contracts do not give a way to generate the answer.
  const skippedContractTypes = [
    CodingContractName.Proper2ColoringOfAGraph,
    CodingContractName.ShortestPathInAGrid,
    CodingContractName.SquareRoot,
  ];
  for (const [name, cct] of getRecordEntries(CodingContractTypes)) {
    if (skippedContractTypes.includes(name)) {
      continue;
    }
    test(name, () => {
      const state = cct.generate();
      const data = cct.getData ? cct.getData(state) : state;
      const answer = cct.getAnswer(data);
      expect(answer).not.toBeNull();
      expect(cct.solver(state, answer)).toStrictEqual(true);
    });
  }
});
