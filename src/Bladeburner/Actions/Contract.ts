import type { Bladeburner } from "../Bladeburner";
import type { ActionIdFor } from "../Types";

import type { IReviverValue } from "../../utils/JSONReviver";
import { makeSerializable } from "../../utils/GenericReviver";
import { BladeburnerActionType, BladeburnerContractName, BladeburnerMultName } from "../Enums";
import { LevelableActionClass, LevelableActionParams } from "./LevelableAction";
import { getEnumHelper } from "../../utils/EnumHelper";

export class Contract extends LevelableActionClass {
  readonly type: BladeburnerActionType.Contract = BladeburnerActionType.Contract;
  readonly name: BladeburnerContractName;

  get id() {
    return Contract.createId(this.name);
  }

  static IsAcceptedName(name: unknown): name is BladeburnerContractName {
    return getEnumHelper("BladeburnerContractName").isMember(name);
  }

  static createId(name: BladeburnerContractName): ActionIdFor<Contract> {
    return { type: BladeburnerActionType.Contract, name };
  }

  constructor(params: (LevelableActionParams & { name: BladeburnerContractName }) | null = null) {
    super(params);
    this.name = params?.name ?? BladeburnerContractName.Tracking;
  }

  getActionTypeSkillSuccessBonus(inst: Bladeburner): number {
    return inst.getSkillMult(BladeburnerMultName.SuccessChanceContract);
  }

  // Custom save handling
  jsonReplacer(): IReviverValue {
    return this.save("Contract");
  }

  static includedKeys = makeSerializable("Contract", Contract);
}
