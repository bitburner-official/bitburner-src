import { BladeburnerContractName } from "@enums";
import { Contract } from "../Actions/Contract";
import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { assertLoadingType } from "../../utils/TypeAssertion";

export function createContracts(): Record<BladeburnerContractName, Contract> {
  return {
    [BladeburnerContractName.Tracking]: new Contract({
      name: BladeburnerContractName.Tracking,
      desc:
        "识别并定位合成人。该合约只涉及侦察与情报收集，切勿交战，隐蔽至关重要。\n" +
        "成功完成该合约将略微提高对当前城市合成人数量的估计精度。",
      successScaling:
        "显著受灵巧和敏捷影响，战斗属性和魅力提供少量加成，不受黑客技能影响。",
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
    [BladeburnerContractName.BountyHunter]: new Contract({
      name: BladeburnerContractName.BountyHunter,
      desc:
        "追捕并捉拿在逃的合成人。这些合成人必须活捉。\n" +
        "成功完成该合约将降低当前城市的合成人数量，并提升其混乱度。",
      successScaling:
        "显著受灵巧和敏捷影响，战斗属性和魅力提供少量加成，不受黑客技能影响。",
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
    [BladeburnerContractName.Retirement]: new Contract({
      name: BladeburnerContractName.Retirement,
      desc:
        "追捕并清除（击杀）失控的合成人。\n" +
        "成功完成该合约将降低当前城市的合成人数量，并提升其混乱度。",
      successScaling: "受战斗属性影响，魅力提供少量加成，不受黑客技能影响。",
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

export function loadContractsData(data: unknown, contracts: Record<BladeburnerContractName, Contract>) {
  // loading data as "unknown" and typechecking it down is probably not necessary
  // but this will prevent crashes even with malformed savedata
  if (data == null || typeof data !== "object" || Array.isArray(data)) {
    return;
  }
  assertLoadingType<Record<BladeburnerContractName, unknown>>(data);
  for (const contractName of Object.values(BladeburnerContractName)) {
    const loadedContract = data[contractName];
    if (!(loadedContract instanceof Contract)) continue;
    contracts[contractName].loadData(loadedContract);
  }
}
