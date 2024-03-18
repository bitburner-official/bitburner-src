import type { Sleeve } from "../Sleeve";

import { Player } from "@player";
import { BladeActionType, BladeGeneralActionName } from "@enums";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../../utils/JSONReviver";
import { applySleeveGains, SleeveWorkClass, SleeveWorkType } from "./Work";
import { CONSTANTS } from "../../../Constants";
import { scaleWorkStats } from "../../../Work/WorkStats";
import { getKeyList } from "../../../utils/helpers/getKeyList";
import { ActionIdentifier, loadActionIdentifier } from "../../../Bladeburner/Actions/ActionIdentifier";
import { invalidWork } from "../../../Work/InvalidWork";

interface SleeveBladeburnerWorkParams {
  actionId: ActionIdentifier & { type: BladeActionType.general | BladeActionType.contract };
}

export const isSleeveBladeburnerWork = (w: SleeveWorkClass | null): w is SleeveBladeburnerWork =>
  w?.type === SleeveWorkType.BLADEBURNER;

export class SleeveBladeburnerWork extends SleeveWorkClass {
  type: SleeveWorkType.BLADEBURNER = SleeveWorkType.BLADEBURNER;
  tasksCompleted = 0;
  cyclesWorked = 0;
  actionId: ActionIdentifier & { type: BladeActionType.general | BladeActionType.contract };
  signalCompletion = () => {
    // Intentionally empty function, this is just an initial value and will never be used.
  };
  nextCompletionPromise: Promise<void> | null;

  constructor(params?: SleeveBladeburnerWorkParams) {
    super();
    this.nextCompletionPromise = null;
    this.actionId = params?.actionId ?? { type: BladeActionType.general, name: BladeGeneralActionName.fieldAnalysis };
  }

  cyclesNeeded(sleeve: Sleeve): number {
    const ret = Player.bladeburner?.getActionTimeNetscriptFn(sleeve, this.actionId.type, this.actionId.name);
    if (!ret || typeof ret === "string") throw new Error(`Error querying ${this.actionId.name} time`);
    return ret / CONSTANTS.MilliPerCycle;
  }

  finish() {
    if (this.nextCompletionPromise) this.signalCompletion();
  }

  process(sleeve: Sleeve, cycles: number) {
    if (!Player.bladeburner) return sleeve.stopWork();
    this.cyclesWorked += cycles;
    if (this.actionId.type === BladeActionType.contract) {
      const action = Player.bladeburner.getActionObject(this.actionId);
      if (action.count < 1) return sleeve.stopWork();
    }

    while (this.cyclesWorked >= this.cyclesNeeded(sleeve)) {
      if (this.actionId.type === BladeActionType.contract) {
        const action = Player.bladeburner.getActionObject(this.actionId);
        if (action.count < 1) return sleeve.stopWork();
      }
      const retValue = Player.bladeburner.completeAction(sleeve, this.actionId, false);
      applySleeveGains(sleeve, scaleWorkStats(retValue, sleeve.shockBonus(), false));

      this.tasksCompleted++;
      this.cyclesWorked -= this.cyclesNeeded(sleeve);
      // Resolve and reset nextCompletion promise
      if (this.nextCompletionPromise) this.signalCompletion();
    }
  }
  get nextCompletion(): Promise<void> {
    if (!this.nextCompletionPromise) this.nextCompletionPromise = new Promise((r) => (this.signalCompletion = r));
    return this.nextCompletionPromise;
  }

  APICopy(sleeve: Sleeve) {
    return {
      type: SleeveWorkType.BLADEBURNER as const,
      actionType: this.actionId.type,
      actionName: this.actionId.name,
      tasksCompleted: this.tasksCompleted,
      cyclesWorked: this.cyclesWorked,
      cyclesNeeded: this.cyclesNeeded(sleeve),
      nextCompletion: this.nextCompletion,
    };
  }

  static savedKeys = getKeyList(SleeveBladeburnerWork, { removedKeys: ["signalCompletion", "nextCompletion"] });

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("SleeveBladeburnerWork", this, SleeveBladeburnerWork.savedKeys);
  }

  /** Initializes a BladeburnerWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): SleeveBladeburnerWork {
    const actionId = loadActionIdentifier(value.data?.actionId);
    if (!actionId) return invalidWork();
    value.data.actionId = actionId;
    return Generic_fromJSON(SleeveBladeburnerWork, value.data, SleeveBladeburnerWork.savedKeys);
  }
}

constructorsForReviver.SleeveBladeburnerWork = SleeveBladeburnerWork;
