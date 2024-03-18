import type { Person } from "../../PersonObjects/Person";
import type { Bladeburner } from "../Bladeburner";

import { BladeActionType, BladeGeneralActionName } from "@enums";
import { ActionClass, ActionParams } from "./Action";

type GeneralActionParams = ActionParams & {
  name: BladeGeneralActionName;
  getActionTime: (inst: Bladeburner, person: Person) => number;
};

export class GeneralAction extends ActionClass {
  type: BladeActionType.general = BladeActionType.general;
  name: BladeGeneralActionName;
  constructor(params: GeneralActionParams) {
    super(params);
    this.name = params.name;
    this.getActionTime = params.getActionTime;
  }
}
