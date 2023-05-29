import { Player } from "@player";

import { GeneralActions } from "../../../Bladeburner/data/GeneralActions";
import { CONSTANTS } from "../../../Constants";
import { scaleWorkStats } from "../../../Work/WorkStats";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../../utils/JSONReviver";
import { Sleeve } from "../Sleeve";
import { Work, WorkType, applySleeveGains } from "./Work";

interface SleeveBladeburnerWorkParams {
  type: "General" | "Contracts";
  name: string;
}

export const isSleeveBladeburnerWork = (w: Work | null): w is SleeveBladeburnerWork =>
  w !== null && w.type === WorkType.BLADEBURNER;

export class SleeveBladeburnerWork extends Work {
  type: WorkType.BLADEBURNER = WorkType.BLADEBURNER;
  cyclesWorked = 0;
  actionType: "General" | "Contracts";
  actionName: string;

  constructor(params?: SleeveBladeburnerWorkParams) {
    super();
    this.actionType = params?.type ?? "General";
    this.actionName = params?.name ?? "Field Analysis";
  }

  cyclesNeeded(sleeve: Sleeve): number {
    const ret = Player.bladeburner?.getActionTimeNetscriptFn(sleeve, this.actionType, this.actionName);
    if (!ret || typeof ret === "string") throw new Error(`Error querying ${this.actionName} time`);
    return ret / CONSTANTS.MilliPerCycle;
  }

  process(sleeve: Sleeve, cycles: number) {
    if (!Player.bladeburner) return sleeve.stopWork();
    this.cyclesWorked += cycles;
    const actionIdent = Player.bladeburner.getActionIdFromTypeAndName(this.actionType, this.actionName);
    if (!actionIdent) throw new Error(`Error getting ${this.actionName} action`);
    if (this.actionType === "Contracts") {
      const action = Player.bladeburner.getActionObject(actionIdent);
      if (!action) throw new Error(`Error getting ${this.actionName} action object`);
      if (action.count <= 0) return sleeve.stopWork();
    }

    while (this.cyclesWorked > this.cyclesNeeded(sleeve)) {
      if (this.actionType === "Contracts") {
        const action = Player.bladeburner.getActionObject(actionIdent);
        if (!action) throw new Error(`Error getting ${this.actionName} action object`);
        if (action.count <= 0) return sleeve.stopWork();
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
      this.cyclesWorked -= this.cyclesNeeded(sleeve);
    }
  }

  APICopy(sleeve: Sleeve) {
    return {
      type: WorkType.BLADEBURNER as "BLADEBURNER",
      actionType: this.actionType,
      actionName: this.actionName,
      cyclesWorked: this.cyclesWorked,
      cyclesNeeded: this.cyclesNeeded(sleeve),
    };
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("SleeveBladeburnerWork", this);
  }

  /** Initializes a BladeburnerWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): SleeveBladeburnerWork {
    return Generic_fromJSON(SleeveBladeburnerWork, value.data);
  }
}

constructorsForReviver.SleeveBladeburnerWork = SleeveBladeburnerWork;
