import { Bladeburner } from "./Bladeburner";
import { Action, ActionParams } from "./Action";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";

export class Contract extends Action {
  constructor(params: ActionParams | null = null) {
    super(params);
  }

  getActionTypeSkillSuccessBonus(inst: Bladeburner): number {
    return inst.skillMultipliers.successChanceContract;
  }

  toJSON(): IReviverValue {
    return Generic_toJSON("Contract", this);
  }

  static fromJSON(value: IReviverValue): Contract {
    return Generic_fromJSON(Contract, value.data);
  }
}

constructorsForReviver.Contract = Contract;
