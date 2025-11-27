import { Player } from "@player";
import {
  generateContract,
  generateDummyContract,
  generateRandomContract,
  generateRandomContractOnHome,
  getRandomFilename,
} from "../../../src/CodingContract/ContractGenerator";
import { CodingContractName } from "../../../src/Enums";
import { GetAllServers } from "../../../src/Server/AllServers";
import type { BaseServer } from "../../../src/Server/BaseServer";
import { SpecialServers } from "../../../src/Server/data/SpecialServers";
import { initGameEnvironment, setupBasicTestingEnvironment } from "../Utilities";

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
    generateDummyContract(CodingContractName.FindLargestPrimeFactor);
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
