//import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
//import { CharityORG } from "../CharityORG";
import { CharityVolunteer } from "../CharityVolunteer";
import { CharityVolunteerTask } from "../CharityVolunteerTask";

export interface FormulaCharity {
  prestige: number;
  visibility: number;
  terror: number;
}

export function calculatePrestigeGain(
  cform: FormulaCharity,
  volunteer: CharityVolunteer,
  task: CharityVolunteerTask,
): number {
  if (task.basePrestige === 0) return 0;
  let statWeight =
    (task.hackWeight / 100) * volunteer.hack +
    (task.strWeight / 100) * volunteer.str +
    (task.defWeight / 100) * volunteer.def +
    (task.dexWeight / 100) * volunteer.dex +
    (task.agiWeight / 100) * volunteer.agi +
    (task.chaWeight / 100) * volunteer.cha;
  statWeight -= 4 * task.difficulty;
  if (statWeight <= 0) return 0;
  const terrorMult = calculateTerrorMult(cform);
  const visibilityMult = calculateVisibilityMult(cform);
  //if (isNaN(territoryMult) || territoryMult <= 0) return 0;
  //const respectMult = calculateWantedPenalty(gang);
  return Math.pow(11 * task.basePrestige * statWeight * terrorMult * visibilityMult, (terrorMult + visibilityMult) / 2);
}

export function calculateKarmaGain(
  cform: FormulaCharity,
  volunteer: CharityVolunteer,
  task: CharityVolunteerTask,
): number {
  if (task.baseKarmaGain === 0) return 0;
  let statWeight =
    (task.hackWeight / 100) * volunteer.hack +
    (task.strWeight / 100) * volunteer.str +
    (task.defWeight / 100) * volunteer.def +
    (task.dexWeight / 100) * volunteer.dex +
    (task.agiWeight / 100) * volunteer.agi +
    (task.chaWeight / 100) * volunteer.cha;
  statWeight -= 4 * task.difficulty;
  if (statWeight <= 0) return 0;
  const terrorMult = calculateTerrorMult(cform);
  const visibilityMult = calculateVisibilityMult(cform);
  //if (isNaN(territoryMult) || territoryMult <= 0) return 0;
  //const respectMult = calculateWantedPenalty(gang);
  return Math.pow(
    11 * task.baseKarmaGain * statWeight * terrorMult * visibilityMult,
    (terrorMult + visibilityMult) / 2 + 0.1,
  );
}

export function calculateMoneyGain(
  cform: FormulaCharity,
  volunteer: CharityVolunteer,
  task: CharityVolunteerTask,
): number {
  if (task.baseMoneySpend === 0) return 0;
  let statWeight =
    (task.hackWeight / 100) * volunteer.hack +
    (task.strWeight / 100) * volunteer.str +
    (task.defWeight / 100) * volunteer.def +
    (task.dexWeight / 100) * volunteer.dex +
    (task.agiWeight / 100) * volunteer.agi +
    (task.chaWeight / 100) * volunteer.cha;
  statWeight -= 4 * task.difficulty;
  if (statWeight <= 0) return 0;
  const terrorMult = calculateTerrorMult(cform);
  const visibilityMult = calculateVisibilityMult(cform);
  //if (isNaN(territoryMult) || territoryMult <= 0) return 0;
  //const respectMult = calculateWantedPenalty(gang);
  return Math.pow(
    5 * task.baseMoneyGain * statWeight * terrorMult * visibilityMult,
    (terrorMult + visibilityMult) / 2 + 0.5,
  );
}
export function calculateMoneySpend(
  cform: FormulaCharity,
  volunteer: CharityVolunteer,
  task: CharityVolunteerTask,
): number {
  if (task.baseMoneySpend === 0) return 0;
  let statWeight =
    (task.hackWeight / 100) * volunteer.hack +
    (task.strWeight / 100) * volunteer.str +
    (task.defWeight / 100) * volunteer.def +
    (task.dexWeight / 100) * volunteer.dex +
    (task.agiWeight / 100) * volunteer.agi +
    (task.chaWeight / 100) * volunteer.cha;
  statWeight -= 4 * task.difficulty;
  if (statWeight <= 0) return 0;
  const terrorMult = calculateTerrorMult(cform);
  const visibilityMult = calculateVisibilityMult(cform);
  //if (isNaN(territoryMult) || territoryMult <= 0) return 0;
  //const respectMult = calculateWantedPenalty(gang);
  return Math.pow(
    5 * task.baseMoneySpend * statWeight * terrorMult * visibilityMult,
    (terrorMult + visibilityMult) / 2 + 0.5,
  );
}

export function calculateVisibilityGain(
  cform: FormulaCharity,
  volunteer: CharityVolunteer,
  task: CharityVolunteerTask,
): number {
  if (task.baseVisibility === 0) return 0;
  let statWeight =
    (task.hackWeight / 100) * volunteer.hack +
    (task.strWeight / 100) * volunteer.str +
    (task.defWeight / 100) * volunteer.def +
    (task.dexWeight / 100) * volunteer.dex +
    (task.agiWeight / 100) * volunteer.agi +
    (task.chaWeight / 100) * volunteer.cha;
  statWeight -= 4 * task.difficulty;
  if (statWeight <= 0) return 0;
  const terrorMult = calculateTerrorMult(cform);
  const visibilityMult = calculateVisibilityMult(cform);
  //if (isNaN(territoryMult) || territoryMult <= 0) return 0;
  //const respectMult = calculateWantedPenalty(gang);
  return Math.pow(
    5 * task.baseVisibility * statWeight * terrorMult * visibilityMult,
    (terrorMult + visibilityMult) / 2 + 0.5,
  );
}

export function calculateTerrorMult(cform: FormulaCharity): number {
  //Terror ranges from 0 - 100%, or 1 - 0.000...
  //Values retured are: at 50% returns 1(no change), at 100% returns .5, at 0 returns 2
  //Formula takes into account 2 -- 1 -- .5
  if (cform.terror === 0.5) {
    // Returns 1 at 50%
    return 1;
  } else if (cform.terror > 0.5) {
    // Range 50.1 - 100%.  Returns .5 at 100% and .999 at near 50%
    return 0.5 / cform.terror; //100% .5 / 1 = .5   50.1%  .5 / .501 = .998
  } else {
    // < .5  Range 49.9% - 0.01  Returns near 2 at near 0 and just over 1 at near 50%
    return 2 - cform.terror * 2;
  }
}

export function calculateVisibilityMult(cform: FormulaCharity): number {
  //Visibility ranges from 0 - 100%, or 1 - 0.000...
  //Values retured are: at 50% returns 1(no change), at 100% returns 2, at 0 returns .5
  //Formula takes into account 2 -- 1 -- .5
  if (cform.visibility === 0.5) {
    // Returns 1 at 50%
    return 1;
  } else if (cform.visibility > 0.5) {
    // Range 50.1 - 100%.  Returns 2 at 100% and just over 1 at near 50%
    return cform.visibility / 0.5; //100% 1 / .5 = 2   50.1%  .501 / .5 = 1.002
  } else {
    // < .5  Range 49.9% - 0.01  Returns .5 at 0 and just below 1 at near 50%
    return cform.visibility + 0.5;
  }
}

export function calculateAscensionPointsGain(exp: number): number {
  return Math.max(exp - 1000, 0);
}

export function calculateAscensionMult(points: number): number {
  return Math.max(Math.pow(points / 2000, 0.5), 1);
}
