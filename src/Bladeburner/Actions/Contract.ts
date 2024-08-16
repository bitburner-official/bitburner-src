import type { Bladeburner } from "../Bladeburner";
import type { ActionIdentifier } from "../Types";

import { Generic_fromJSON, IReviverValue, constructorsForReviver } from "../../utils/JSONReviver";
import { BladeburnerActionType, BladeburnerContractName, BladeburnerMultName } from "../Enums";
import { LevelableActionClass, LevelableActionParams } from "./LevelableAction";

export class Contract extends LevelableActionClass {
  type: BladeburnerActionType.Contract = BladeburnerActionType.Contract;
  name: BladeburnerContractName = BladeburnerContractName.Tracking;
  get id(): ActionIdentifier {
    return { type: this.type, name: this.name };
  }

  constructor(params: (LevelableActionParams & { name: BladeburnerContractName }) | null = null) {
    super(params);
    if (params) this.name = params.name;
  }

  getActionTypeSkillSuccessBonus(inst: Bladeburner): number {
    return inst.getSkillMult(BladeburnerMultName.SuccessChanceContract);
  }

  toJSON(): IReviverValue {
    return this.save("Contract");
  }

  static fromJSON(value: IReviverValue): Contract {
    return Generic_fromJSON(Contract, value.data);
  }
}

constructorsForReviver.Contract = Contract;
