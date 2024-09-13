import type { Bladeburner } from "../Bladeburner";
import { TypeOfActionId } from "../Types";

import { constructorsForReviver, Generic_fromJSON, IReviverValue } from "../../utils/JSONReviver";
import { BladeburnerActionType, BladeburnerContractName, BladeburnerMultName } from "../Enums";
import { LevelableActionClass, LevelableActionParams } from "./LevelableAction";
import { getEnumHelper } from "../../utils/EnumHelper";

export class Contract extends LevelableActionClass {
  readonly type: BladeburnerActionType.Contract = BladeburnerActionType.Contract;
  readonly name: BladeburnerContractName;

  get id() {
    return Contract.ActionIdentifier(this.name);
  }

  static IsAcceptedName(name: unknown): name is BladeburnerContractName {
    return getEnumHelper("BladeburnerContractName").isMember(name);
  }

  static ActionIdentifier(name: BladeburnerContractName): TypeOfActionId<Contract> {
    return { type: BladeburnerActionType.Contract, name };
  }

  constructor(params: (LevelableActionParams & { name: BladeburnerContractName }) | null = null) {
    super(params);
    this.name = params?.name ?? BladeburnerContractName.Tracking;
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
