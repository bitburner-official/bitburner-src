import type { Person } from "../../PersonObjects/Person";
import type { Bladeburner } from "../Bladeburner";
import type { ActionIdentifier } from "../Types";

import { BladeActionType, BladeGeneralActionName } from "@enums";
import { ActionClass, ActionParams } from "./Action";

type GeneralActionParams = ActionParams & {
  name: BladeGeneralActionName;
  getActionTime: (bladeburner: Bladeburner, person: Person) => number;
  getSuccessChance?: (bladeburner: Bladeburner, person: Person) => number;
};

export class GeneralAction extends ActionClass {
  type: BladeActionType.general = BladeActionType.general;
  name: BladeGeneralActionName;
  get id(): ActionIdentifier {
    return { type: this.type, name: this.name };
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
    const chance = this.getSuccessChance(bladeburner, person);
    return [chance, chance];
  }
}
