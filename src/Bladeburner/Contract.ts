import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { Action, IActionParams } from "./Action";
import { Bladeburner } from "./Bladeburner";

export class Contract extends Action {
  constructor(params: IActionParams | null = null) {
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
