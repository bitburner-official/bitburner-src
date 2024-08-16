import type { Sleeve } from "../Sleeve";
import type { ActionIdentifier } from "../../../Bladeburner/Types";
import type { PromisePair } from "../../../Types/Promises";
import { Player } from "@player";
import { BladeActionType, BladeGeneralActionName } from "@enums";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../../utils/JSONReviver";
import { applySleeveGains, SleeveWorkClass, SleeveWorkType } from "./Work";
import { CONSTANTS } from "../../../Constants";
import { scaleWorkStats } from "../../../Work/WorkStats";
import { getKeyList } from "../../../utils/helpers/getKeyList";
import { loadActionIdentifier } from "../../../Bladeburner/utils/loadActionIdentifier";
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
  nextCompletionPair: PromisePair<void> = { promise: null, resolve: null };

  constructor(params?: SleeveBladeburnerWorkParams) {
    super();
    this.actionId = params?.actionId ?? { type: BladeActionType.general, name: BladeGeneralActionName.fieldAnalysis };
  }

  cyclesNeeded(sleeve: Sleeve): number {
    if (!Player.bladeburner) return Infinity;
    const action = Player.bladeburner.getActionObject(this.actionId);
    const timeInMs = action.getActionTime(Player.bladeburner, sleeve) * 1000;
    return timeInMs / CONSTANTS.MilliPerCycle;
  }

  finish() {
    if (this.nextCompletionPair.resolve) {
      this.nextCompletionPair.resolve();
      this.nextCompletionPair.resolve = null;
      this.nextCompletionPair.promise = null;
    }
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
      this.finish();
    }
  }
  get nextCompletion(): Promise<void> {
    if (!this.nextCompletionPair.promise)
      this.nextCompletionPair.promise = new Promise((r) => (this.nextCompletionPair.resolve = r));
    return this.nextCompletionPair.promise;
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

  static savedKeys = getKeyList(SleeveBladeburnerWork, { removedKeys: ["nextCompletionPair"] });

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
