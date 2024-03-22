import { BladeOperationName } from "@enums";
import { Operation } from "../Actions/Operation";
import { getRandomInt } from "../../utils/helpers/getRandomInt";
import { LevelableActionClass } from "../Actions/LevelableAction";
import { assertLoadingType } from "../../utils/TypeAssertion";

// This is a really weird way to do this, but I didn't see a better way to just export a getter directly while also exporting other stuff.
const toBeExported = {
  get Operations(): Record<BladeOperationName, Operation> {
    return OperationsObject || initOperations();
  },
};
export const Operations = toBeExported.Operations;

// Actual object and initializer are local
let OperationsObject: Record<BladeOperationName, Operation> | null = null;
function initOperations() {
  OperationsObject = {
    [BladeOperationName.investigation]: new Operation({
      name: BladeOperationName.investigation,
      desc:
        "As a field agent, investigate and identify Synthoid populations, movements, and operations.\n\n" +
        "Successful Investigation ops will increase the accuracy of your synthoid data.\n\n" +
        "You will NOT lose HP from failed Investigation ops.",
      baseDifficulty: 400,
      difficultyFac: 1.03,
      rewardFac: 1.07,
      rankGain: 2.2,
      rankLoss: 0.2,
      weights: {
        hack: 0.25,
        str: 0.05,
        def: 0.05,
        dex: 0.2,
        agi: 0.1,
        cha: 0.25,
        int: 0.1,
      },
      decays: {
        hack: 0.85,
        str: 0.9,
        def: 0.9,
        dex: 0.9,
        agi: 0.9,
        cha: 0.7,
        int: 0.9,
      },
      isStealth: true,
      growthFunction: () => getRandomInt(10, 40) / 10,
      maxCount: 100,
    }),
    [BladeOperationName.undercover]: new Operation({
      name: BladeOperationName.undercover,
      desc:
        "Conduct undercover operations to identify hidden and underground Synthoid communities and organizations.\n\n" +
        "Successful Undercover ops will increase the accuracy of your synthoid data.",
      baseDifficulty: 500,
      difficultyFac: 1.04,
      rewardFac: 1.09,
      rankGain: 4.4,
      rankLoss: 0.4,
      hpLoss: 2,
      weights: {
        hack: 0.2,
        str: 0.05,
        def: 0.05,
        dex: 0.2,
        agi: 0.2,
        cha: 0.2,
        int: 0.1,
      },
      decays: {
        hack: 0.8,
        str: 0.9,
        def: 0.9,
        dex: 0.9,
        agi: 0.9,
        cha: 0.7,
        int: 0.9,
      },
      isStealth: true,
      growthFunction: () => getRandomInt(10, 40) / 10,
      maxCount: 100,
    }),
    [BladeOperationName.sting]: new Operation({
      name: BladeOperationName.sting,
      desc: "Conduct a sting operation to bait and capture particularly notorious Synthoid criminals.",
      baseDifficulty: 650,
      difficultyFac: 1.04,
      rewardFac: 1.095,
      rankGain: 5.5,
      rankLoss: 0.5,
      hpLoss: 2.5,
      weights: {
        hack: 0.25,
        str: 0.05,
        def: 0.05,
        dex: 0.25,
        agi: 0.1,
        cha: 0.2,
        int: 0.1,
      },
      decays: {
        hack: 0.8,
        str: 0.85,
        def: 0.85,
        dex: 0.85,
        agi: 0.85,
        cha: 0.7,
        int: 0.9,
      },
      isStealth: true,
      growthFunction: () => getRandomInt(3, 40) / 10,
    }),
    [BladeOperationName.raid]: new Operation({
      name: BladeOperationName.raid,
      desc:
        "Lead an assault on a known Synthoid community. Note that there must be an existing Synthoid community in your " +
        "current city in order for this Operation to be successful.",
      baseDifficulty: 800,
      difficultyFac: 1.045,
      rewardFac: 1.1,
      rankGain: 55,
      rankLoss: 2.5,
      hpLoss: 50,
      weights: {
        hack: 0.1,
        str: 0.2,
        def: 0.2,
        dex: 0.2,
        agi: 0.2,
        cha: 0,
        int: 0.1,
      },
      decays: {
        hack: 0.7,
        str: 0.8,
        def: 0.8,
        dex: 0.8,
        agi: 0.8,
        cha: 0,
        int: 0.9,
      },
      isKill: true,
      growthFunction: () => getRandomInt(2, 40) / 10,
      getAvailability: function (bladeburner) {
        if (bladeburner.getCurrentCity().comms < 1) return { error: "No Synthoid communities in current city" };
        return LevelableActionClass.prototype.getAvailability.call(this, bladeburner);
      },
    }),
    [BladeOperationName.stealthRetirement]: new Operation({
      name: BladeOperationName.stealthRetirement,
      desc:
        "Lead a covert operation to retire Synthoids. The objective is to complete the task without drawing any " +
        "attention. Stealth and discretion are key.",
      baseDifficulty: 1000,
      difficultyFac: 1.05,
      rewardFac: 1.11,
      rankGain: 22,
      rankLoss: 2,
      hpLoss: 10,
      weights: {
        hack: 0.1,
        str: 0.1,
        def: 0.1,
        dex: 0.3,
        agi: 0.3,
        cha: 0,
        int: 0.1,
      },
      decays: {
        hack: 0.7,
        str: 0.8,
        def: 0.8,
        dex: 0.8,
        agi: 0.8,
        cha: 0,
        int: 0.9,
      },
      isStealth: true,
      isKill: true,
      growthFunction: () => getRandomInt(1, 20) / 10,
    }),
    [BladeOperationName.assassination]: new Operation({
      name: BladeOperationName.assassination,
      desc:
        "Assassinate Synthoids that have been identified as important, high-profile social and political leaders in the " +
        "Synthoid communities.",
      baseDifficulty: 1500,
      difficultyFac: 1.06,
      rewardFac: 1.14,
      rankGain: 44,
      rankLoss: 4,
      hpLoss: 5,
      weights: {
        hack: 0.1,
        str: 0.1,
        def: 0.1,
        dex: 0.3,
        agi: 0.3,
        cha: 0,
        int: 0.1,
      },
      decays: {
        hack: 0.6,
        str: 0.8,
        def: 0.8,
        dex: 0.8,
        agi: 0.8,
        cha: 0,
        int: 0.8,
      },
      isStealth: true,
      isKill: true,
      growthFunction: () => getRandomInt(1, 20) / 10,
    }),
  };
  return OperationsObject;
}

export function loadOperationsData(data: unknown, operations: Record<BladeOperationName, Operation>) {
  // loading data as "unknown" and typechecking it down is probably not necessary
  // but this will prevent crashes even with malformed savedata
  if (!data || typeof data !== "object") return;
  assertLoadingType<Record<BladeOperationName, unknown>>(data);
  for (const operationName of Object.values(BladeOperationName)) {
    const loadedOperation = data[operationName];
    if (!(loadedOperation instanceof Operation)) continue;
    operations[operationName].loadData(loadedOperation);
  }
}
