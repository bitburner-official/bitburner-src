import { Player } from "@player";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../../utils/JSONReviver";
import { Sleeve } from "../Sleeve";
import { applySleeveGains, SleeveWorkClass, SleeveWorkType } from "./Work";
import { CONSTANTS } from "../../../Constants";
import { GeneralActions } from "../../../Bladeburner/data/GeneralActions";
import { scaleWorkStats } from "../../../Work/WorkStats";
import { getKeyList } from "../../../utils/helpers/getKeyList";

interface SleeveBladeburnerWorkParams {
  type: "General" | "Contracts";
  name: string;
}

export const isSleeveBladeburnerWork = (w: SleeveWorkClass | null): w is SleeveBladeburnerWork =>
  w !== null && w.type === SleeveWorkType.BLADEBURNER;

export class SleeveBladeburnerWork extends SleeveWorkClass {
  type: SleeveWorkType.BLADEBURNER = SleeveWorkType.BLADEBURNER;
  tasksCompleted = 0;
  cyclesWorked = 0;
  actionType: "General" | "Contracts";
  actionName: string;
  signalCompletion = () => {
    // Intentionally empty function, this is just an initial value and will never be used.
  };
  nextCompletion: Promise<void>;

  constructor(params?: SleeveBladeburnerWorkParams) {
    super();
    this.nextCompletion = new Promise((r) => (this.signalCompletion = r));
    this.actionType = params?.type ?? "General";
    this.actionName = params?.name ?? "Field Analysis";
  }

  cyclesNeeded(sleeve: Sleeve): number {
    const ret = Player.bladeburner?.getActionTimeNetscriptFn(sleeve, this.actionType, this.actionName);
    if (!ret || typeof ret === "string") throw new Error(`Error querying ${this.actionName} time`);
    return ret / CONSTANTS.MilliPerCycle;
  }

  finish() {
    this.signalCompletion();
  }

  process(sleeve: Sleeve, cycles: number) {
    if (!Player.bladeburner) return sleeve.stopWork();
    this.cyclesWorked += cycles;
    const actionIdent = Player.bladeburner.getActionIdFromTypeAndName(this.actionType, this.actionName);
    if (!actionIdent) throw new Error(`Error getting ${this.actionName} action`);
    if (this.actionType === "Contracts") {
      const action = Player.bladeburner.getActionObject(actionIdent);
      if (!action) throw new Error(`Error getting ${this.actionName} action object`);
      if (action.count < 1) return sleeve.stopWork();
    }

    while (this.cyclesWorked >= this.cyclesNeeded(sleeve)) {
      if (this.actionType === "Contracts") {
        const action = Player.bladeburner.getActionObject(actionIdent);
        if (!action) throw new Error(`Error getting ${this.actionName} action object`);
        if (action.count < 1) return sleeve.stopWork();
      }
      const retValue = Player.bladeburner.completeAction(sleeve, actionIdent, false);
      if (this.actionType === "General") {
        const exp = GeneralActions[this.actionName]?.exp;
        if (!exp) throw new Error(`Somehow there was no exp for action ${this.actionType} ${this.actionName}`);
        applySleeveGains(sleeve, scaleWorkStats(exp, sleeve.shockBonus(), false));
      }

      if (this.actionType === "Contracts") {
        applySleeveGains(sleeve, scaleWorkStats(retValue, sleeve.shockBonus(), false));
      }
      this.tasksCompleted++;
      this.cyclesWorked -= this.cyclesNeeded(sleeve);
      // Resolve and reset nextCompletion promise
      const resolver = this.signalCompletion;
      this.nextCompletion = new Promise((r) => (this.signalCompletion = r));
      resolver();
    }
  }

  APICopy(sleeve: Sleeve) {
    return {
      type: SleeveWorkType.BLADEBURNER as const,
      actionType: this.actionType,
      actionName: this.actionName,
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
    return Generic_fromJSON(SleeveBladeburnerWork, value.data, SleeveBladeburnerWork.savedKeys);
  }
}

constructorsForReviver.SleeveBladeburnerWork = SleeveBladeburnerWork;
