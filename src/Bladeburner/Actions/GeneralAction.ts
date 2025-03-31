import type { Person } from "../../PersonObjects/Person";
import type { Bladeburner } from "../Bladeburner";
import type { ActionIdFor } from "../Types";

import { BladeburnerActionType, BladeburnerGeneralActionName } from "@enums";
import { ActionClass, ActionParams } from "./Action";
import { clampNumber } from "../../utils/helpers/clampNumber";
import { getEnumHelper } from "../../utils/EnumHelper";

type GeneralActionParams = ActionParams & {
  name: BladeburnerGeneralActionName;
  getActionTime: (bladeburner: Bladeburner, person: Person) => number;
  getSuccessChance?: (bladeburner: Bladeburner, person: Person) => number;
};

export class GeneralAction extends ActionClass {
  readonly type: BladeburnerActionType.General = BladeburnerActionType.General;
  readonly name: BladeburnerGeneralActionName;

  get id() {
    return GeneralAction.createId(this.name);
  }

  static IsAcceptedName(name: unknown): name is BladeburnerGeneralActionName {
    return getEnumHelper("BladeburnerGeneralActionName").isMember(name);
  }

  static createId(name: BladeburnerGeneralActionName): ActionIdFor<GeneralAction> {
    return { type: BladeburnerActionType.General, name };
  }

  constructor(params: GeneralActionParams) {
    super(params);
    this.name = params.name;
    this.getActionTime = params.getActionTime;
    if (params.getSuccessChance) this.getSuccessChance = params.getSuccessChance;
  }

  getSuccessChance(__bladeburner: Bladeburner, __person: Person): number {
    return 1;
  }

  getSuccessRange(bladeburner: Bladeburner, person: Person): [minChance: number, maxChance: number] {
    const chance = clampNumber(this.getSuccessChance(bladeburner, person), 0, 1);
    return [chance, chance];
  }
}
