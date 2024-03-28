import type { Bladeburner } from "../Bladeburner";
import type { ActionIdentifier } from "../Types";

import { Generic_fromJSON, IReviverValue, constructorsForReviver } from "../../utils/JSONReviver";
import { BladeActionType, BladeContractName, BladeMultName } from "../Enums";
import { LevelableActionClass, LevelableActionParams } from "./LevelableAction";

export class Contract extends LevelableActionClass {
  type: BladeActionType.contract = BladeActionType.contract;
  name: BladeContractName = BladeContractName.tracking;
  get id(): ActionIdentifier {
    return { type: this.type, name: this.name };
  }

  constructor(params: (LevelableActionParams & { name: BladeContractName }) | null = null) {
    super(params);
    if (params) this.name = params.name;
  }

  getActionTypeSkillSuccessBonus(inst: Bladeburner): number {
    return inst.getSkillMult(BladeMultName.successChanceContract);
  }

  toJSON(): IReviverValue {
    return this.save("Contract");
  }

  static fromJSON(value: IReviverValue): Contract {
    return Generic_fromJSON(Contract, value.data);
  }
}

constructorsForReviver.Contract = Contract;
