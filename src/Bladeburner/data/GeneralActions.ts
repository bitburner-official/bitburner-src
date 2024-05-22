import { BladeGeneralActionName } from "@enums";
import { GeneralAction } from "../Actions/GeneralAction";
import { BladeburnerConstants } from "./Constants";

export const GeneralActions: Record<BladeGeneralActionName, GeneralAction> = {
  [BladeGeneralActionName.training]: new GeneralAction({
    name: BladeGeneralActionName.training,
    getActionTime: () => 30,
    desc:
      "Improve your abilities at the Bladeburner unit's specialized training center. Doing this gives experience for " +
      "all combat stats and also increases your max stamina.",
  }),
  [BladeGeneralActionName.fieldAnalysis]: new GeneralAction({
    name: BladeGeneralActionName.fieldAnalysis,
    getActionTime: () => 30,
    desc:
      "Mine and analyze Synthoid-related data. This improves the Bladeburner unit's intelligence on Synthoid locations " +
      "and activities. Completing this action will improve the accuracy of your Synthoid population estimated in the " +
      "current city.\n\n" +
      "Does NOT require stamina.",
  }),
  [BladeGeneralActionName.recruitment]: new GeneralAction({
    name: BladeGeneralActionName.recruitment,
    getActionTime: function (bladeburner, person) {
      const effCharisma = bladeburner.getEffectiveSkillLevel(person, "charisma");
      const charismaFactor = Math.pow(effCharisma, 0.81) + effCharisma / 90;
      return Math.max(10, Math.round(BladeburnerConstants.BaseRecruitmentTimeNeeded - charismaFactor));
    },
    getSuccessChance: function (bladeburner, person) {
      return Math.pow(person.skills.charisma, 0.45) / (bladeburner.teamSize - bladeburner.sleeveSize + 1);
    },
    desc:
      "Attempt to recruit members for your Bladeburner team. These members can help you conduct operations.\n\n" +
      "Does NOT require stamina.",
  }),
  [BladeGeneralActionName.diplomacy]: new GeneralAction({
    name: BladeGeneralActionName.diplomacy,
    getActionTime: () => 60,
    desc:
      "Improve diplomatic relations with the Synthoid population. Completing this action will reduce the Chaos level in " +
      "your current city.\n\n" +
      "Does NOT require stamina.",
  }),
  [BladeGeneralActionName.hyperbolicRegen]: new GeneralAction({
    name: BladeGeneralActionName.hyperbolicRegen,
    getActionTime: () => 60,
    desc:
      "Enter cryogenic stasis using the Bladeburner division's hi-tech Regeneration Chamber. This will slowly heal your " +
      "wounds and slightly increase your stamina.",
  }),
  [BladeGeneralActionName.inciteViolence]: new GeneralAction({
    name: BladeGeneralActionName.inciteViolence,
    getActionTime: () => 60,
    desc:
      "Purposefully stir trouble in the synthoid community in order to gain a political edge. This will generate " +
      "additional contracts and operations, at the cost of increased Chaos.",
  }),
};
