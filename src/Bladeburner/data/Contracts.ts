import { BladeContractName } from "@enums";
import { Contract } from "../Actions/Contract";
import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
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
        hacking: 0,
        strength: 0.05,
        defense: 0.05,
        dexterity: 0.35,
        agility: 0.35,
        charisma: 0.1,
        intelligence: 0.05,
      },
      decays: {
        hacking: 0,
        strength: 0.91,
        defense: 0.91,
        dexterity: 0.91,
        agility: 0.91,
        charisma: 0.9,
        intelligence: 1,
      },
      isStealth: true,
      growthFunction: () => getRandomIntInclusive(5, 75) / 10,
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
        hacking: 0,
        strength: 0.15,
        defense: 0.15,
        dexterity: 0.25,
        agility: 0.25,
        charisma: 0.1,
        intelligence: 0.1,
      },
      decays: {
        hacking: 0,
        strength: 0.91,
        defense: 0.91,
        dexterity: 0.91,
        agility: 0.91,
        charisma: 0.8,
        intelligence: 0.9,
      },
      isKill: true,
      growthFunction: () => getRandomIntInclusive(5, 75) / 10,
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
        hacking: 0,
        strength: 0.2,
        defense: 0.2,
        dexterity: 0.2,
        agility: 0.2,
        charisma: 0.1,
        intelligence: 0.1,
      },
      decays: {
        hacking: 0,
        strength: 0.91,
        defense: 0.91,
        dexterity: 0.91,
        agility: 0.91,
        charisma: 0.8,
        intelligence: 0.9,
      },
      isKill: true,
      growthFunction: () => getRandomIntInclusive(5, 75) / 10,
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
