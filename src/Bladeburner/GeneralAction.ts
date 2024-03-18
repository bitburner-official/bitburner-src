import type { BladeGeneralActionName } from "@enums";
import type { Person } from "src/PersonObjects/Person";
import type { Bladeburner } from "./Bladeburner";
import { Action, ActionParams } from "./Action";

type GeneralActionParams = ActionParams & {
  name: BladeGeneralActionName;
  desc: string;
  getActionTime: (inst: Bladeburner, person: Person) => number;
};

export class GeneralAction extends Action {
  name: BladeGeneralActionName;
  desc: string;
  constructor(params: GeneralActionParams) {
    super(params);
    this.name = params.name;
    this.getActionTime = params.getActionTime;
    this.desc = params.desc;
  }
}
