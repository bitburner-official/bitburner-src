import { BladeburnerOperationName } from "@enums";
import { Operation } from "../Actions/Operation";
import { getRandomIntInclusive } from "../../utils/helpers/getRandomIntInclusive";
import { LevelableActionClass } from "../Actions/LevelableAction";
import { assertLoadingType } from "../../utils/TypeAssertion";

export function createOperations(): Record<BladeburnerOperationName, Operation> {
  return {
    [BladeburnerOperationName.Investigation]: new Operation({
      name: BladeburnerOperationName.Investigation,
      desc:
        "作为外勤特工，调查并确认合成人的数量、动向与行动。\n" +
        "成功完成调查行动将提高合成人数据的准确度。\n" +
        "调查行动失败不会损失生命值。",
      successScaling: "显著受黑客技能和魅力影响，战斗属性提供少量加成。",
      baseDifficulty: 400,
      difficultyFac: 1.03,
      rewardFac: 1.07,
      rankGain: 2.2,
      rankLoss: 0.2,
      weights: {
        hacking: 0.25,
        strength: 0.05,
        defense: 0.05,
        dexterity: 0.2,
        agility: 0.1,
        charisma: 0.25,
        intelligence: 0.1,
      },
      decays: {
        hacking: 0.85,
        strength: 0.9,
        defense: 0.9,
        dexterity: 0.9,
        agility: 0.9,
        charisma: 0.7,
        intelligence: 0.9,
      },
      isStealth: true,
      growthFunction: () => getRandomIntInclusive(10, 40) / 10,
      maxCount: 100,
    }),
    [BladeburnerOperationName.Undercover]: new Operation({
      name: BladeburnerOperationName.Undercover,
      desc:
        "执行卧底行动，查明隐匿的地下合成人社区与组织。\n" +
        "成功完成卧底行动将提高合成人数据的准确度。",
      successScaling: "受黑客技能、灵巧、敏捷和魅力影响，防御和力量提供少量加成。",
      baseDifficulty: 500,
      difficultyFac: 1.04,
      rewardFac: 1.09,
      rankGain: 4.4,
      rankLoss: 0.4,
      hpLoss: 2,
      weights: {
        hacking: 0.2,
        strength: 0.05,
        defense: 0.05,
        dexterity: 0.2,
        agility: 0.2,
        charisma: 0.2,
        intelligence: 0.1,
      },
      decays: {
        hacking: 0.8,
        strength: 0.9,
        defense: 0.9,
        dexterity: 0.9,
        agility: 0.9,
        charisma: 0.7,
        intelligence: 0.9,
      },
      isStealth: true,
      growthFunction: () => getRandomIntInclusive(10, 40) / 10,
      maxCount: 100,
    }),
    [BladeburnerOperationName.Sting]: new Operation({
      name: BladeburnerOperationName.Sting,
      desc:
        "执行诱捕行动，引诱并抓捕恶名昭彰的合成人罪犯。\n" +
        "完成该行动将提升当前城市的混乱度。若成功完成，还会降低当前城市的合成人数量。",
      warning: "该行动会按百分比减少人口。",
      successScaling: "显著受黑客技能和灵巧影响，魅力提供大量加成，战斗属性提供少量加成。",
      baseDifficulty: 650,
      difficultyFac: 1.04,
      rewardFac: 1.095,
      rankGain: 5.5,
      rankLoss: 0.5,
      hpLoss: 2.5,
      weights: {
        hacking: 0.25,
        strength: 0.05,
        defense: 0.05,
        dexterity: 0.25,
        agility: 0.1,
        charisma: 0.2,
        intelligence: 0.1,
      },
      decays: {
        hacking: 0.8,
        strength: 0.85,
        defense: 0.85,
        dexterity: 0.85,
        agility: 0.85,
        charisma: 0.7,
        intelligence: 0.9,
      },
      isStealth: true,
      growthFunction: () => getRandomIntInclusive(3, 40) / 10,
    }),
    [BladeburnerOperationName.Raid]: new Operation({
      name: BladeburnerOperationName.Raid,
      desc:
        "率领突袭，攻击已知的合成人社区。注意：当前城市中必须存在合成人社区，该行动才可能成功。\n" +
        "完成该行动将降低当前城市的合成人数量，并提升其混乱度。",
      warning: "该行动会按百分比减少人口并增加混乱度。",
      successScaling: "受战斗属性影响，黑客技能提供少量加成，不受魅力影响。",
      baseDifficulty: 800,
      difficultyFac: 1.045,
      rewardFac: 1.1,
      rankGain: 55,
      rankLoss: 2.5,
      hpLoss: 50,
      weights: {
        hacking: 0.1,
        strength: 0.2,
        defense: 0.2,
        dexterity: 0.2,
        agility: 0.2,
        charisma: 0,
        intelligence: 0.1,
      },
      decays: {
        hacking: 0.7,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.9,
      },
      isKill: true,
      growthFunction: () => getRandomIntInclusive(2, 40) / 10,
      getAvailability: function (bladeburner) {
        if (bladeburner.getCurrentCity().comms < 1) return { error: "当前城市没有合成人社区" };
        return LevelableActionClass.prototype.getAvailability.call(this, bladeburner);
      },
    }),
    [BladeburnerOperationName.StealthRetirement]: new Operation({
      name: BladeburnerOperationName.StealthRetirement,
      desc:
        "领导一次秘密行动来清除合成人。目标是在不引起任何注意的情况下完成任务，隐蔽与谨慎是关键。\n" +
        "完成该行动将降低当前城市的混乱度。若成功完成，还会降低当前城市的合成人数量。",
      warning: "该行动会按百分比减少人口。",
      successScaling:
        "显著受灵巧和敏捷影响，战斗属性和黑客技能提供少量加成，不受魅力影响。",
      baseDifficulty: 1000,
      difficultyFac: 1.05,
      rewardFac: 1.11,
      rankGain: 22,
      rankLoss: 2,
      hpLoss: 10,
      weights: {
        hacking: 0.1,
        strength: 0.1,
        defense: 0.1,
        dexterity: 0.3,
        agility: 0.3,
        charisma: 0,
        intelligence: 0.1,
      },
      decays: {
        hacking: 0.7,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.9,
      },
      isStealth: true,
      isKill: true,
      growthFunction: () => getRandomIntInclusive(1, 20) / 10,
    }),
    [BladeburnerOperationName.Assassination]: new Operation({
      name: BladeburnerOperationName.Assassination,
      desc:
        "暗杀已被确认为合成人社区中重要且知名的社会与政治领袖的合成人。\n" +
        "完成该行动可能会提升当前城市的混乱度。若成功完成，还会降低当前城市的合成人数量。",
      warning: "该行动可能按百分比增加混乱度。",
      successScaling:
        "显著受灵巧和敏捷影响，战斗属性和黑客技能提供少量加成。\n" +
        "不受魅力影响。",
      baseDifficulty: 1500,
      difficultyFac: 1.06,
      rewardFac: 1.14,
      rankGain: 44,
      rankLoss: 4,
      hpLoss: 5,
      weights: {
        hacking: 0.1,
        strength: 0.1,
        defense: 0.1,
        dexterity: 0.3,
        agility: 0.3,
        charisma: 0,
        intelligence: 0.1,
      },
      decays: {
        hacking: 0.6,
        strength: 0.8,
        defense: 0.8,
        dexterity: 0.8,
        agility: 0.8,
        charisma: 0,
        intelligence: 0.8,
      },
      isStealth: true,
      isKill: true,
      growthFunction: () => getRandomIntInclusive(1, 20) / 10,
    }),
  };
}

export function loadOperationsData(data: unknown, operations: Record<BladeburnerOperationName, Operation>) {
  // loading data as "unknown" and typechecking it down is probably not necessary
  // but this will prevent crashes even with malformed savedata
  if (data == null || typeof data !== "object" || Array.isArray(data)) {
    return;
  }
  assertLoadingType<Record<BladeburnerOperationName, unknown>>(data);
  for (const operationName of Object.values(BladeburnerOperationName)) {
    const loadedOperation = data[operationName];
    if (!(loadedOperation instanceof Operation)) continue;
    operations[operationName].loadData(loadedOperation);
  }
}
