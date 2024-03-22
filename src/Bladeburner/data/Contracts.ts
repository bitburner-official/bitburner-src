import { BladeContractName } from "@enums";
import { Contract } from "../Actions/Contract";
import { getRandomInt } from "../../utils/helpers/getRandomInt";
import { assertLoadingType } from "../../utils/TypeAssertion";

export function createContracts(): Record<BladeContractName, Contract> {
  return {
    [BladeContractName.tracking]: new Contract({
      name: BladeContractName.tracking,
      desc:
        "Identify and locate Synthoids. This contract involves reconnaissance and information-gathering ONLY. Do NOT " +
        "engage. Stealth is of the utmost importance.\n\n" +
        "Successfully completing Tracking contracts will slightly improve your Synthoid population estimate for whatever " +
        "city you are currently in.",
      baseDifficulty: 125,
      difficultyFac: 1.02,
      rewardFac: 1.041,
      rankGain: 0.3,
      hpLoss: 0.5,
      weights: {
        hack: 0,
        str: 0.05,
        def: 0.05,
        dex: 0.35,
        agi: 0.35,
        cha: 0.1,
        int: 0.05,
      },
      decays: {
        hack: 0,
        str: 0.91,
        def: 0.91,
        dex: 0.91,
        agi: 0.91,
        cha: 0.9,
        int: 1,
      },
      isStealth: true,
      growthFunction: () => getRandomInt(5, 75) / 10,
      minCount: 25,
    }),
    [BladeContractName.bountyHunter]: new Contract({
      name: BladeContractName.bountyHunter,
      desc:
        "Hunt down and capture fugitive Synthoids. These Synthoids are wanted alive.\n\n" +
        "Successfully completing a Bounty Hunter contract will lower the population in your current city, and will also " +
        "increase its chaos level.",
      baseDifficulty: 250,
      difficultyFac: 1.04,
      rewardFac: 1.085,
      rankGain: 0.9,
      hpLoss: 1,
      weights: {
        hack: 0,
        str: 0.15,
        def: 0.15,
        dex: 0.25,
        agi: 0.25,
        cha: 0.1,
        int: 0.1,
      },
      decays: {
        hack: 0,
        str: 0.91,
        def: 0.91,
        dex: 0.91,
        agi: 0.91,
        cha: 0.8,
        int: 0.9,
      },
      isKill: true,
      growthFunction: () => getRandomInt(5, 75) / 10,
      minCount: 5,
    }),
    [BladeContractName.retirement]: new Contract({
      name: BladeContractName.retirement,
      desc:
        "Hunt down and retire (kill) rogue Synthoids.\n\n" +
        "Successfully completing a Retirement contract will lower the population in your current city, and will also " +
        "increase its chaos level.",
      baseDifficulty: 200,
      difficultyFac: 1.03,
      rewardFac: 1.065,
      rankGain: 0.6,
      hpLoss: 1,
      weights: {
        hack: 0,
        str: 0.2,
        def: 0.2,
        dex: 0.2,
        agi: 0.2,
        cha: 0.1,
        int: 0.1,
      },
      decays: {
        hack: 0,
        str: 0.91,
        def: 0.91,
        dex: 0.91,
        agi: 0.91,
        cha: 0.8,
        int: 0.9,
      },
      isKill: true,
      growthFunction: () => getRandomInt(5, 75) / 10,
      minCount: 5,
    }),
  };
}

export function loadContractsData(data: unknown, contracts: Record<BladeContractName, Contract>) {
  // loading data as "unknown" and typechecking it down is probably not necessary
  // but this will prevent crashes even with malformed savedata
  if (!data || typeof data !== "object") return;
  assertLoadingType<Record<BladeContractName, unknown>>(data);
  for (const contractName of Object.values(BladeContractName)) {
    const loadedContract = data[contractName];
    if (!(loadedContract instanceof Contract)) continue;
    contracts[contractName].loadData(loadedContract);
  }
}
