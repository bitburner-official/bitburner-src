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
        "As a field agent, investigate and identify Synthoid populations, movements, and operations.\n" +
        "Successful Investigation ops will increase the accuracy of your synthoid data.\n" +
        "You will NOT lose HP from failed Investigation ops.",
      successScaling: "Significantly affected by Hacking skill and Charisma. Minor bonus from combat stats.",
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
        "Conduct undercover operations to identify hidden and underground Synthoid communities and organizations.\n" +
        "Successful Undercover ops will increase the accuracy of your synthoid data.",
      successScaling:
        "Affected by Hacking skill, Dexterity, Agility and Charisma. Minor bonus from Defense and Strength.",
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
        "Conduct a sting operation to bait and capture particularly notorious Synthoid criminals.\n" +
        "Completing this operation will increase the chaos level of your current city. If you complete it successfully, it will decrease the Synthoid population of your current city.",
      warning: "This action decreases population by percentage.",
      successScaling:
        "Significantly affected by Hacking skill and Dexterity. Major bonus from Charisma. Minor bonus from combat stats.",
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
        "Lead an assault on a known Synthoid community. Note that there must be an existing Synthoid community in your " +
        "current city in order for this Operation to be successful.\n" +
        "Completing this operation will decrease the Synthoid population of your current city and increase its chaos level.",
      warning: "This action decreases population and increases chaos by percentage.",
      successScaling: "Affected by combat stats. Minor bonus from Hacking skill. Unaffected by Charisma.",
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
        if (bladeburner.getCurrentCity().comms < 1) return { error: "No Synthoid communities in current city" };
        return LevelableActionClass.prototype.getAvailability.call(this, bladeburner);
      },
    }),
    [BladeburnerOperationName.StealthRetirement]: new Operation({
      name: BladeburnerOperationName.StealthRetirement,
      desc:
        "Lead a covert operation to retire Synthoids. The objective is to complete the task without drawing any " +
        "attention. Stealth and discretion are key.\n" +
        "Completing this operation will DECREASE the chaos level of your current city. If you complete it successfully, it will decrease the Synthoid population of your current city.",
      warning: "This action decreases population by percentage.",
      successScaling:
        "Significantly affected by Dexterity and Agility. Minor bonus from combat stats and Hacking skill. Unaffected by Charisma.",
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
        "Assassinate Synthoids that have been identified as important, high-profile social and political leaders in the " +
        "Synthoid communities.\n" +
        "Completing this operation may increase the chaos level of your current city. If you complete it successfully, it will decrease the Synthoid population of your current city.",
      warning: "This action may increase chaos by percentage.",
      successScaling:
        "Significantly affected by Dexterity and Agility. Minor bonus from combat stats and Hacking skill.\n" +
        "Unaffected by Charisma.",
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
  if (!data || typeof data !== "object") return;
  assertLoadingType<Record<BladeburnerOperationName, unknown>>(data);
  for (const operationName of Object.values(BladeburnerOperationName)) {
    const loadedOperation = data[operationName];
    if (!(loadedOperation instanceof Operation)) continue;
    operations[operationName].loadData(loadedOperation);
  }
}
